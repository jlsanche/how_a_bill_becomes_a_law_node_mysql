module.exports = function () {
  var express = require('express');
  var router = express.Router();


  function getCongressMembers(res, mysql, context, complete) {
    mysql.pool.query("SELECT id AS cid, name FROM member_congress", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.congressmembers = results;
      complete();
    });
  }


  function getLobby(res, mysql, context, complete) {
    sql = "SELECT id AS lid, name FROM lobby_group";
    mysql.pool.query(sql, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end()
      }
      context.lobbies = results
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


  router.get('/', function (req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteentity.js"];
    var mysql = req.app.get('mysql');

    getCongressMembers(res, mysql, context, complete);
    getLobby(res, mysql, context, complete);
    getMoneyTakenFromLobbies(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 3) {
        res.render('money-taken', context);
      }
    }
  });

  router.get('/:id', function (req, res) {
    callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateentity.js"];
    var mysql = req.app.get('mysql');
    getMoneyTakenFromLobbies(res, mysql, context, req.params.id, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('money-taken', context);
      }

    }
  })

  /* Associate certificate or certificates with a person and 
   * then redirect to the people_with_certs page after adding 
   */
  router.post('/', function (req, res) {
    console.log("We get the multi-select certificate dropdown as ", req.body.certs)
    var mysql = req.app.get('mysql');
    // let's get out the certificates from the array that was submitted by the form 
    var members = req.body.congress
    var lobby = req.body.lid
    for (let member of members) {
      console.log("Processing member id " + member);
      var sql = "INSERT INTO money_taken (cid, lid) VALUES (?,?)";
      var inserts = [lobby, member];
      sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
          //TODO: send error messages to frontend as the following doesn't work
          /* 
          res.write(JSON.stringify(error));
          res.end();
          */
          console.log(error);
        }
      });
    } //for loop ends here 
    res.redirect('/money-taken');
  });

  /* Delete a person's certification record */
  /* This route will accept a HTTP DELETE request in the form
   * /pid/{{pid}}/cert/{{cid}} -- which is sent by the AJAX form 
   */
  router.delete('/pid/:pid/congress/:cid', function (req, res) {
    //console.log(req) //I used this to figure out where did pid and cid go in the request
    console.log(req.params.cid)
    console.log(req.params.lid)
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM money_taken WHERE cid = ? AND lid = ?";
    var inserts = [req.params.cid, req.params.lid];
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

  return router;
}();