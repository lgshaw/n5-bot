import Discord from "discord.js";

import getAuthToken from './util/getAuthToken.js';
import { format, log } from './util/utilFunctions.js';
import { getAllTheData } from './util/characterFunctions.js';
import { funFactCheck, getRealmStatus, getMythicPlusAffixes } from './util/miscFunctions.js';

import config from './config.js';
const client_id = config.client_id;
const client_secret = config.client_secret;

let oAuth; //global variable for saving oAuth access_token for future API calls

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
        message.channel.send('Fetching data...');

        getAllTheData('shaweaver','caelestrasz', client_id, client_secret)
        .then(data => {
          message.delete();
          message.channel.send({embed: {
            color: data.class_color,
            author: {
              name: data.name,
              url: `https://worldofwarcraft.com/en-us/character/${realm}/${charName}`,
            },
            image: {
              url: data.img_url,
            },
            fields: [
              {
                name: data.name,
                value: `${data.iLvl} iLvl`,
              },
              {
                name: `Honor rank: ${data.honor_level} - Achievement Pts: ${data.achievement_points}`,
                value: '_____',
              },
              {
                name: "Progression:",
                value: data.raid_progress,
              },
              // {
              //   name: "Fun fact:",
              //   value: funFactCheck(info)
              // }
            ],
          }});
        })
        .catch(() => {
          message.delete();
          message.channel.send('An error occured. I failed.');
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
        .then(response => response.json())
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

// const mPlusProgressCheck = async (data, token)  => {
//   if(data.seasons){
//     const uri = `${[...data.seasons].sort(compareValues('id', 'desc'))[0].key.href}&locale=en_US&access_token=${token}`;
//     let result;

//     const getData = await axios(uri)
//     .then(data => {    
//       const topResult = data.data.best_runs.sort(compareValues('keystone_level', 'desc'))[0];
//       const formatted = `**M+**: ${topResult.dungeon.name} +${topResult.keystone_level}`;

//       result = formatted;
//     })

//     return result;
//   } else {
//     console.log('no M+ data found');
//     return '';
//   }
// }



log("Beep boop - n5 bot running!");
