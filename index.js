const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
    // Gestion des commandes slash
    if (interaction.isChatInputCommand()) {
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
        return;
    }

    // Gestion des sélections et boutons
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'teacher_select') {
            const teacherId = interaction.values[0];
            
            // Récupère les composants actuels et préserve la sélection
            const teacherSelect = ActionRowBuilder.from(interaction.message.components[0]);
            teacherSelect.components[0].setOptions(
                teacherSelect.components[0].options.map(option => ({
                    ...option,
                    default: option.value === teacherId
                }))
            );

            const claimButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('claim_signature')
                        .setLabel('Réclamer le code')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false)
                );

            await interaction.update({ 
                components: [teacherSelect, claimButton]
            });
            
        } else if (interaction.customId === 'student_select') {
            const studentIds = interaction.values;
            
            // Récupère les composants actuels et préserve les sélections
            const studentSelect = ActionRowBuilder.from(interaction.message.components[0]);
            studentSelect.components[0].setOptions(
                studentSelect.components[0].options.map(option => ({
                    ...option,
                    default: studentIds.includes(option.value)
                }))
            );

            const reminderButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('remind_selected')
                        .setLabel('Rappeler les sélectionnés')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(studentIds.length === 0),
                    new ButtonBuilder()
                        .setCustomId('remind_all')
                        .setLabel('Rappeler tous')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.update({ 
                components: [studentSelect, reminderButtons]
            });
        }
    }
    
    if (interaction.isButton()) {
        if (interaction.customId === 'claim_signature') {
            const teacherSelect = interaction.message.components[0].components[0];
            const selectedTeacherId = teacherSelect.options.find(option => option.default)?.value;
            
            if (!selectedTeacherId) {
                await interaction.reply({ 
                    content: 'Veuillez sélectionner un professeur d\'abord', 
                    ephemeral: true 
                });
                return;
            }
            
            try {
                const teacher = await interaction.guild.members.fetch(selectedTeacherId);
                const threadUrl = interaction.message.channel.url;
                const formattedDate = formatDate();
                
                await teacher.send(
                    `[${formattedDate}]\n` +
                    `On peut signer ?\n` +
                    `Thread source: ${threadUrl}`
                );
                
                // Désactive le bouton après l'envoi
                const teacherSelect = ActionRowBuilder.from(interaction.message.components[0]);
                const claimButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('claim_signature')
                            .setLabel('Réclamer le code')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );

                await interaction.message.edit({ 
                    components: [teacherSelect, claimButton]
                });
                
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
                studentIds = studentSelect.options.map(option => option.value);
            } else {
                studentIds = interaction.values || [];
                if (studentIds.length === 0) {
                    await interaction.reply({ 
                        content: 'Veuillez sélectionner au moins un étudiant', 
                        ephemeral: true 
                    });
                    return;
                }
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
                    content: `Messages envoyés à ${studentIds.length} étudiant(s)`, 
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

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    console.log('Commandes chargées:', Array.from(client.commands.keys()));
});

client.login(token); 