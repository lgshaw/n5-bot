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

getAuthToken()
.then( response => {
  const token = oAuth.access_token;
  getCharData('shaweaver','caelestrasz', oAuth.access_token)
  .then( response => {
      const charData = response.response;
      //console.log(charData);
      const mediaURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.name.toLowerCase()}/${charData.name.toLowerCase()}/character-media?namespace=profile-us`;
      let urls = [mediaURI, charData.achievements.href, charData.mythic_keystone_profile.href, charData.encounters.href, charData.equipment.href, charData.pvp_summary.href];
      urls = urls.map(i => i + `&locale=en_US&access_token=${token}`);

      Promise.all(urls.map(url => 
        axios(url)
        .catch(error => console.log(error))
      ))
      // All the data returned from the Promise:
      .then(data => {
        console.log(data[4].data.equipped_items[14]);
      })
  })
  .catch(error => console.log(`CharData ERROR:${error}`));
})
.catch(error => console.log(`oAUTH ERROR:${error}`));
