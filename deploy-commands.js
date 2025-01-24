const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.js');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

// Récupérer l'ID du client depuis le bot token
const clientId = Buffer.from(token.split('.')[0], 'base64').toString();

(async () => {
    try {
        console.log('Déploiement des commandes globales...');
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log('Commandes enregistrées avec succès globalement');
    } catch (error) {
        console.error(error);
    }
})(); 