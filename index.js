var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

const dotenv = require('dotenv').config()

var app = express();
var handlebars = require('express-handlebars').create({
  defaultLayout: 'main'
});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', 4099);
app.set('mysql', mysql);
app.use('/bill', require('./bill.js'));
app.use('/congress', require('./congressmembers.js'));
app.use('/lobby', require('./lobbygroups.js'));
app.use('/money-taken', require('./moneytaken.js'))
app.use('/president', require('./president.js'));
app.use('/', express.static('public'));

app.get('/alldata', function (req, res) {
  var callbackCount = 0;
  var context = {};
  
  var mysql = req.app.get('mysql');
  getBills(res, mysql, context, complete);
  getLobbyGroup(res, mysql, context, complete);
  getPresident(res, mysql, context, complete);
  getCongressMembers(res, mysql, context, complete);

  function complete() {
    callbackCount++;
    if (callbackCount >= 4) {
      res.render('alldata', context);
    }

  }
});

app.get('/voting', function (req, res) {
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getCongressVoting(res, mysql, context, complete);

  function complete() {
    callbackCount++;
    if (callbackCount >= 1) {
      res.render('voting', context);
    }

  }
});


function getCongressVoting(res, mysql, context, complete) {
  mysql.pool.query("SELECT cid, member_congress.name AS congress_member, bill.name AS Bill, bill.description AS description , vote.vote AS Vote from member_congress INNER JOIN  vote on member_congress.id = vote.cid INNER JOIN bill on bill.id = vote.bid  ORDER BY member_congress.name ASC",
    function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end()
      }
      context.voting = results;
      complete();
    });
}

app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function () {
  console.log('Express started on http://flip3.engr.oregonstate:' + app.get('port'));
});