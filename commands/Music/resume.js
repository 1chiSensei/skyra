const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg) => {
    managerMusic.requiredVC(client, msg);
    const musicInterface = managerMusic.get(msg.guild.id);
    if (musicInterface.status === "playing") throw "I am already playing a song.";
    managerMusic.get(msg.guild.id).resume();
    return msg.send("▶ Resumed");
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 10,
    guilds: managerMusic.guilds,
};

exports.help = {
    name: "resume",
    description: "Resume the current song.",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
