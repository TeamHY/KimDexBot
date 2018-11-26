require("dotenv").config();

const fs = require("fs");
const express = require("express");
const TwitchBot = require("twitch-bot");
const Discord = require("discord.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const models = require("./models");

const app = express();
const settingRouter = express.Router();

let setting = { delaytime: 300000 };
let tipTimer = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/setting", settingRouter);

app.listen(3002, () => {
  console.log("Listening on port 3002!");
});

settingRouter.post("/delaytime", (req, res) => {
  setting.delaytime = parseInt(req.body.time, 10) * 1000 * 60;
  killTips();
  runTips();
  json = JSON.stringify(setting);
  fs.writeFile("setting.json", json, "utf8", err => {
    if (err) {
      console.log(err);
    }
  });
});

settingRouter.get("/delaytime", (req, res) => {
  setting.delaytime
});

const twitchBot = new TwitchBot({
  username: "kimdexbot",
  oauth: process.env.TWITCH_TOKEN,
  channels: ["#iwt2hw"]
});

const discordBot = new Discord.Client();

twitchBot.on("join", channel => {
  console.log(`Joined channel: ${channel}`);

  fs.readFile("setting.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      setting = JSON.parse(data);
      killTips();
      runTips();
    }
  });

  runTips();
});

function runTips() {
  tipTimer = setTimeout(function() {
    models.Tip.findAll().then(tips => {
      let text = tips[getRandomInt(0, tips.length)].text;
      twitchBot.say(text);
      console.log(text);
    });
    runTips();
  }, setting.delaytime);
}

function killTips() {
  clearTimeout(tipTimer);
  tipTimer = 0;
}

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
