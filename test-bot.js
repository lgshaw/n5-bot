var Discord = require("discord.js");
var bnet = require("battlenet-api")('qnehqjeq658chy2ak9qqkp7q4ft9gmu4');
var request = require('request');

var honorRanks = require('./honorRanks.js');
var classLookup = require('./classLookup.js');

var wow = bnet.wow;

var apiKey = 'qnehqjeq658chy2ak9qqkp7q4ft9gmu4';
var apiToken = '2gkmvxynw7tapw3qexvqqr4v';

const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);

function getCharData(charName, region, callback)  {
    request(`https://us.api.battle.net/wow/character/${region}/${charName}?fields=items,titles,talents,progression,achievements,stats,statistics&locale=en_US&apikey=${apiKey}`, function (error, response, result) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(result);
        callback(info);
      } else {
        var info = JSON.parse(result);
        callback(info);
      };
    });
  }

  const fetchAchievementInfo = (id, callback) =>  {
    request(`https://us.api.battle.net/wow/achievement/${id}?locale=en_US&apikey=${apiKey}`, function (error, response, result) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(result);
        callback ( data );
      } else {
        var data = JSON.parse(result);
        callback ( data );
      };
    });
  }

  const checkHonorLevel = data => {
    let completedRankAchieves = honorRanks.sort(((a, b) => b - a)).filter(item => 
      data.includes(parseInt(item)) ? parseInt(item) : false
    );
    console.log(completedRankAchieves[0]);
    return completedRankAchieves[0];   
  };


  getCharData('Shaweaver', 'caelestrasz', function(info){
    
    //console.log(checkHonorLevel(info.achievements.achievementsCompleted));
    fetchAchievementInfo(checkHonorLevel(info.achievements.achievementsCompleted), function (data) {
      console.log(data.title);
    });
   });


