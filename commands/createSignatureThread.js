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
                .addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            console.log('Exécution de create_signature_thread');
            const channel = interaction.options.getChannel('channel') || interaction.channel;
            
            // Vérifier que le canal est un canal texte
            if (channel.type !== ChannelType.GuildText) {
                return interaction.reply({
                    content: 'Cette commande ne peut être utilisée que dans un canal texte.',
                    ephemeral: true
                });
            }

            // Créer le thread avec un message initial
            const thread = await channel.threads.create({
                name: 'Signatures',
                autoArchiveDuration: 60,
                reason: 'Thread de signature pour la promotion',
                message: {
                    content: 'Thread de signatures créé'
                }
            });

            const signatureEmbed = createSignatureEmbed();
            const reminderEmbed = createReminderEmbed();

            await thread.send({ embeds: [signatureEmbed.embeds], components: signatureEmbed.components });
            await thread.send({ embeds: [reminderEmbed.embeds], components: reminderEmbed.components });

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