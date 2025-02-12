const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createSignatureEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('Signature Code')
        .setColor('#0099ff')
        .setDescription('Sélectionnez un professeur et réclamez votre code de signature');

    const teacherSelect = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('teacher_select')
                .setPlaceholder('Sélectionnez un professeur')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions([
                    {
                        label: 'Yohan',
                        value: '223812446312202251',
                        description: 'Yohan le testeur'
                    },
                    ...Array.from({ length: 24 }, (_, i) => ({
                        label: `Professeur Test ${i + 1}`,
                        value: `prof_test_${i + 1}`,
                        description: `Professeur de test ${i + 1}`
                    }))
                ])
        );

    const claimButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('claim_signature')
                .setLabel('Réclamer le code')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
        );

    return {
        embeds: [embed],
        components: [teacherSelect, claimButton]
    };
}

function createReminderEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('Signature Code')
        .setColor('#ff9900')
        .setDescription('Sélectionnez les étudiants à rappeler');

    const studentSelect = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('student_select')
                .setPlaceholder('Sélectionnez les étudiants')
                .setMinValues(1)
                .setMaxValues(25)
                .addOptions([
                    {
                        label: 'Yohan',
                        value: '223812446312202251',
                        description: 'Yohan l\'étudiant'
                    },
                    ...Array.from({ length: 24 }, (_, i) => ({
                        label: `Étudiant Test ${i + 1}`,
                        value: `student_test_${i + 1}`,
                        description: `Étudiant de test ${i + 1}`
                    }))
                ])
        );

    const reminderButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('remind_selected')
                .setLabel('Rappeler les sélectionnés')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('remind_all')
                .setLabel('Rappeler tous')
                .setStyle(ButtonStyle.Danger)
        );

    return {
        embeds: [embed],
        components: [studentSelect, reminderButtons]
    };
}

module.exports = {
    createSignatureEmbed,
    createReminderEmbed
}; 