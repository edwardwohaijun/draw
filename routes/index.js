let randomNumber = require('../utils/common').randomNumber;

module.exports = function(app){
  app.get('/draw', function(req, res, next) {
    res.redirect('/draw/' + randomNumber(10000, 100000000));
  });

  app.get('/draw/:canvasID', function(req, res, next) {
    res.render('index');
  })

};
