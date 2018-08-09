const countDownToBFA = (endDate, callback) => {
    let days, hours, minutes, seconds;
    
    endDate = new Date(endDate).getTime();

    calculate();
    
    function calculate() {
      let startDate = new Date();
      startDate = startDate.getTime();
      
      let timeRemaining = parseInt((endDate - startDate) / 1000);
      
      if (timeRemaining >= 0) {
        days = parseInt(timeRemaining / 86400);
        timeRemaining = (timeRemaining % 86400);
        
        hours = parseInt(timeRemaining / 3600);
        timeRemaining = (timeRemaining % 3600);
        
        minutes = parseInt(timeRemaining / 60);
        timeRemaining = (timeRemaining % 60);
        
        seconds = parseInt(timeRemaining);

        return callback(`${days} days, ${hours} hrs, ${minutes}mins`);
        
      } else {
        return 'It\'s released you silly sausage. Go and play!';
      }
    }
  }

  countDownToBFA('08/014/2018 08:00:00 AM', function(timer) {
      console.log(timer);
  })

