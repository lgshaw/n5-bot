import fetch from 'node-fetch';

export const funFactCheck = (data) => {
    var stat;
    var statQty = 0;
    if(data.statistics){
      while(statQty === 0){
          // Get length of subCategories
          var n = getRandomInt(0, data.statistics.subCategories.length);
          // Get all stats within the above subCategory
          var i = getRandomInt(0, data.statistics.subCategories[n].statistics.length);
          stat = data.statistics.subCategories[n].statistics[i].name;
          statQty = data.statistics.subCategories[n].statistics[i].quantity;
      }
  
      return (`${stat}: ${statQty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
    } else {
        return ''
    }
  };

export const getRealmStatus = ( realm, region, token ) => {
    return fetch(`https://${region}.api.blizzard.com/wow/realm/status?realms=${realm}&locale=en_${region}&access_token=${token}`,{ method:'get' })
      .then(response => response.data)
      .catch(error => {
        console.log(error);
      });
  };
  
export const getMythicPlusAffixes = region => {
    return fetch(`https://raider.io/api/v1/mythic-plus/affixes?region=${region}`,{ method:'get' })
      .then(response => response)
      .catch(error => {
        log(error);
      });
  };

export const fetchAchievementInfo = ( id, token ) => {
    log(`getting Achievement data for: ${id}`);
    return fetch(`https://us.api.blizzard.com/wow/achievement/${id}?locale=en_US&access_token=${token}`,{ method:'get' })
      .then(response => {
        console.log('got data!');
        return response.data;
      })
      .catch(error => {
        console.log(error);
        return error;
      });
  };