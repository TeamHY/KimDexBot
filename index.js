require("dotenv").config();

const TwitchBot = require("twitch-bot");
const Discord = require("discord.js");
const models = require("./models");

const twitchBot = new TwitchBot({
  username: "kimdexbot",
  oauth: process.env.TWITCH_TOKEN,
  channels: ["#iwt2hw"]
});

const discordBot = new Discord.Client();

twitchBot.on("join", channel => {
  console.log(`Joined channel: ${channel}`);

  setInterval(() => {
    models.Tip.findAll().then(tips => {
      let text = tips[getRandomInt(0, tips.length)].text;
      twitchBot.say(text);
      console.log(text);
    });
  }, 300000);
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

discordBot.on("ready", () => {
  console.log(`Logged in as ${discordBot.user.tag}!`);
});

twitchBot.on("error", err => {
  console.log(err);
});

discordBot.on("error", err => {
  console.log(err);
});

twitchBot.on("message", chatter => {
  if (chatter.message.charAt(0) != "!") {
    return;
  }

  const reg = /^\!(\d{3})$/;
  const message = chatter.message.replace(reg, "$1");
  if (!message) {
    return;
  }

  const id = parseInt(message, 10);
  if (!id && id !== 0) {
    return;
  }

  models.Collectible.findOne({
    where: {
      id: id
    }
  }).then(collectible => {
    if (!collectible) {
      twitchBot.say(`(${pad(id, 3)})해당 아이템을 찾을 수 없습니다.`);
    }

    twitchBot.say(getCollectibleText(collectible));
  });
});

discordBot.on("message", msg => {
  if (msg.content.charAt(0) != "!") {
    return;
  }

  const reg = /^\!(\d{3})$/;
  const message = msg.content.replace(reg, "$1");
  if (!message) {
    return;
  }

  const id = parseInt(message, 10);
  if (!id && id !== 0) {
    return;
  }

  models.Collectible.findOne({
    where: {
      id: id
    }
  }).then(collectible => {
    if (!collectible) {
      msg.reply(`(${pad(id, 3)})해당 아이템을 찾을 수 없습니다.`);
    }

    msg.reply(getCollectibleText(collectible));
  });
});

discordBot.login(process.env.DISCORD_TOKEN);

function getBotMsg(msg) {
  if (msg.charAt(0) != "!") {
    return false;
  }

  const reg = /^\!(\d{3})$/;
  const message = msg.replace(reg, "$1");
  if (!message) {
    return false;
  }

  const id = parseInt(message, 10);
  if (!id && id !== 0) {
    return false;
  }

  models.Collectible.findOne({
    where: {
      id: id
    }
  }).then(collectible => {
    if (!collectible) {
      return `(${pad(id, 3)})해당 아이템을 찾을 수 없습니다.`;
    }

    return getCollectibleText(collectible);
  });
}

function getCollectibleText(collectible) {
  return `(${pad(collectible.id, 3)})${collectible.name}(${
    collectible.actived ? "A" : "P"
  }) : ${collectible.description}`;
}

function pad(n, width) {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
}
