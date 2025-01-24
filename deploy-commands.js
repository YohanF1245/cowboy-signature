const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId } = require('./config.js');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    console.log(`Commande chargée: ${command.data.name}`);
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Début du déploiement des commandes...');
        console.log(`Nombre de commandes à déployer: ${commands.length}`);
        
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        
        console.log(`Déploiement réussi de ${data.length} commandes`);
        console.log('Commandes déployées:', data.map(cmd => cmd.name).join(', '));
    } catch (error) {
        console.error('Erreur lors du déploiement:');
        console.error(error);
    }
})(); 