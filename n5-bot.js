var Discord = require("discord.js");
var axios = require('axios');

var classNames = require('./reference/classNames.js');
var honorRanks = require('./reference/honorRanks.js');

var config = require('./config.js');
var client_id = config.client_id;
var client_secret = config.client_secret;

var oAuth; //global variable for saving oAuth access_token for future API calls

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
      var charName = encodeURI(words[1]).toLowerCase();
      var realm = words[2];
      if (!words[2])
      { realm = 'caelestrasz' };
      if (charName) {
        log(`${charName} ${realm}`);
        getAuthToken()
        .then(response => {
          log('got oAuth response');
          getCharData(charName, realm, oAuth.access_token)
          .then(response => {
            if(response.status === 'nok'){
              message.channel.send("Character not found - try again");
            } else {
              log('got Profile API response');
              const info = response.data;
              // getHonorRank(info)
              // .then(response => {
              //   let honorRank;
              //   if(response.title) {
              //     honorRank = response.title;
              //   } else {
              //     honorRank = 'Honor Rank < 5';
              //   }
                message.delete();
                // const imgURL = charImage + info.thumbnail;
                // const neckPiece = info.items.neck.azeriteItem.azeriteLevel ? `Heart of Azeroth: ${info.items.neck.azeriteItem.azeriteLevel}` : null;
                // const cloak = info.items.back.quality > 0 ? `Cloak (${info.items.back.itemLevel} ilvl)` : null;
                // log(`${info.name}\n${imgURL}`);
                message.channel.send({embed: {
                  color: classNames[info.character_class.id].color,
                  author: {
                    // name: checkTitleExists(info.name, playerTitles),
                    name: info.active_title.display_string.toString().replace(/(\{(name)\})/g, info.name),
                    url: `https://worldofwarcraft.com/en-us/character/${realm}/${charName}`,
                  },
                  // image: {
                  //   url: imgURL.replace(/(avatar)/g, 'inset')
                  // },
                  fields: [
                    {
                      name: `${info.level} ${info.active_spec.name} ${info.character_class.name}`,
                      value: `${info.average_item_level} iLvl`,
                      // value: `${info.average_item_level} iLvl - ${neckPiece} - ${cloak}`,
                    },
                    {
                      // name: `${honorRank} - Achievement Pts: ${info.achievementPoints.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                      name: `Achievement Pts: ${info.achievement_points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                      value: '_____',
                    },
                    // {
                    //   name: "Raid Progression:",
                    //   value: `**Ny'alotha:** ${raidProgressCheck(info.progression.raids[44])}`,
                    // },
                    // {
                    //   name: "Fun fact:",
                    //   value: funFactCheck(info)
                    // }
                  ],
                }});
              // })
              // .catch(error =>{
              //   log(error);
              // });
            // };
          }})
          .catch(error => log(error));
        })
        .catch(error => log(error));
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
    getAuthToken()
      .then(response => {
        getWoWTokenPrice('us', oAuth.access_token)
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
    })
    .catch(error => {
      log(error)
    })
  })
}

  if(input === "!STATUS")
  {
    var realm = words[1];
    var region = words[2];
    getAuthToken()
    .then(response => {
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

const getAuthToken = () =>  {
  return axios(`https://us.battle.net/oauth/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`)
    .then(response => oAuth = response.data)
    .catch(error => error.response.data);
}

// OLD Community API
// const getCharData = ( charName, region, token ) =>  {
//   return axios(`https://us.api.blizzard.com/wow/character/${region}/${charName}?locale=en_US&fields=items,titles,talents,progression,achievements,stats,statistics&access_token=${token}`)
//     .then(response => response.data)
//     .catch(error => error.response.data);
// }

const getCharData = ( charName, realm, token ) =>  {
  return axios(`https://us.api.blizzard.com/profile/wow/character/${realm}/${charName}?namespace=profile-us&locale=en_US&access_token=${token}`)
    .then(response => {
      return {response: response, token: token}
    })
    .catch(error => error.response.data);
}


const getRealmStatus = ( realm, region, token ) => {
  return axios(`https://${region}.api.blizzard.com/wow/realm/status?realms=${realm}&locale=en_${region}&access_token=${token}`)
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

const getWoWTokenPrice = ( region, token ) => {
  return axios(`https://us.api.blizzard.com/data/wow/token/?namespace=dynamic-us&locale=en_US&access_token=${token}`)
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

const raiderIOScore = (region, realm, name) => {
  return axios(`https://www.raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=mythic_plus_scores`)
    .then(response => response.mythic_plus_scores.all)
    .catch(error => error.message);
}

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

const fetchAchievementInfo = ( id, token ) => {
  log(`getting Achievement data for: ${id}`);
  return axios.get(`https://us.api.blizzard.com/wow/achievement/${id}?locale=en_US&access_token=${token}`)
    .then(response => {
      console.log('got data!');
      return response.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};

const getHonorRank = (data) => {
  let achieves = data.achievements.achievementsCompleted;
  let filteredRanks = honorRanks.sort(((a, b) => b - a)).filter(item => 
    achieves.includes(parseInt(item)) ? parseInt(item) : false
  );
    return fetchAchievementInfo(filteredRanks[0], oAuth.access_token);
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

log("Beep boop - n5 bot running!");
