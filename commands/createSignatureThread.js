const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { createSignatureEmbed, createReminderEmbed } = require('../utils/embedCreator.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_signature_thread')
        .setDescription('Crée un thread de signature dans le canal de promotion')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal de promotion spécifique')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildForum))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            console.log('Exécution de create_signature_thread');
            const channel = interaction.options.getChannel('channel') || interaction.channel;
            
            let thread;
            if (channel.type === ChannelType.GuildForum) {
                thread = await channel.threads.create({
                    name: 'Signatures',
                    message: {
                        content: 'Thread de signatures créé'
                    },
                    autoArchiveDuration: 60,
                    reason: 'Thread de signature pour la promotion'
                });
            } else if (channel.type === ChannelType.GuildText) {
                thread = await channel.threads.create({
                    name: 'Signatures',
                    autoArchiveDuration: 60,
                    reason: 'Thread de signature pour la promotion'
                });
            } else {
                return interaction.reply({
                    content: 'Cette commande ne peut être utilisée que dans un canal texte ou un forum.',
                    ephemeral: true
                });
            }

            const signatureEmbed = createSignatureEmbed();
            const reminderEmbed = createReminderEmbed();

            await thread.send(signatureEmbed);
            await thread.send(reminderEmbed);

            await interaction.reply({ 
                content: `Thread de signature créé dans ${channel}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Erreur dans create_signature_thread:', error);
            await interaction.reply({ 
                content: `Une erreur est survenue: ${error.message}`, 
                ephemeral: true 
            });
        }
    }
}; 