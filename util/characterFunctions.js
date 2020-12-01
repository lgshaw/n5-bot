import fetch from 'node-fetch';
import Promise from 'promise';

import getAuthToken from './getAuthToken.js';
import classNames from '../reference/classNames.js';
import { searchObj } from './utilFunctions.js';

export const getCharData = async ( charName, realm, token ) =>  {
    return await fetch(`https://us.api.blizzard.com/profile/wow/character/${realm}/${charName}?namespace=profile-us&locale=en_US&access_token=${token}`)
    .then(response => response.json())
    .then(json => json)
    .catch(error => error.response.data)
}

export const getCharAchievements = async ( charName, realm, token ) =>  {
    return fetch(`https://us.api.blizzard.com/profile/wow/character/${realm}/${charName}/achievements/statistics?namespace=profile-us&locale=en_US&access_token=${token}`)
    .then(response => {
    //console.log(response);
    return {response: response.data.response, token: token}
    })
    .catch(error => error.response.data);
}

export const raidProgressCheck = (data) => {
    if(data.expansions){
      const [bfa] = data.expansions.slice(-1);
      const [nya] = bfa.instances.slice(-1);
      const [mode] = nya.modes.slice(-1);
  
      return `**${nya.instance.name}**: ${mode.progress.completed_count}/${mode.progress.total_count} ${mode.difficulty.type}`
    } else {
      return '`-`';
    };
  };

export const rawCharData = async ( charName, realm, client_id, client_secret ) => {
  let character_data = {};
 
  const token = await getAuthToken(client_id, client_secret)

  await getCharData(charName, realm, token)
    .then(response => {
        character_data = response;
    })

    return character_data; 
}

export const getAllTheData = async (charName, charRealm, client_id, client_secret) => {
  let character_data = {};
  let data_urls = [];
  
  const token = await getAuthToken(client_id, client_secret)

  await getCharData(charName, charRealm, token)
    .then(response => {
        const charData = response;
        const mediaURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.slug}/${charData.name.toLowerCase()}/character-media?namespace=profile-us`;
        const raidsURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.slug}/${charData.name.toLowerCase()}/encounters/raids?namespace=profile-us`;
        // const mPlusURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.slug}/${charData.name.toLowerCase()}/mythic-keystone-profile/season/4?namespace=profile-us`
        // const dungeonsURI = `https://us.api.blizzard.com/profile/wow/character/${charData.realm.slug}/${charData.name.toLowerCase()}/mythic-keystone-profile?namespace=profile-us`
        let urls = [mediaURI, raidsURI, charData.pvp_summary.href]
        urls = urls.map(i => i + `&locale=en_US&access_token=${token}`);

        const name = charData.active_title ? charData.active_title.display_string.toString().replace(/(\{(name)\})/g, charData.name) : charData.name;
        character_data.name = name;
        character_data.level = charData.level;
        character_data.spec = charData.active_spec.name;
        character_data.class = charData.character_class.name;
        character_data.class_color = searchObj(classNames, 'name', character_data.class)[0].color;
        character_data.covenant = { 
          name: charData.covenant_progress ? charData.covenant_progress.chosen_covenant.name : '', 
          renown: charData.covenant_progress ? charData.covenant_progress.renown_level : 'n/a'
        };
        character_data.iLvl = charData.average_item_level; 
        character_data.achievement_points = charData.achievement_points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");  

        data_urls = urls;
    })

    await Promise.all(data_urls.map(url => 
        fetch(url)
      ))
      // All the data returned from the Promise:
      .then(data => Promise.all(data.map(v => v.json())))
      .then(data => {

        const mediaData = data[0];
        const raidData = data[1];
        const pvpData = data[2];

        character_data.img_url = searchObj(mediaData.assets, 'key', 'inset')[0].value;
        character_data.raid_progress = raidProgressCheck(raidData);
        character_data.honor_level = pvpData.honor_level;

      })

    return character_data; 
}