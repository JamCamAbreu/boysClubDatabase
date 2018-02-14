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

// ============= SETUP ==================
var express = require('express');
var app = express();
app.set('port', portUsed);


// ========== HANDLEBARS SETUP ==========

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({defaultLayout: 'main'}));
app.set("view engine", "handlebars"); // default use ".handlebars" files


// for static pages
app.use(express.static("public"));



// ========== DATABASE SETUP ==========
var mysql = require("./mysqlSetup.js");







// ------------- HOME PAGE -------------==

app.get("/", function (req, res, next) {
  res.render('home');
});



app.get("/newStudent", function (req, res, next) {
  res.render('newStudent');
});




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
    console.log('Express started on flip2.engr.oregonstate.edu:' + 
      app.get('port') + '; press Ctrl-C to terminate.');
});




