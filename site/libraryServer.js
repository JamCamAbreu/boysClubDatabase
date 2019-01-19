/* **************************************************
 * Author: James Cameron Abreu
 * Date: 02/09/2018
 * Company: Club for Boys Rapid City, SD
 * Direct Supervisor: John Stromman
 * Program Supervisor: Mark
 * Description: the libraryDatabase server hosts the library database used at
 * the Club for Boys, Rapid City, South Dakota. The database holds information
 * about student library work, library 'points' earned and spent, and other
 * useful data for programs held at the club. 
 * *************************************************/

var portUsed = 55850;
  // NOTE: If I change this I also need to change in scripts/appFunctions.js

// ============= SETUP ==================
var express = require('express');
var app = express();
app.set('port', portUsed);

// ========== HANDLEBARS SETUP ==========
var exphbs = require("express-handlebars");
app.engine("handlebars", 
    exphbs({defaultLayout: 'main',

      helpers: {
        checkedIf:
          function(condition) { return (condition) ? "checked" : "";}
      } // end helpers
}));
app.set("view engine", "handlebars"); // default use ".handlebars" files

// for static pages
app.use(express.static("public"));

// ============= BODY PARSER ==========
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// ========== DATABASE SETUP ==========
var mysql = require("./mysqlSetup.js");

// ========== MOMENT (EASY DATES) =====
var moment = require("moment");


// ======= CONSTANTS ==================
var MAX_STUDENT_NUM = 999999;

// ====== UTILITY ======
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

require('./home')(app);
require('./newStudent')(app);
require('./delete')(app);
require('./ticket')(app);
require('./purchase')(app);
require('./search')(app);
require('./allStudents')(app);
require('./student')(app);
require('./reports')(app);
require('./panther')(app);
require('./readingLab')(app);
require('./editStudent')(app);
require('./test')(app);

// ============== ERRORS ================

app.use(function (req, res) {
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});


// ============ PORT SETUP ==============

app.listen(app.get('port'), function(){
    console.log('Express started with local ip and port ' + 
      app.get('port') + '; press Ctrl-C to terminate.');
});

