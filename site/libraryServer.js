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

// ============= BODY PARSER ==========
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// ========== DATABASE SETUP ==========
var mysql = require("./mysqlSetup.js");





// ------------- HOME PAGE -------------==

app.get("/", function (req, res, next) {
  res.render('home');
});




// +==========================================+
// |        ADD NEW STUDENT TO DB             |
// +==========================================+
app.get("/newStudent", function (req, res, next) {

  // TODO: See escapePlan code for how to do POSTS
  // so that I don't have to have the /queryNewStudent page
  //var context = {};
  //var action = req.query.do;

  res.render('newStudent');
});

app.post("/queryNewStudent", function (req, res, next) {

  // Get variables to be used for database Query:
  var studentNum = req.body.studentNumber;
  var fName = req.body.firstName;
  var lName = req.body.lastName;
  var school_id = req.body.school_id;
  var ageG_id = req.body.ageGroup_id;
  var hitlists = [];

  // Check boxes:
  var getString;
  if (req.body.hitlist_school)   // school work
    hitlists.push(req.body.hitlist_school);
  if (req.body.hitlist_reading) // reading
    hitlists.push(req.body.hitlist_reading);
  if (req.body.hitlist_math)    // math
    hitlists.push(req.body.hitlist_math);

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;
  if (!studentNum)
    completeForm = false;
  if (fName == "")
    completeForm = false;
  if (lName == "")
    completeForm = false;
  if (school_id == "")
    completeForm = false;
  if (ageG_id == "")
    completeForm = false;


  // TEST CORRECT RESPONSE:
  if (completeForm) {
    console.log("New Student:");
    console.log("\tStudent Number: " + studentNum);
    console.log("\tFirst Name: " + fName);
    console.log("\tLast Name: " + lName);
    console.log("\tSchool ID: " + school_id);
    console.log("\tHitlists: ");
    if (hitlists.length > 0)
      console.log("\t\t" + hitlists);
    else
      console.log("\t\tNone");

    // Query the database (insert):
    var sqlString = "INSERT INTO tbl_student " + 
                    "(`studentNumber`, `school_id`, " +  
                    "`ageGroup_id`, `firstName`, `lastName`) " + 
                    "VALUES (?, ?, ?, ?, ?)";

    // array of parameters:
    var inserts = [studentNum, school_id, ageG_id, fName, lName];

    // SEND the query:
    mysql.pool.query(sqlString, inserts, function(err, results){
      if(err){
        next(err);
        return
      }

      // no res.write needed here yet...
      console.log("Query sent successfully.");
    }); // end query


  } // end if test correct response
  else {
    // send data to res.render('newStudent') by 
    // adding error message to context
    // Note: could use an array to add an 
    // error message for EACH missing piece of data
    // such as:
    // var errors = [];
    // errors.push("required: student number");
    // errors.push("required: first name");
    // etc...
  
    console.log("invalid form filled out!");
  }

  res.redirect('newStudent');
});


// +==========================================+
// |        VIEW ALL STUDENTS IN DB           |
// +==========================================+


app.get("/allStudents", function(req, res, next) {

  mysql.pool.query("SELECT studentNumber, school_id, ageGroup_id, " +
                   "firstName, lastName FROM `tbl_student`",
     function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      var selectedData = {};
      selectedData.numEntries = rows.length;
      selectedData.row = [];

      var index;
      var row;
      for (index = 0; index < selectedData.numEntries; index++) {
        row = rows[index];
        selectedData.row.push({
          studentNumber : row.studentNumber,
          school_id : row.school_id,
          ageGroup_id : row.ageGroup_id,
          firstName : row.firstName,
          lastName : row.lastName
        });
      } // end for

      res.render("students", selectedData);
     });
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




