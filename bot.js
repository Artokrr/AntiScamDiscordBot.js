require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Fetching from .env file
const token = process.env.DISCORD_TOKEN;
const IMPORTANT_ROLES = process.env.IMPORTANT_ROLES.split(/,\s*|,\s*/);
const ADMIN_CHANNEL = process.env.ADMIN_CHANNEL;

let importantUsers = [];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await updateImportantUsersList();
});

async function updateImportantUsersList() {
    const guild = client.guilds.cache.first(); // Assumes the bot is in only one guild
    if (!guild) return;

    importantUsers = [];

    const members = await guild.members.fetch();
    members.forEach(member => {
        IMPORTANT_ROLES.forEach(roleName => {
            const role = guild.roles.cache.find(role => role.name === roleName);
            if (role && member.roles.cache.has(role.id)) {
                importantUsers.push({
                    id: member.id,
                    nickname: member.nickname || member.user.username
                });
            }
        });
    });

    console.log('Important Users:', importantUsers);
}

function containsLink(text) {
    const linkPattern = /\b\w+\.\w+\b/;
    return linkPattern.test(text);
}

// Function to check if the nickname matches any important user's nickname
function isImpersonatingImportantUser(nickname, userId) {
    return importantUsers.some(user => user.nickname === nickname && user.id !== userId) && !importantUsers.some(user => user.id === userId);
}

client.on('messageCreate', message => {
    if (message.author.bot) return; // Ignore bot messages

    //If user has nickname of some of the admins, delete his message
    const nickname = message.member.nickname || message.author.username;
    const userId = message.author.id;
    const messageContent = message.content;

    // Check if the message contains a link and if the user is not an important user
    if (containsLink(messageContent) && !importantUsers.some(user => user.id == userId)) {
        message.delete()
            .then(() => console.log(`Deleted link message from ${message.author.tag} (User ID: ${userId})`))
            .catch(console.error);

        // Notify admins
        const adminChannel = client.channels.cache.find(channel => channel.name === ADMIN_CHANNEL);
        if (adminChannel) {
            adminChannel.send(`Link message detected and deleted from <@${userId}> (User ID: ${userId}) (Message: ${messageContent}).`);
        }
        return;
    }

    // Check if the user is impersonating an important user
    if (isImpersonatingImportantUser(nickname, userId)) {
        message.delete()
            .then(() => console.log(`Deleted message from impersonator ${nickname} (User ID: ${userId})`))
            .catch(console.error);

        // Notify admins
        const adminChannel = client.channels.cache.find(channel => channel.name === ADMIN_CHANNEL);
        if (adminChannel) {
            adminChannel.send(`Message from impersonator <@${userId}> was deleted (User ID: ${userId}) (Message: ${messageContent}).`);
        }
        return;
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    await updateImportantUsersList;

    const oldNickname = oldMember.nickname || oldMember.user.username;
    const newNickname = newMember.nickname || newMember.user.username;
    const userId = newMember.id;

    // Check if the user changed their nickname to match an important user's nickname
    if (! oldNickname !== newNickname && isImpersonatingImportantUser(newNickname, userId)) {
        // Notify admins
        const adminChannel = client.channels.cache.find(channel => channel.name === ADMIN_CHANNEL);
        if (adminChannel) {
            adminChannel.send(`<@${userId}> changed nickname from ${oldNickname} to ${newNickname}, which matches an important user's nickname, but the user is not the real important user.`);
        }
    }
});

// Schedule regular updates to keep the important list current
setInterval(updateImportantUsersList, 10 * 60 * 1000); // Update every 10 minutes

// Log in to Discord with your app's token
client.login(token);
