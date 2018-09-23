module.exports = function () {
  var express = require('express');
  var router = express.Router();

  function getOneBill(res, mysql, context, id, complete) {
    var sql = "SELECT id, name, description, passed FROM bill WHERE id = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.onebill = results[0];
      complete();
    });
  }


  function getBills(res, mysql, context, complete) {
    mysql.pool.query("SELECT id, name, description, passed FROM bill", function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.bills = results;
      complete();
    });
  }

  router.get('/', function (req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteentity.js"];
    var mysql = req.app.get('mysql');
    getBills(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('bill', context);

      }

    }

  });


  router.get('/:id', function (req, res) {
    callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateentity.js"];
    var mysql = req.app.get('mysql');
    getOneBill(res, mysql, context, req.params.id, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('update-bill', context);
      }

    }
  })


  router.put('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    console.log(req.body)
    console.log(req.params.id)
    var sql = "UPDATE bill SET name=?,description=? WHERE id=?";
    var inserts = [req.body.name, req.body.description, req.params.id];
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

  router.post('/', function(req, res){
    console.log(req.body)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO bill (name, description) VALUES (?,?)";
    var inserts = [req.body.name, req.body.description];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('/bill');
        }
    });
});


  router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM bill WHERE id = ?";
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