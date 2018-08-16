var Discord = require("discord.js");
var axios = require('axios');

var classNames = require('./reference/classNames.js');
var honorRanks = require('./reference/honorRanks.js');

var config = require('./config.js');
var apiKey = config.apiKey;
var apiToken = config.apiToken;
var priceTokenToken = config.priceTokenToken;

const client = new Discord.Client();
client.login(config.clientLogin);


const charImage = "http://render-us.worldofwarcraft.com/character/";
const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);

client.on("message", message =>
{
  var input = message.content.toUpperCase();
  var words = message.content.split(' ');
  var user = message.author.name;

  if(input.startsWith("!CHAR"))
  {
    message.channel.send("Fetching data...")
    .then(message => {
      var charName = words[1];
      var realm = words[2];
      if (!words[2])
      { realm = 'caelestrasz' };
      if (charName) {
        log(`${charName} ${realm}`);
        getCharData(charName, realm)
        .then(response => {
          if(response.status == "nok"){
            message.channel.send("Character not found - try again");
          } else {
            const info = response;
            getHonorRank(info)
            .then(response => {
              let honorRank;
              if(response.title) {
                honorRank = response.title;
              } else {
                honorRank = 'Honor Rank < 5';
              }
              message.delete();
              const imgURL = charImage + info.thumbnail;
              const playerTitles = info.titles;
              const neckPiece = info.items.neck.azeriteItem.azeriteLevel > 0 ? `Heart of Azeroth: ${info.items.neck.azeriteItem.azeriteLevel}` : null
              log(`${info.name}\n${imgURL}`);
              message.channel.send({embed: {
                color: classNames[info.class].color,
                author: {
                  name: checkTitleExists(info.name, playerTitles),
                  url: `https://worldofwarcraft.com/en-us/character/${region}/${charName}`,
                },
                image: {
                  url: imgURL.replace(/(avatar)/g, 'inset')
                },
                fields: [{
                  name: `${info.level} ${info.talents[0].spec.name} ${classNames[info.class].name}`,
                  value: `${info.items.averageItemLevel} iLvl - ${neckPiece}`,
                },
                {
                  name: `__`,
                  value: `${honorRank} - Achievement Pts: ${info.achievementPoints.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                },
                // {
                //   name: "Stats:",
                //   value: `**Crit:** ${info.stats.crit.toFixed(2)}% (${info.stats.critRating}) \n**Haste:** ${info.stats.haste.toFixed(2)}% (${info.stats.hasteRating}) \n**Vers:** ${info.stats.versatilityDamageDoneBonus.toFixed(2)}% (${info.stats.versatility}) \n**Mastery:** ${info.stats.mastery.toFixed(2)}% (${info.stats.masteryRating}),`,
                // },
                // {
                //   name: "Legion Progression:",
                //   value: `**EN:** ${raidProgressCheck(info.progression.raids[35])}, **ToV:** ${raidProgressCheck(info.progression.raids[36])}, **NH:** ${raidProgressCheck(info.progression.raids[37])}, **ToS:** ${raidProgressCheck(info.progression.raids[38])}, **ABT:** ${raidProgressCheck(info.progression.raids[39])}`,
                // },
                // {
                //   name: "Mythic+ dungeons completed:",
                //   value: `**2+:** ${mythicPlusCheck(info, 33096)}  **5+:** ${mythicPlusCheck(info, 33097)}  **10+:** ${mythicPlusCheck(info, 33098)}  **15+:** ${mythicPlusCheck(info, 32028)}`,
                // },
                {
                  name: "Fun fact:",
                  value: funFactCheck(info)
                }],
              }});
            })
            .catch(error =>{
              log(error);
            });
          };
        })
        .catch(error => {
          log(error)
        });
      } else {
        message.channel.send('Please submit a character name (!char *name* *realm*)');
      }
    }
  )};

  if(input.startsWith("!AFFIXES"))
  {
    message.channel.send("Fetching data...")
    .then(message => {
        getMythicPlusAffixes('us')
        .then(response =>
          {
          log(response.data);
          if(response.status == "nok"){
            message.channel.send("Error retrieving data");
          } else {
            message.delete();
            message.channel.send({embed: {
              fields: [{
                name: response.data.affix_details[0].name,
                value: response.data.affix_details[0].description,
              },
              {
                name: response.data.affix_details[1].name,
                value: response.data.affix_details[1].description,
              },
              {
                name: response.data.affix_details[2].name,
                value: response.data.affix_details[2].description,
              },
            ],
          }});
          };
        })
        .catch(error => {
          log(error)
        });
      });
  }

  if(input.startsWith("!TOKEN"))
{
  message.channel.send("Fetching data...")
  .then(message => {
      getWoWTokenPrice('us')
      .then(info => {
        if(info.status == "nok"){
          message.channel.send("Error retrieving data");
        } else {
          message.delete();
          message.channel.send({embed: {
            fields: [{
              name: "Current Token Price",
              value: format((info.price / 10000)),
            },
          ],
        }});
        };
      })
      .catch(error => {
        log(error)
      });
    });
  }

  if(input === "!STATUS")
  {
    var realm = words[1];
    var region = words[2];
    getRealmStatus(realm, region)
    .then(info => {
      if(info.status == "nok"){
        message.channel.send("Error retrieving realm status");
      } else {
        if (info.realms[0].status = true)
        {
          message.channel.send(`'${realm} is **UP**'` );
        } else {
          message.channel.send(`'${realm} is **DOWN**'` );
        }
      };
    })
    .catch(error => {
      log(error)
    });
  }

  if(input === "!HELP")
  {
    message.channel.send('!char character-name server-name');
  }
});

const getCharData = ( charName, region ) =>  {
  return axios(`https://us.api.battle.net/wow/character/${region}/${charName}?fields=items,titles,talents,progression,achievements,stats,statistics&locale=en_US&apikey=${apiKey}`)
    .then(response => response.data)
    .catch(error => {
      console.log(error);
    });
}


const getRealmStatus = ( realm, region ) => {
  return axios(`https://${region}.api.battle.net/wow/realm/status?realms=${realm}&locale=en_${region}&apikey=${apiKey}`)
    .then(response => response.data)
    .catch(error => {
      console.log(error);
    });
}

const getMythicPlusAffixes = region => {
  return axios(`https://raider.io/api/v1/mythic-plus/affixes?region=${region}`)
    .then(response => response)
    .catch(error => {
      log(error);
    });
}

const getWoWTokenPrice = region => {
  return axios(`https://us.api.battle.net/data/wow/token/?namespace=dynamic-us&locale=en_US&access_token=${priceTokenToken}`)
    .then(response => response.data)
    .catch(error => {
      console.log(error);
    });
}

const searchObj = (obj, key, value) => {
  var result = obj.filter(function( e ) {
    return e[key] === value;
  });
  return result;
}

const raidProgressCheck = data => {
  let bossTotal = data.bosses.length;
  function bossKills(type) {
    let kills = [];
    for (var i=0; i < bossTotal; i++)
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


const mythicPlusCheck = (data, criteriaID) =>{
  // var achieves = [11183,11184,11185,11162];
  let criteriaList = data.achievements.criteria;
  let criteriaQty = data.achievements.criteriaQuantity;

  let qty = criteriaQty[criteriaList.indexOf(criteriaID)];
  if(!qty){
    return '-';
  } else {
    return qty;
  }
};

const fetchAchievementInfo = id => {
  log(`getting Achievement data for: ${id}`);
  return axios.get(`https://us.api.battle.net/wow/achievement/${id}?locale=en_US&apikey=${apiKey}`)
    .then(response => {
      console.log('got data!');
      return response.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};

const getHonorRank = data => {
  let achieves = data.achievements.achievementsCompleted;
  let filteredRanks = honorRanks.sort(((a, b) => b - a)).filter(item => 
    achieves.includes(parseInt(item)) ? parseInt(item) : false
  );
    return fetchAchievementInfo(filteredRanks[0]);
};

function checkTitleExists(player, data) {
  if (searchObj(data,'selected', true).length > 0) {
    var activePlayerTitle = searchObj(data,'selected', true)[0].name.replace(/(%s)/g, player);
    return activePlayerTitle;
  } else {
    return player;
  };
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

function format(x) {
  return isNaN(x)?"":x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const log = data => {
  console.log(data);
}

console.log("Beep boop - bot running!");
