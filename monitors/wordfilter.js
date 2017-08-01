exports.conf = {
    guildOnly: true,
    enabled: true
};

exports.run = async (client, msg, settings) => {
    if (settings.filter.level === 0 ||
        settings.filter.regexp === null ||
        msg.hasLevel(1) ||
        !settings.filter.regexp.test(msg.content)) return false;

    if (msg.deletable) await msg.nuke();
    if ([1, 3].includes(settings.filter.level)) {
        msg.send(`Pardon, dear ${msg.author}, you said something that is not allowed here.`).catch(err => client.emit('log', err, 'error'));
    }

    if (![2, 3].includes(settings.filter.level)) return true;
    const modLogChannel = settings.channels.mod;
    if (!modLogChannel) return true;

    const embed = new client.methods.Embed()
        .setColor(0xefae45)
        .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
        .setFooter(`#${msg.channel.name} | Filtered Word ${settings.filter.regexp.exec(msg.content)[0]}`)
        .setTimestamp();

    return msg.guild.channels.get(modLogChannel).send({ embed });
};
