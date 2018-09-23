module.exports = function () {
  var express = require('express');
  var router = express.Router();

  function getPresident(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, name, signed, bill_on_desk FROM president", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.president = results;
      complete();
    });
  }

  function getOnePres(res, mysql, context, id, complete) {
    var sql = "SELECT id, name, signed, bill_on_desk FROM president WHERE id = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.onepres = results[0];
      complete();
    });
  }

  function getBillDetails(res, mysql, context, complete) {
    mysql.pool.query("SELECT president.id, president.name AS president, bill_on_desk, signed, bill.name AS bill_name, bill.description AS bill_desc FROM president INNER JOIN bill ON bill.id = president.id", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.details = results;
      complete();
    });
  }



  router.get('/', function (req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteentity.js"];
    var mysql = req.app.get('mysql');
    getPresident(res, mysql, context, complete);
    getBillDetails(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
        res.render('president', context);
      }

    }
  });

  router.get('/:id', function (req, res) {
    callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateentity.js", " deleteentity.js"];
    var mysql = req.app.get('mysql');
    getOnePres(res, mysql, context, req.params.id, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('update-president', context);
      }

    }
  });

  router.post('/', function (req, res) {
    console.log(req.body)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO president(name, signed, bill_on_desk) VALUES (?,?,?)";
    var inserts = [req.body.name, req.body.signed, req.body.bill_endorsed];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error))
        res.write(JSON.stringify(error));
        res.end();
      } else {
        res.redirect('/president');
      }
    });
  });

  router.put('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    console.log(req.body)
    console.log(req.params.id)
    var sql = "UPDATE president SET signed =? WHERE id=?";
    var inserts = [req.body.signed, req.params.id];
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
    var sql = "DELETE FROM president WHERE id = ?";
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


  return router;

}();