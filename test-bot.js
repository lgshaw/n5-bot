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

const getCharData = ( charName, region, token ) =>  {
  return axios(`https://us.api.blizzard.com/wow/character/${region}/${charName}?locale=en_US&fields=items,titles,talents,progression,achievements,stats,statistics&access_token=${token}`)
    .then(response => {
      return {response: response.data, token: token}
    })
    .catch(error => error.response.data);
}

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
  console.log(oAuth.access_token);
  // getMythicData('shaweaver','caelestrasz', token)
  // .then( response => console.log(response))
  // .catch(error => console.log(error));
})
.catch(error => console.log(error));

//callback(var1, var2, response.data.access_token)
