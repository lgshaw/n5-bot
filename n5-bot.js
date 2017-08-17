var Discord = require("discord.js");
var bnet = require("battlenet-api")('qnehqjeq658chy2ak9qqkp7q4ft9gmu4');
var request = require('request');

var classLookup = require('./classLookup.js');

var bot = new Discord.Client();
var wow = bnet.wow;
var i = 5;

const sumValues = obj => Object.values(obj).reduce((a, b) => a + b)

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
    message.channel.send("Don't be shit!");
  }
  if(input == "!LORING")
  {
    var random = Math.random() * 10;
    if (random < 5)
      {
        message.channel.send("Good one Quin. Good one.");
      } else {
        message.channel.send("Wise words Quin. Elegant in their simplicity.");
      };
  }
  if(input == "WOW")
  {
    message.channel.send( "WoW still loves you.");
  }
  if(user === "Quinas")
  {
    if (i > 0) {
      --i
    } else {
      var random = Math.random() * 10;
      if (random < 5)
        {
          message.channel.send("Good one Quin. Good one.");
        } else {
          message.channel.send("Wise words Quin. Elegant in their simplicity.");
        };
    i = 5;
    }
  }

  if(input.startsWith("!CHAR"))
  {
    message.channel.send("Fetching data...");
    var charName = words[1];
    var region = words[2];
    if (!words[2])
    { region = "caelestrasz" };
    if (charName) {
      getCharData(charName, region, function(info) {
        if(info.status == "nok"){
          message.channel.send("Character not found - try again");
        } else {
        imgURL = charImage + info.thumbnail;
        playerTitles = info.titles;
        console.log(info.name);
        var artifactRank = artifactWeapon(info);
        var activePlayerTitle = searchObj(playerTitles, true)[0].name.replace(/([%s])/g, "");
        console.log(activePlayerTitle);
        message.channel.send({embed: {
          color: classLookup[info.class].color,
          author: {
            name: info.name + activePlayerTitle,
            url: `https://worldofwarcraft.com/en-us/character/${region}/${charName}`,
          },
          thumbnail: {
            url: imgURL
          },
          fields: [{
            name: info.talents[0].spec.name + ' ' + classLookup[info.class].name,
            value: info.items.averageItemLevel +  ' iLvl - Artifact Rank: ' + artifactRank,
          },
          {
            name: "Armory",
            value: "NYI",
          },
          {
            name: "Raid progression",
            value: "NYI",
          },
        ],
        }});
        };
      });
    } else {
      message.channel.send('Please submit a character name (!char *name*)');
    }
  }

  if(input === "!STATUS")
  {
    getRealmStatus(function(info) {
      if(info.status == "nok"){
        message.channel.send("Error retrieving realm status");
      } else {
        if (info.realms[1].status = true)
        {
          message.channel.send('Caelestrasz is **UP**' );
        } else {
          message.channel.send('Caelestrasz is **DOWN**' );
        }
      };
    });
  }
});

bot.login("MjE4NzA1NjM1Njk5NTg5MTIx.CqHFCg.sTI60tL_bHvFfO-ksa0biM8-rms");
var apikey = "qnehqjeq658chy2ak9qqkp7q4ft9gmu4";

var charImage = "http://render-us.worldofwarcraft.com/character/";



function getCharData(charName, region, callback)  {
  request(`https://us.api.battle.net/wow/character/${region}/${charName}?fields=items,titles,talents,progression&locale=en_US&apikey=${apikey}`, function (error, response, result) {
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

function searchObj (obj, value) {
  var result = obj.filter(function( e ) {
    return e.selected === value;
  });
  return result;
}

function artifactWeapon(info) {
  if (info.items.mainHand.artifactTraits.length < 1) {
    return
  }
  var result = (sumValues(info.items.mainHand.artifactTraits.map(function(a) { return a.rank;})))-3;
  return result;
};
