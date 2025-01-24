const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.login(token); 