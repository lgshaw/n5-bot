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

  function fetchAchievementInfo(id, callback)  {
    request(`https://us.api.battle.net/wow/achievement/${id}?locale=en_US&apikey=${apiKey}`, function (error, response, result) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(result);
        callback(info);
      } else {
        var info = JSON.parse(result);
        callback(info);
      };
    });
  }

  function checkHonorLevel(data){
    var completedRankAchieves = [];

    honorRanks.sort(((a, b) => b - a)).forEach(function (item) {
     if(data.includes(parseInt(item))){
      completedRankAchieves.push(item);
     }
    });

    fetchAchievementInfo(completedRankAchieves[0], function(info) {
      return (info.title);
    });
};


  getCharData('Shaweaver', 'caelestrasz', function(info){
      checkHonorLevel(info.achievements.achievementsCompleted);
  });
