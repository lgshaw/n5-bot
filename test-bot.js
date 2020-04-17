// const countDownToBFA = (endDate, callback) => {
//     let days, hours, minutes, seconds;
    
//     endDate = new Date(endDate).getTime();

//     calculate();
    
//     function calculate() {
//       let startDate = new Date();
//       startDate = startDate.getTime();
      
//       let timeRemaining = parseInt((endDate - startDate) / 1000);
      
//       if (timeRemaining >= 0) {
//         days = parseInt(timeRemaining / 86400);
//         timeRemaining = (timeRemaining % 86400);
        
//         hours = parseInt(timeRemaining / 3600);
//         timeRemaining = (timeRemaining % 3600);
        
//         minutes = parseInt(timeRemaining / 60);
//         timeRemaining = (timeRemaining % 60);
        
//         seconds = parseInt(timeRemaining);

//         return callback(`${days} days, ${hours} hrs, ${minutes}mins`);
        
//       } else {
//         return 'It\'s released you silly sausage. Go and play!';
//       }
//     }
//   }

//   countDownToBFA('08/014/2018 08:00:00 AM', function(timer) {
//       console.log(timer);
//   })
var axios = require('axios');
const fetch = require("node-fetch");

var config = require('./config-dev.js');
var apiKey = config.apiKey;
var apiToken = config.apiToken;
var client_id = config.client_id;
var client_secret = config.client_secret;

var oAuth;

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
const getAuthToken = () =>  {
  return axios(`https://us.battle.net/oauth/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`)
    .then(response => 
      { oAuth = response.data;
        // return token
      })
    .catch(error => error.response.data);
}

const getCharData = ( charName, realm, token ) =>  {
  return axios(`https://us.api.blizzard.com/profile/wow/character/${realm}/${charName}?namespace=profile-us&locale=en_US&access_token=${token}`)
    .then(response => {
      return {response: response.data, token: token}
    })
    .catch(error => error.response.data);
}

const getCharAchievements = ( charName, realm, token ) =>  {
  return axios(`https://us.api.blizzard.com/profile/wow/character/${realm}/${charName}/achievements/statistics?namespace=profile-us&locale=en_US&access_token=${token}`)
    .then(response => {
      //console.log(response);
      return {response: response.data.response, token: token}
    })
    .catch(error => error.response.data);
}

// https://us.api.blizzard.com/profile/wow/character/scarlet-crusade/${charName}?namespace=profile-us
//https://us.api.blizzard.com/profile/wow/character/tichondrius/charactername/achievements?namespace=profile-us&locale=en_US&access_token=USX35eBMoxQm1Y8ahhRxclGx30RVjUbwbs

const getMythicData = ( name, realm, token ) =>  {
  return axios(`https://us.api.blizzard.com/profile/wow/character/${realm}/${name}/mythic-keystone-profile/season/1?namespace=profile-us&locale=en_US&access_token=${token}`)
    .then(response => response)
    .catch(error => error.response);
}


// const raiderIOScore = (region, realm, name) => {
//   return axios(`https://www.raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=mythic_plus_scores`)
//     .then(response => response.mythic_plus_scores.all)
//     .catch(error => error.message);
// }
;
const searchObj = (obj, key) => {
  var result = obj.filter(function( e ) {
    return e[key];
  });
  return result;
}

const checkCloak = (charData, equipmentData) => {
  const cloak = Object.keys(equipmentData).find(key => equipmentData[key] === "Back");
  // if(charData.level == '120' && equipmentData.equipped_items[14]) {
  //   return (`- Cloak: ${equipmentData.equipped_items[14].name_description.display_string}`);
  // } else {
  //   return;
  // }

  return cloak;
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

getAuthToken()
.then( response => {
  const token = oAuth.access_token;
  getCharData('shawry','caelestrasz', oAuth.access_token)
  .then( response => {
      const charData = response.response;
      //console.log(charData);
      const mediaURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/character-media?namespace=profile-us`;
      const raidsURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/encounters/raids?namespace=profile-us`;
      const mPlusURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/mythic-keystone-profile/season/4?namespace=profile-us`
      const dungeonsURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/mythic-keystone-profile?namespace=profile-us`
      //let urls = [mediaURI, charData.achievements.href, charData.mythic_keystone_profile.href, raidsURI, charData.equipment.href, charData.pvp_summary.href];
      let urls = [dungeonsURI]
      urls = urls.map(i => i + `&locale=en_US&access_token=${token}`);

      Promise.all(urls.map(url => 
        axios(url)
        .catch(error => console.log(error))
      ))
      // All the data returned from the Promise:
      .then(data => {
        const test = data[0].data;
        if(test.seasons){
        //   test.seasons.map((data) => {
            const uri = `${[...test.seasons].sort(compareValues('id', 'desc'))[0].key.href}&locale=en_US&access_token=${token}`;
        //   })
            //Object.keys(test.seasons[i]).find(key => test.seasons[key] === '4')
          
          // uri = `${test.seasons[1].key.href}&locale=en_US&access_token=${token}`;
          axios(uri)
          .then(data => {
            //console.log(data.data);
            const topResult = [...data.data.best_runs].sort(compareValues('keystone_level', 'desc'))[0];
            const result = `${topResult.dungeon.name} +${topResult.keystone_level}`;
            console.log(result);
          })
        } else {
          console.log('no data')
        }

        console.log("THIS SHOULD BE LAST");

      })
  })
  .catch(error => console.log(`CharData ERROR:${error}`));
})
.catch(error => console.log(`oAUTH ERROR:${error}`));
