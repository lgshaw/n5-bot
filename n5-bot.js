var Discord = require("discord.js");
var bnet = require("battlenet-api")('qnehqjeq658chy2ak9qqkp7q4ft9gmu4');
var request = require('request');

var bot = new Discord.Client();
var wow = bnet.wow;
var i = 5;

bot.on("message", message =>
{
  var input = message.content.toUpperCase();
  var words = message.content.split(' ');
  var user = message.author.name;

  if(input === "HI")
  {
    message.reply("Ni hao!");
  }
  if(input == "DBS")
  {
    message.channel.sendMessage("Don't be shit!");
  }
  if(input == "!LEGION")
  {
    message.channel.sendMessage("Legion launches Tuesday 5pm AEST ya silly duffers!");
  }
  if(input == "WOW")
  {
    message.channel.sendMessage( "WoW still loves you.");
  }
  if(user === "Quinas")
  {
    if (i > 0) {
      --i
    } else {
      var random = Math.random() * 10;
      if (random < 5)
        {
          message.channel.sendMessage("Good one Quin. Good one.");
        } else {
          message.channel.sendMessage("Wise words Quin. Elegant in their simplicity.");
        };
    i = 5;
    }
  }
  if(input.startsWith("!LOCKOUT"))
  {
    var userChars = user;
  }
  if(input.startsWith("!CHAR"))
  {
    var charName = words[1];
    if (charName) {
      getCharData(charName, function(info) {
        if(info.status == "nok"){
          message.channel.sendMessage("Character not found - try again");
        } else {
        makeImage = charImage + info.thumbnail;
        message.channel.sendMessage('**' + info.name + '**, ' + classLookup[info.class] + ', Level: ' + info.level + ' ' + info.talents[0].spec.role +', iLvl: ' + info.items.averageItemLevel );
        };
      });
    } else {
      message.channel.sendMessage('Please submit a character name (!char *name*)');
    }
  }
  if(input === "!LIST")
  {
    message.channel.sendMessage('*Tanks:* ' + classList.tanks + '\n' + "*Heals:* " + classList.healers + '\n' + "*DPS:* " + classList.dps);
  }
  if(input === "!STATUS")
  {
    getRealmStatus(function(info) {
      if(info.status == "nok"){
        message.channel.sendMessage("Error retrieving realm status");
      } else {
        if (info.realms[1].status = true)
        {
          message.channel.sendMessage('Caelestrasz is **UP**' );
        } else {
          message.channel.sendMessage('Caelestrasz is **DOWN**' );
        }
      };
    });
  }
});

bot.login("MjE4NzA1NjM1Njk5NTg5MTIx.CqHFCg.sTI60tL_bHvFfO-ksa0biM8-rms");
var apikey = "qnehqjeq658chy2ak9qqkp7q4ft9gmu4";

var charImage = "http://render-api-us.worldofwarcraft.com/static-render/us/";

var classLookup =
  [
    "God",
    "Warrior",
    "Paladin",
    "Hunter",
    "Rogue",
    "Priest",
    "Death Knight",
    "Shaman",
    "Mage",
    "Warlock",
    "Monk",
    "Druid",
    "Demon Hunter",
  ];

var classList =  {
  "tanks": ["Shaweaver", "Rakk"],
  "healers": ["Wadis", "Saltaire"],
  "dps": ["Quinos", "Maelkorin", "Missmini", "Mald"]
};

function getCharData(charName, callback)  {
  request('https://us.api.battle.net/wow/character/Caelestrasz/'+charName+'?fields=items,talents&locale=en_US&apikey='+apikey, function (error, response, result) {
    if (!error && response.statusCode == 200) {
    var info = JSON.parse(result);
    console.log(info);
    callback(info);
  } else {
    var info = JSON.parse(result);
    console.log(info);
    callback(info);
  };
  });
}

function getRealmStatus(callback)  {
  request('https://us.api.battle.net/wow/realm/status?realms=caelestrasz,barthilas&locale=en_US&apikey='+apikey, function (error, response, result) {
    if (!error && response.statusCode == 200) {
    var info = JSON.parse(result);
    console.log(info);
    callback(info);
  } else {
    var info = JSON.parse(result);
    console.log(info);
    callback(info);
  };
  });
}
