var Discord = require("discord.js");
var bnet = require("battlenet-api")('qnehqjeq658chy2ak9qqkp7q4ft9gmu4');
var request = require('request');

var classLookup = require('./classLookup.js');
var config = require('./config.js');

var client = new Discord.Client();
var wow = bnet.wow;

client.login("MjE4NzA1NjM1Njk5NTg5MTIx.CqHFCg.sTI60tL_bHvFfO-ksa0biM8-rms");
var apikey = config.apikey;

const charImage = "http://render-us.worldofwarcraft.com/character/";
const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);

client.on("message", message =>
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

  if(input.startsWith("!CHAR"))
  {
    message.channel.send("Fetching data...")
    .then(message => {
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
            console.log(`${info.name}\n${imgURL}`);
            playerTitles = info.titles;
            message.channel.send({embed: {
              color: classLookup[info.class].color,
              author: {
                name: checkTitleExists(info.name, playerTitles),
                url: `https://worldofwarcraft.com/en-us/character/${region}/${charName}`,
              },
              /*thumbnail: {
                url: imgURL
              },*/
              image: {
                url: imgURL.replace(/(avatar)/g, 'inset')
              },
              fields: [{
                name: `${info.level} ${info.talents[0].spec.name} ${classLookup[info.class].name}`,
                value: `${info.items.averageItemLevel} iLvl - Artifact Rank: ${artifactWeapon(info)}`,
              },
              {
                name: "Legion Progression:",
                value: `**EN:** ${raidProgressCheck(info.progression.raids[35])}, **ToV:** ${raidProgressCheck(info.progression.raids[36])}, **NH:** ${raidProgressCheck(info.progression.raids[37])}, **ToS:** ${raidProgressCheck(info.progression.raids[38])}`,
              },
              {
                name: "Mythic+ dungeons completed:",
                value: `**2+:** ${mythicPlusCheck(info, 33096)}  **5+:** ${mythicPlusCheck(info, 33097)}  **10+:** ${mythicPlusCheck(info, 33098)}  **15+:** ${mythicPlusCheck(info, 32028)}`,
              },
              {
                name: "Fun fact:",
                value: funFactCheck(info)
              }
            ],
          }});
          };
        });
      } else {
        message.channel.send('Please submit a character name (!char *name*)');
      }
    }
  )};

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

function getCharData(charName, region, callback)  {
  request(`https://us.api.battle.net/wow/character/${region}/${charName}?fields=items,titles,talents,progression,achievements,statistics&locale=en_US&apikey=${apikey}`, function (error, response, result) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(result);
      callback(info);
    } else {
      var info = JSON.parse(result);
      callback(info);
    };
  });
}

function getRealmStatus(callback)  {
  request(`https://us.api.battle.net/wow/realm/status?realms=caelestrasz,barthilas&locale=en_US&apikey=${apikey}`, function (error, response, result) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(result);
      callback(info);
    } else {
      var info = JSON.parse(result);
      callback(info);
    };
  });
}

function searchObj (obj, key, value) {
  var result = obj.filter(function( e ) {
    return e[key] === value;
  });
  return result;
}

function raidProgressCheck(data) {
  var bossTotal = data.bosses.length;
  function bossKills(type) {
    var kills = [];
    for (i=0; i < bossTotal; i++)
      {
          var n = data.bosses[i][type];
			    if(n > 0){
            kills.push(n);
          }
      }
    return kills.length;
  };
  if(data.mythic > 0){
    return `${bossKills('mythicKills')}/${bossTotal} M`;
  } else if(data.heroic > 0){
    return `${bossKills('heroicKills')}/${bossTotal} H`;
  } else if(data.normal > 0){
    return `${bossKills('normalKills')}/${bossTotal} N`;
  } else if(data.lfr > 0){
    return `${bossKills('lfrKills')}/${bossTotal} LFR`;
  } else {
    return '`-`';
  };
};

function mythicPlusCheck(data, criteriaID){
  // var achieves = [11183,11184,11185,11162];
  var criteriaList = data.achievements.criteria;
  var criteriaQty = data.achievements.criteriaQuantity;

  var qty = criteriaQty[criteriaList.indexOf(criteriaID)];
  if(!qty){
    return '-';
  } else {
    return qty;
  }
};

function checkTitleExists(player, data) {
  if (searchObj(data,'selected', true).length > 0) {
    var activePlayerTitle = searchObj(playerTitles,'selected', true)[0].name.replace(/(%s)/g, player);
    return activePlayerTitle;
  } else {
    return player;
  };
};

function artifactWeapon(info) {
  var weapon = 'mainHand';
  if (info.items.mainHand.artifactTraits.length < 1) {
    weapon = 'offHand';
    if (!info.items.offHand || info.items.offHand.artifactTraits.length < 1) {
    weapon = false;
    }
  };
  console.log(weapon);
  if(weapon){
    var result = (sumValues(info.items[weapon].artifactTraits.map(function(a) { return a.rank;})))-3;
  } else {
    result = '-';
  };
  return result;
};

function funFactCheck(data) {
  var stat;
  var statQty = 0;
	while(statQty === 0){
        // Get length of subCategories
        var n = getRandomInt(0, data.statistics.subCategories.length);
        // Get all stats within the above subCategory
        var i = getRandomInt(0, data.statistics.subCategories[n].statistics.length);
        stat = data.statistics.subCategories[n].statistics[i].name;
        statQty = data.statistics.subCategories[n].statistics[i].quantity;
    }

    return (`${stat}: ${statQty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

console.log("Beep boop - bot running!");
