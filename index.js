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

function getTimeOfDay() {
    const hour = new Date().getHours();
    return hour < 12 ? 'matin' : 'midi';
}

function formatDate() {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const now = new Date();
    const day = days[now.getDay()];
    const date = now.toLocaleDateString('fr-FR');
    const timeOfDay = getTimeOfDay();
    
    return `${day} ${date} ${timeOfDay}`;
}

client.on('interactionCreate', async interaction => {
    // Gestion des sélections
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'teacher_select') {
            // Stockage temporaire de l'ID du professeur sélectionné
            const teacherId = interaction.values[0];
            await interaction.update({ components: interaction.message.components });
            
        } else if (interaction.customId === 'student_select') {
            // Stockage temporaire des IDs des étudiants sélectionnés
            const studentIds = interaction.values;
            await interaction.update({ components: interaction.message.components });
        }
    }
    
    // Gestion des boutons
    if (interaction.isButton()) {
        if (interaction.customId === 'claim_signature') {
            const teacherSelect = interaction.message.components[0].components[0];
            if (!teacherSelect.data.values || teacherSelect.data.values.length !== 1) {
                await interaction.reply({ 
                    content: 'Veuillez sélectionner un professeur d\'abord', 
                    ephemeral: true 
                });
                return;
            }
            
            const teacherId = teacherSelect.data.values[0];
            try {
                const teacher = await interaction.guild.members.fetch(teacherId);
                const threadUrl = interaction.message.channel.url;
                const formattedDate = formatDate();
                
                await teacher.send(
                    `[${formattedDate}]\n` +
                    `On peut signer ?\n` +
                    `Thread source: ${threadUrl}`
                );
                
                await interaction.reply({ 
                    content: 'Message envoyé au professeur', 
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Erreur lors de l\'envoi du message au professeur:', error);
                await interaction.reply({ 
                    content: 'Erreur lors de l\'envoi du message', 
                    ephemeral: true 
                });
            }
        } else if (interaction.customId === 'remind_selected' || interaction.customId === 'remind_all') {
            const studentSelect = interaction.message.components[0].components[0];
            let studentIds = [];
            
            if (interaction.customId === 'remind_all') {
                studentIds = studentSelect.data.options.map(option => option.value);
            } else {
                if (!studentSelect.data.values || studentSelect.data.values.length === 0) {
                    await interaction.reply({ 
                        content: 'Veuillez sélectionner au moins un étudiant', 
                        ephemeral: true 
                    });
                    return;
                }
                studentIds = studentSelect.data.values;
            }
            
            try {
                const threadUrl = interaction.message.channel.url;
                const formattedDate = formatDate();
                
                for (const studentId of studentIds) {
                    const student = await interaction.guild.members.fetch(studentId);
                    await student.send(
                        `[${formattedDate}]\n` +
                        `Vérifiez votre signature\n` +
                        `Thread source: ${threadUrl}`
                    );
                }
                
                await interaction.reply({ 
                    content: 'Messages envoyés aux étudiants', 
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Erreur lors de l\'envoi des messages aux étudiants:', error);
                await interaction.reply({ 
                    content: 'Erreur lors de l\'envoi des messages', 
                    ephemeral: true 
                });
            }
        }
    }
});

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    console.log('Commandes chargées:', Array.from(client.commands.keys()));
});

client.login(token); 