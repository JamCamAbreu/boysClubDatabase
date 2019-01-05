

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){


// ------------- HOME PAGE -------------==

app.get("/", function (req, res, next) {
  res.render('home');
});


}
