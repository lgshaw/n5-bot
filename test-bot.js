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

  function format(x) {
    return isNaN(x)?"":x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  var sortArray = Object.keys(honorRanks).sort(((b, a) => b - a));
  
  function checkHonorLevel(data){
    sortArray.forEach(function (item) {
     console.log(`${data.includes(item)} : ${item}`);
    });
    console.log(data.includes(12893));
    // //console.log(checkThese[checkThese.length - 1]);
    // //console.log(data.hasOwnProperty(checkThese.length - 1));
    //console.log(data.hasOwnProperty('12893'));
};


  getCharData('Shaweaver', 'caelestrasz', function(info){
      checkHonorLevel(info.achievements.achievementsCompleted);
  });

