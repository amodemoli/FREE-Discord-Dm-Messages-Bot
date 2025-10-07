/*

  ______                   __                            _______                      
 /      \                 |  \                          |       \                     
|  $$$$$$\  ______    ____| $$  ______   __    __       | $$$$$$$\  ______  __     __ 
| $$   \$$ |      \  /      $$ /      \ |  \  /  \      | $$  | $$ /      \|  \   /  \
| $$        \$$$$$$\|  $$$$$$$|  $$$$$$\ \$$\/  $$      | $$  | $$|  $$$$$$\\$$\ /  $$
| $$   __  /      $$| $$  | $$| $$    $$  >$$  $$       | $$  | $$| $$    $$ \$$\  $$ 
| $$__/  \|  $$$$$$$| $$__| $$| $$$$$$$$ /  $$$$\       | $$__/ $$| $$$$$$$$  \$$ $$  
 \$$    $$ \$$    $$ \$$    $$ \$$     \|  $$ \$$\      | $$    $$ \$$     \   \$$$   
  \$$$$$$   \$$$$$$$  \$$$$$$$  \$$$$$$$ \$$   \$$       \$$$$$$$   \$$$$$$$    \$    
                                                                                                                                                                                                                                                                  
                                                                                      
*/
/*
# » Author: Demolition [IR.DE]                                                                                   
# » Website: Demolition.IR                                                                                   
# » Github: github.com/amodemoli                                                                           
# » Discord [Support]: https://discord.gg/MpPJHNCYWw                                                      

*/

/* 
                             HELP GUIDE
Starting Slash Command: /dm
Starting Perfix Command: !dm
🟨 » The Bot Need See Members Perm
*/
const TOKEN = "YOUR_BOT_TOKEN"; /* Your Discord Bot Token With Discord.dev */
const AUTHORIZED_USER_ID = "YOUR_USER_ID"; /* Your UserId (Whitelist System) */
const CLIENT_ID = "YOUR_BOT_CLIENT_ID"; /* Your Bot Client Id (For Registering Slash Commands ) */
const GUILD_ID = "YOUR_SERVER_ID"; /* Your Guild ID  */
const PREFIX = "!"; /* Starting Perfix Command */

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ActivityType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Channel],
});

const EMOJI_SUCCESS = '<:true:1424820055690182686>';
const EMOJI_ERROR = '<:false:1424819972869193945>';
const activeJobs = new Map();

async function deployCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('dm')
            .setDescription('Sends a direct message to members.')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Target scope (this server or all servers).')
                    .setRequired(true)
                    .addChoices(
                        { name: 'This Server', value: 'this' },
                        { name: 'All Servers', value: 'all' }
                    ))
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The message to send. Use \\n for a new line.')
                    .setRequired(true)),
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log('Registering slash commands...');
await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands },
);
        console.log('Successfully registered slash commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

client.once('ready', async () => {
    console.log(`Bot ${client.user.tag} is online successfully.`);
    client.user.setStatus('idle');

    const activities = [
        { name: '⚡ Cadex Development', type: ActivityType.Watching }, 
        { name: '📦 Demolition.IR', type: ActivityType.Watching },
    ];
    let activityIndex = 0;

    setInterval(() => {
        const activity = activities[activityIndex];
        client.user.setActivity(activity.name, { type: activity.type });
        activityIndex = (activityIndex + 1) % activities.length;
    }, 4000);

    try {
        await deployCommands(); 
        console.log('Slash commands deployed.');
    } catch (err) {
        console.error('Failed to deploy commands:', err);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'dm') return;

    if (interaction.user.id !== AUTHORIZED_USER_ID) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`${EMOJI_ERROR} Unkdown SubCommand`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const type = interaction.options.getString('type');
    const messageContent = interaction.options.getString('message').replace(/\\n/g, '\n');

    if (type === 'this') {
        handleThisServer(interaction, messageContent);
    } else if (type === 'all') {
        handleAllServers(interaction, messageContent);
    }
});

client.on('messageCreate', async message => {

    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "dm") {

        if (message.author.id !== AUTHORIZED_USER_ID) {
            return message.reply(`${EMOJI_ERROR} You are not authorized to use this command.`);
        }

        const type = args.shift();
        const msg = args.join(" ");
        if (!type || !msg) {
            return message.reply(`${EMOJI_ERROR} Usage: !dm <this|all> <message>`);
        }
const fakeInteraction = {
    id: `${message.author.id}_${Date.now()}`, 
    user: message.author,
    guild: message.guild,
    reply: async (data) => message.reply(data),
    editReply: async (data) => message.reply(data),
    inGuild: () => !!message.guild,
};


        if (type === "this") {
            await handleThisServer(fakeInteraction, msg);
        } else if (type === "all") {
            await handleAllServers(fakeInteraction, msg);
        } else {
            return message.reply(`${EMOJI_ERROR} Invalid type. Use "this" or "all".`);
        }
    }
});


function formatDuration(seconds) {
    if (seconds === 0) return '0h 0m';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (d > 0) result += `${d}d `;
    result += `${h}h ${m}m`;
    return result.trim();
}

async function startMassDM(interaction, memberList, messageContent, originalResponse) {
    const jobId = interaction.id || `${interaction.user.id}_${Date.now()}`;
    activeJobs.set(jobId, {
        status: 'running',
        sent: 0,
        failed: 0,
        total: memberList.length,
        startTime: Date.now(),
        canceller: null
    });
    
    const updateEmbed = () => {
        const job = activeJobs.get(jobId);
        if (!job) return null;
        const elapsedTime = (Date.now() - job.startTime) / 1000;
        const membersPerSecond = job.sent / elapsedTime || 0;
        const remainingMembers = job.total - job.sent - job.failed;
        const estimatedTimeRemaining = membersPerSecond > 0 ? remainingMembers / membersPerSecond : Infinity;
        
        return new EmbedBuilder()
            .setColor('#00ff00')
            .setDescription(
                `${EMOJI_SUCCESS} The Information Operation Was Successfully Launched (By= \`${interaction.user.username}\`)\n\n` +
                `- 🎯 » Goal: Send A Direct Message To ${job.total} People.\n` +
                `- ⌛ » Estimated Time Remaining: ${isFinite(estimatedTimeRemaining) ? formatDuration(estimatedTimeRemaining) : 'Calculating...'}\n` +
                `- 🟩 » Sended ${job.sent} Dm's.\n` +
                `- 🟥 » Can't Send ${job.failed} Dm's.`
            );
    };

    const cancelButton = new ButtonBuilder().setCustomId(`cancel_${jobId}`).setLabel('Cancel').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(cancelButton);
    await originalResponse.edit({ embeds: [updateEmbed()], components: [row] });
    
    const updateInterval = setInterval(() => {
        const job = activeJobs.get(jobId);
        if (job && job.status === 'running') {
            originalResponse.edit({ embeds: [updateEmbed()] }).catch(() => {});
        }
    }, 3000);

    const collector = originalResponse.createMessageComponentCollector({ time: 86400000 });
    collector.on('collect', async i => {
        if (i.customId === `cancel_${jobId}` && i.user.id === AUTHORIZED_USER_ID) {
            const job = activeJobs.get(jobId);
            job.status = 'canceled';
            job.canceller = i.user.username;
            activeJobs.set(jobId, job);
            await i.deferUpdate();
            collector.stop();
        }
    });

    for (const member of memberList) {
        const job = activeJobs.get(jobId);
        if (job.status !== 'running') break;
        try {
            await member.send(messageContent);
            job.sent++;
        } catch (error) {
            job.failed++;
        }
        activeJobs.set(jobId, job);
        await new Promise(resolve => setTimeout(resolve, 2500));
    }

    clearInterval(updateInterval);
    const finalJobState = activeJobs.get(jobId);
    activeJobs.delete(jobId);
    
    let finalEmbed;
    if (finalJobState.status === 'canceled') {
        finalEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(
                `${EMOJI_ERROR} Operation Canceled. (By= \`${finalJobState.canceller}\`)\n\n` +
                `- 🟩 » Sended: ${finalJobState.sent}\n` +
                `- 🟥 » Failed: ${finalJobState.failed}`
            );
    } else {
        finalEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setDescription(
                `${EMOJI_SUCCESS} Operation Finished!\n\n` +
                `- 🟩 » Sended: ${finalJobState.sent}\n` +
                `- 🟥 » Failed: ${finalJobState.failed}`
            );
    }
    await originalResponse.edit({ embeds: [finalEmbed], components: [] });
}

async function showConfirmation(interaction, memberList, messageContent) {
    const estimatedTime = formatDuration(memberList.length * 2.5);
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setDescription(
            `${EMOJI_SUCCESS} Server Scanning Done.!\n` +
            `- **Estimated Operation Time:** ${estimatedTime}\n` +
            `- Press **Send** Button For Start\n` +
            `- Press **Cansel** Button For Cansel`
        );

    const sendButton = new ButtonBuilder().setCustomId('send').setLabel('Send').setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(sendButton, cancelButton);
    
    const response = await interaction.editReply({ embeds: [embed], components: [row] });
    
    const collector = response.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 300000
    });

    collector.on('collect', async i => {
        await i.deferUpdate();
        if (i.customId === 'send') {
            await startMassDM(interaction, memberList, messageContent, response);
        } else if (i.customId === 'cancel') {
            const cancelEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`${EMOJI_SUCCESS} Operation Canceled. (By= \`${i.user.username}\`)`);
            await response.edit({ embeds: [cancelEmbed], components: [] });
        }
        collector.stop();
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            const timeoutEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription(`${EMOJI_ERROR} Operation Canceled. (AutoCancel)`);
            response.edit({ embeds: [timeoutEmbed], components: [] });
        }
    });
}

async function handleThisServer(interaction, messageContent) {
    const inGuild = typeof interaction.inGuild === 'function' ? interaction.inGuild() : !!interaction.guild;
    if (!inGuild) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`${EMOJI_ERROR} Only Can Use In Channels`);
        return interaction.reply ? interaction.reply({ embeds: [embed], ephemeral: true }) : null;
    }
    await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#00ff00').setDescription(`${EMOJI_SUCCESS} Scanning Server Members...`)],
        fetchReply: true
    });
    
    try {
        await interaction.guild.members.fetch();
        const members = interaction.guild.members.cache.filter(m => !m.user.bot).map(m => m);
        if (members.length === 0) {
            const embed = new EmbedBuilder().setColor('#ff0000').setDescription(`${EMOJI_ERROR} No members found to message.`);
            return interaction.editReply({ embeds: [embed] });
        }
        await showConfirmation(interaction, members, messageContent);
    } catch (error) {
        console.error(error);
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`${EMOJI_ERROR} I Can't See Server Members. Make sure I have permissions and the 'Server Members Intent' is enabled.`);
        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleAllServers(interaction, messageContent) {
    await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#00ff00').setDescription(`${EMOJI_SUCCESS} Scanning all servers... This might take a while.`)],
        fetchReply: true
    });

    const uniqueMembers = new Map();
    try {
        const guilds = await client.guilds.fetch();
        for (const partialGuild of guilds.values()) {
            const guild = await client.guilds.fetch(partialGuild.id);
            const members = await guild.members.fetch();
            members.forEach(member => {
                if (!member.user.bot) {
                    uniqueMembers.set(member.id, member);
                }
            });
        }
        
        const memberList = Array.from(uniqueMembers.values());
        if (memberList.length === 0) {
            const embed = new EmbedBuilder().setColor('#ff0000').setDescription(`${EMOJI_ERROR} No members found across all servers.`);
            return interaction.editReply({ embeds: [embed] });
        }
        await showConfirmation(interaction, memberList, messageContent);
    } catch (error) {
        console.error(error);
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`${EMOJI_ERROR} An error occurred while fetching members. I might be missing permissions in some servers.`);
        await interaction.editReply({ embeds: [embed] });
    }
}


client.login(TOKEN);