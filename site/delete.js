

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){



// +==========================================+
// |        REMOVE STUDENT FROM DB            |
// +==========================================+

app.get("/remove", function(req,res,next) {

  var idString = "" + req.query["id"];

  mysql.pool.query("DELETE FROM tbl_student WHERE studentNumber = ?", 

    // array of parameters:
    [idString],

    function(err, results) {
      if(err){
        next(err);
        return;
      }

      // HTTP RESPONSE:
      var deleteSuccess = "" + results.affectedRows;

      res.setHeader("Content-Type", "application/json");
      res.write(deleteSuccess);
      res.end();
    });
});



// +==========================================+
// |        DELETE TICKET FROM DB             |
// +==========================================+

app.get("/removeTicket", function(req,res,next) {

  var idString = "" + req.query["id"];

  mysql.pool.query("DELETE FROM tbl_libraryTicket WHERE id = ?", 

    // array of parameters:
    [idString],

    function(err, results) {
      if(err){
        next(err);
        return;
      }

      // HTTP RESPONSE:
      var deleteSuccess = "" + results.affectedRows;

      res.setHeader("Content-Type", "application/json");
      res.write(deleteSuccess);
      res.end();
    });
});




// +==========================================+
// |        DELETE PURCHASE FROM DB           |
// +==========================================+

app.get("/removePurchase", function(req,res,next) {

  var idString = "" + req.query["id"];

  mysql.pool.query("DELETE FROM tbl_libraryPurchase WHERE id = ?", 

    // array of parameters:
    [idString],

    function(err, results) {
      if(err){
        next(err);
        return;
      }

      // HTTP RESPONSE:
      var deleteSuccess = "" + results.affectedRows;

      res.setHeader("Content-Type", "application/json");
      res.write(deleteSuccess);
      res.end();
    });
});





// +==========================================+
// |        DELETE PANTHER TICKET FROM DB             |
// +==========================================+

app.get("/removePantherTicket", function(req,res,next) {

  var idString = "" + req.query["id"];

  mysql.pool.query("DELETE FROM tbl_pantherTicket WHERE id = ?", 

    // array of parameters:
    [idString],

    function(err, results) {
      if(err){
        next(err);
        return;
      }

      // HTTP RESPONSE:
      var deleteSuccess = "" + results.affectedRows;

      res.setHeader("Content-Type", "application/json");
      res.write(deleteSuccess);
      res.end();
    });
});



// +==========================================+
// |      DELETE PANTHER PURCHASE FROM DB     |
// +==========================================+

app.get("/removePantherPurchase", function(req,res,next) {

  var idString = "" + req.query["id"];

  mysql.pool.query("DELETE FROM tbl_pantherPurchase WHERE id = ?", 

    // array of parameters:
    [idString],

    function(err, results) {
      if(err){
        next(err);
        return;
      }

      // HTTP RESPONSE:
      var deleteSuccess = "" + results.affectedRows;

      res.setHeader("Content-Type", "application/json");
      res.write(deleteSuccess);
      res.end();
    });
});









}
