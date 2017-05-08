const moment = require("moment");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg) => {
  try {
    const now = new Date().getTime();

    if (msg.author.profile.timeDaily + 43200000 > now) {
      const remaining = (msg.author.profile.timeDaily + 43200000) - now;
      msg.alert(`Dailies are available in ${moment.duration(remaining).format("hh [**hours**,] mm [**mins**,] ss [**secs**]")}.`);
    } else {
      const money = await client.Social.win(msg, 200);
      await msg.author.profile.update({ timeDaily: now });

      msg.send(`You have just earned ${money}₪! Next dailies are available in 12 hours.`);
    }
  } catch (e) {
    msg.error(e);
  }
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "daily",
  description: "Get your daily shekels.",
  usage: "",
  usageDelim: " ",
  extendedHelp: "",
};
