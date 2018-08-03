var Discord = require("discord.js");
var bnet = require("battlenet-api")('qnehqjeq658chy2ak9qqkp7q4ft9gmu4');
var axios = require('axios');

var honorRanks = require('./honorRanks.js');
var classLookup = require('./classLookup.js');

var wow = bnet.wow;

var apiKey = 'qnehqjeq658chy2ak9qqkp7q4ft9gmu4';
var apiToken = '2gkmvxynw7tapw3qexvqqr4v';

const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);

const getCharData = (charName, region, callback) => {
    console.log('getting character data...');
    axios.get(`https://us.api.battle.net/wow/character/${region}/${charName}?fields=items,titles,talents,progression,achievements,stats,statistics&locale=en_US&apikey=${apiKey}`)
      .then(response => {
        console.log('got data!');
        callback(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }

const log = data => {
  console.log(data);
};

const fetchAchievementInfo = (id, callback) => {
  log(`getting Achievement data for: ${id}`)
  axios.get(`https://us.api.battle.net/wow/achievement/${id}?locale=en_US&apikey=${apiKey}`)
    .then(response => {
      console.log('got data!');
      callback(response.data);
    })
    .catch(error => {
      console.log(error);
    });
};

const checkHonorLevel = data => {
  let achieves = honorRanks.sort(((a, b) => b - a)).filter(item => 
    data.includes(parseInt(item)) ? parseInt(item) : false
  );
  
  return new Promise((resolve) => {
    fetchAchievementInfo(achieves[0], info => {
      resolve(info.title);
    })
  })
};

getCharData('Shaweaver', 'caelestrasz', info => {
  checkHonorLevel(info.achievements.achievementsCompleted);
});