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

const getCharData = ( charName, region ) =>  {
  return axios(`https://us.api.battle.net/wow/character/${region}/${charName}?fields=items,titles,talents,progression,achievements,stats,statistics&locale=en_US&apikey=${apiKey}`)
    .then(response => response.data)
    .catch(error => error.response.data);
}

// getCharData('Shaweaver', 'caelestrasz')
// .then(info => console.log(`**2+:** ${mythicPlusCheck(info, 33096)}  **5+:** ${mythicPlusCheck(info, 33097)}  **10+:** ${mythicPlusCheck(info, 33098)}  **15+:** ${mythicPlusCheck(info, 32028)}`));

const raiderIOScore = (region, realm, name) => {
  return axios(`https://www.raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=mythic_plus_scores`)
    .then(response => response.mythic_plus_scores.all)
    .catch(error => error.message);
}
console.log(raiderIOScore('us', 'caelestrasz', 'shaweaver'))

