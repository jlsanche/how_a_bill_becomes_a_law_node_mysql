module.exports = function () {
  var express = require('express');
  var router = express.Router();
  var bill = require('./bill.js');

  function getLobbyGroup(res, mysql, context, complete) {
    mysql.pool.query("SELECT lobby_group.id, lobby_group.name, money, bill.name AS bill_endorsed FROM lobby_group INNER JOIN bill ON bill_endorsed = bill.id" , function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.lobbies = results;
      complete();
    });
  }

  function getBills(res, mysql, context, complete) {
    mysql.pool.query("SELECT bill.id AS bill_endorsed, bill.name AS bill_name, bill.description,lobby_group.id AS Lobby FROM bill INNER JOIN lobby_group ON bill.id = lobby_group.id", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.bills = results;
      complete();
    });
  }

  function getOneLobbyGroup(res, mysql, context, id, complete) {
    var sql = "SELECT name, money FROM lobby_group WHERE id = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.oneLobbyGroup = results[0];
      complete();
    });
  }

  router.get('/', function (req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteentity.js", "updateentity.js"];
    var mysql = req.app.get('mysql');
    getLobbyGroup(res, mysql, context, complete);
    getBills(res,mysql,context,complete );
    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
        res.render('lobby', context);
      }
  
    }
  });

  router.get('/:id', function (req, res) {
    callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateentity.js"];
    var mysql = req.app.get('mysql');
    getOneLobbyGroup(res, mysql, context, req.params.id, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('update-lobby', context);
      }

    }
  });

  router.post('/', function(req, res){
    console.log(req.body)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO lobby_group (name, money, bill_endorsed) VALUES (?,?,?)";
    var inserts = [req.body.name, req.body.money, req.body.bill_endorsed];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('/lobby');
        }
    });
});


  router.put('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    console.log(req.body)
    console.log(req.params.id)
    var sql = "UPDATE lobby_group SET name=?, money=? WHERE id=?";
    var inserts = [req.body.name,req.body.money, req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        console.log(error)
        res.write(JSON.stringify(error));
        res.end();
      } else {
        res.status(200);
        res.end();
      }
    });
  });


  router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM lobby_group WHERE id = ?";
    var inserts = [req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.status(400);
        res.end();
      } else {
        res.status(202).end();
      }
    });


  });



  return router;


}();