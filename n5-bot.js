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
          const token = oAuth.access_token;
          getCharData(charName, realm, token)
          .then(response => {
            if(response.status === 'nok'){
              message.channel.send("Character not found - try again");
            } else {
              log('got Profile API response');
              const charData = response.response.data;
              const mediaURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/character-media?namespace=profile-us`;
              const raidsURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/encounters/raids?namespace=profile-us`;
              const mPlusURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/mythic-keystone-profile?namespace=profile-us`

              let urls = [mediaURI, charData.achievements.href, mPlusURI, raidsURI, charData.equipment.href, charData.pvp_summary.href];
              urls = urls.map(i => i + `&locale=en_US&access_token=${token}`);

              Promise.all(urls.map(url => 
                axios(url)
                .catch(error => console.log(error))
              ))
              // All the data returned from the Promise:
              .then(data => {
                mediaData = data[0].data;
                achievementsData = data[1].data;
                keystoneData = data[2].data;
                encountersData = data[3].data;
                equipmentData = data[4].data;
                pvpData = data[5].data;

                message.delete();
                const imgURL = mediaData.bust_url;
                const neckPiece = charData.level == '120' && `**Neck**: ${equipmentData.equipped_items[1].azerite_details.level.value}`;
                const cloak = checkCloak(equipmentData);

                message.channel.send({embed: {
                  color: classNames[charData.character_class.id].color,
                  author: {
                    name: charData.active_title.display_string.toString().replace(/(\{(name)\})/g, charData.name),
                    url: `https://worldofwarcraft.com/en-us/character/${realm}/${charName}`,
                  },
                  image: {
                    url: imgURL,
                  },
                  fields: [
                    {
                      name: `${charData.level} ${charData.active_spec.name} ${charData.character_class.name}`,
                      value: `${charData.average_item_level} iLvl - ${neckPiece} ${cloak}`,
                    },
                    {
                      name: `Honor rank: ${pvpData.honor_level} - Achievement Pts: ${charData.achievement_points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                      value: '_____',
                    },
                    {
                      name: "Progression:",
                      // TODO: Currently failing if they havent done a M+ in season 4.
                      value: `${raidProgressCheck(encountersData)}\n${mPlusProgressCheck(keystoneData, token)}`,
                    },
                    // {
                    //   name: "Fun fact:",
                    //   value: funFactCheck(info)
                    // }
                  ],
                }});
              }).catch(error => log(error));
            }
          })
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
        .then(response => {
          if(response.status == "nok"){
            message.channel.send("Error retrieving data");
          } else {
            message.delete();
            message.channel.send({embed: {
              fields: [{
                name: "Current Token Price",
                value: format((response.price / 10000)),
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
      .then(response => {
        if(response.status == "nok"){
          message.channel.send("Error retrieving realm status");
        } else {
          if (response.realms[0].status = true)
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

const checkCloak = (equipmentData) => {

  const backObj = equipmentData.equipped_items.filter(obj => {          
    return obj.slot.name === 'Back'
  })

  const cloak = Object.assign(...backObj);

  if(cloak.name_description) {
    return `- **Cloak**: ${cloak.name_description.display_string}`;
  } else {
    return '';
  }
};

const raidProgressCheck = (data) => {
  if(data.expansions){
    const [bfa] = data.expansions.slice(-1);
    const [nya] = bfa.instances.slice(-1);
    const [mode] = nya.modes.slice(-1);

    return `**${nya.instance.name}**: ${mode.progress.completed_count}/${mode.progress.total_count} ${mode.difficulty.type}`
  } else {
    return '`-`';
  };
};

const mPlusProgressCheck = (data, token) => {
  if(data.seasons){
    const uri = `${[...data.seasons].sort(compareValues('id', 'desc'))[0].key.href}&locale=en_US&access_token=${token}`;

    axios(uri)
    .then(data => {    
      const topResult = data.data.best_runs.sort(compareValues('keystone_level', 'desc'))[0];
      const formatted = '`**M+**: ${topResult.dungeon.name} +${topResult.keystone_level}`';
      return formatted;
    })
    .catch(error => error)
  } else {
    console.log('no M+ data found');
    return '';
  }
}

const raiderIOScore = (region, realm, name) => {
  return axios(`https://www.raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=mythic_plus_scores`)
    .then(response => response.mythic_plus_scores.all)
    .catch(error => error.message);
}

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

const compareValues = (key, order = 'asc') => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

const log = data => {
  console.log(data);
}

log("Beep boop - n5 bot running!");
