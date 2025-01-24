const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Chargement des commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Gestion des interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) {
        console.log('Interaction non-commande reçue:', interaction.type);
        return;
    }

    console.log('Commande reçue:', interaction.commandName);
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Aucune commande ${interaction.commandName} n'a été trouvée.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Erreur lors de l\'exécution:', error);
        await interaction.reply({ 
            content: 'Une erreur est survenue lors de l\'exécution de la commande !', 
            ephemeral: true 
        });
    }
});

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    console.log('Commandes chargées:', Array.from(client.commands.keys()));
});

client.login(token); 