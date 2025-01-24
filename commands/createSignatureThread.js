const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createSignatureEmbed, createReminderEmbed } = require('../utils/embedCreator.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_signature_thread')
        .setDescription('Crée un thread de signature dans le canal de promotion')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal de promotion spécifique')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        
        const thread = await channel.threads.create({
            name: 'Signatures',
            autoArchiveDuration: 60,
            reason: 'Thread de signature pour la promotion'
        });

        const signatureEmbed = createSignatureEmbed();
        const reminderEmbed = createReminderEmbed();

        await thread.send({ embeds: [signatureEmbed] });
        await thread.send({ embeds: [reminderEmbed] });

        await interaction.reply({ 
            content: `Thread de signature créé dans ${channel}`, 
            ephemeral: true 
        });
    }
}; 