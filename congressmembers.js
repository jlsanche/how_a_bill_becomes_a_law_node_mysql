module.exports = function () {
  var express = require('express');
  var router = express.Router();

  function getOneCongressMember(res, mysql, context, id, complete) {
    var sql = "SELECT name FROM member_congress WHERE id = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.oneCongressMember = results[0];
      complete();
    });
  }

  function getCongressMembers(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, name FROM member_congress", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.congressMembers = results;
      complete();
    });
  }

  function getLobbyGroup(res, mysql, context, complete) {
    mysql.pool.query("SELECT lobby_group.id AS Lobby_id, lobby_group.name AS Lobby, money, bill.name AS bill_endorsed FROM lobby_group INNER JOIN bill ON bill_endorsed = bill.id" , function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.lobbies = results;
      complete();
    });
  }

  function getMoneyTakenFromLobbies(res, mysql, context, complete) {
    mysql.pool.query("SELECT member_congress.name AS congress_member,lobby_group.name AS Lobby, money AS lobby_contributions from member_congress INNER JOIN  money_taken on member_congress.id = money_taken.cid INNER JOIN lobby_group on lobby_group.id = money_taken.lid ORDER BY member_congress.name ASC",
      function (error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end()
        }
        context.money_taken_lobbies = results;
        complete();
      });
  }

   
   function getMemberWithNameLike(req, res, mysql, context, complete) {
    //sanitize the input as well as include the % character
     var query = "SELECT name FROM member_congress WHERE name LIKE " + mysql.pool.escape(req.params.s + '%');
    console.log(query)
    mysql.pool.query(query, function(error, results, fields){
          if(error){
              res.write(JSON.stringify(error));
              res.end();
          }
          context.congressMembers = results;
          complete();
      });
  }



  router.get('/', function (req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteentity.js", "searchmember.js", "updateentity.js"];
    var mysql = req.app.get('mysql');
    getCongressMembers(res, mysql, context, complete);
    //getMoneyTakenFromLobbies(res, mysql, context, complete);
    getLobbyGroup(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
        res.render('congress', context);
      }

    }
  });


  router.get('/:id', function (req, res) {
    callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateentity.js"];
    var mysql = req.app.get('mysql');
    getOneCongressMember(res, mysql, context, req.params.id, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('update-congress', context);
      }

    }
  })

  router.post('/', function(req, res){
   
    var mysql = req.app.get('mysql');
    
    var monies = req.body.monies
    var congress = req.body.id
    for (let money  of  monies) {
      console.log("Processing certificate id " + cert)
      var sql = "INSERT INTO bsg_cert_people (pid, cid) VALUES (?,?)";
      var inserts = [congress, money];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            //TODO: send error messages to frontend as the following doesn't work
            /* 
            res.write(JSON.stringify(error));
            res.end();
            */
            console.log(error)
        }
      });
    } //for loop ends here 
    res.redirect('/money-taken');
});


  router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM member_congress WHERE id = ?";
    var inserts = [req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.status(400);
        res.end();
      } else {
        res.status(202).end();
      }
    })


  })

  router.get('/search/:s', function(req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ['deleteentity.js','searchmember.js','updateentity.js']
    var mysql = req.app.get('mysql');
    getMemberWithNameLike(req, res, mysql, context, complete);
    getLobbyGroup(res, mysql, context, complete);   
    // getCongressMembers(res, mysql, context, complete);
    function complete(){
      callbackCount++;
      if(callbackCount >= 2){
          res.render('congress', context);
      }

  }

  });

  return router;


}();