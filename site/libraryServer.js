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

app.post("/newStudent", function (req, res, next) {

  var context = {
    errorList: []
  };

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

  // Save the data in case there were errors:
  context.studentNum = req.body.studentNumber;
  context.fName = req.body.firstName;
  context.lName = req.body.lastName;
  context.school_id = parseInt(req.body.school_id); // on load
  context.ageG_id = parseInt(req.body.ageGroup_id); // on load
  context.h_schoolWork = hitlists.includes("1"); // helper function
  context.h_reading = hitlists.includes("2");    // helper function
  context.h_math = hitlists.includes("3");       // helper function

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;


  // STUDENT NUMBER
  var studentNumInt = parseInt(studentNum);
  if (studentNum == "") {
    completeForm = false;
    context.errorList.push("Required Field: Student Number");
  } else if (studentNumInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be greater than zero.");
  } else if (studentNumInt > 9999) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be less than 9999.");
  }

  // FIRST NAME
  if (fName == "") {
    completeForm = false;
    context.errorList.push("Required Field: First Name");
  }

  // LAST NAME
  if (lName == "") {
    completeForm = false;
    context.errorList.push("Required Field: Last Name");
  }

  // SCHOOL ID
  if (school_id == "") {
    completeForm = false;
    context.errorList.push("Required Field: School ID");
  }

  // AGE ID
  if (ageG_id == "") {
    completeForm = false;
    context.errorList.push("Required Field: Age Group");
  }

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

      console.log("Query sent successfully.");
    }); // end query

  } // end if test correct response

  res.render('newStudent', context);
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
      var context = {};
      context.numEntries = rows.length;
      context.row = [];

      var index;
      var row;
      for (index = 0; index < context.numEntries; index++) {
        row = rows[index];
        context.row.push({
          studentNumber : row.studentNumber,
          school_id : row.school_id,
          ageGroup_id : row.ageGroup_id,
          firstName : row.firstName,
          lastName : row.lastName
        });
      } // end for

      res.render("students", context);
     });



});










// +==========================================+
// |             SEARCH STUDENT               |
// +==========================================+

app.get("/search", function (req, res, next) {
  res.render('searchStudent');
});


// USING SCAN MACHINE:
app.post("/searchStudentScanCard", function (req, res, next) {

  var context = {
    errorList: []
  };
  var completeForm = true; // true until proven false

  var fullNum = req.body.scanID;

  // INVALID SCAN:
  if (fullNum.length < 6) {
    completeForm = false;
    context.errorList.push("Invalid ID card");
    res.render('searchStudent', context);
  }

  // VALID SCAN, SEARCH DATABASE:
  else {
    context.studentNum = fullNum.substr(fullNum.length - 6);
    console.log(context.studentNum);
    res.render('studentDisplay', context);
  }
});




// USING NAME:
app.post("/searchStudentName", function (req, res, next) {

  var context = {
    errorList: []
  };
  var completeForm = true; // true until proven false

  context.fName = req.body.firstName;
  context.lName = req.body.lastName;

  if ((context.fName.length <= 0) && (context.lName.length <= 0)) {
    completeForm = false;
    context.errorList.push("Please Provide either a first or last name");
    res.render('searchStudent', context);
  }



  // SEARCH DATABASE (no errors in input)
  else {

    // QUERY HERE:

    var sqlString = "SELECT studentNumber, school_id, ageGroup_id, " +
                     "firstName, lastName FROM `tbl_student` WHERE ";

    // array of parameters:
    var inserts = [];

    // first name provided:
    if (context.fName.length > 0) {
      sqlString += "firstName = ?";
      inserts.push(context.fName);
    }

    if (context.fName.length > 0 && context.lName.length > 0)
      sqlString += "AND ";

    if (context.lName.length > 0) {
      sqlString += "lastName = ?";
      inserts.push(context.lName);
    }

    // SEND the query:
    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
        if (err) {
          console.log("Error in selecting students from DB.");
          next(err);
          return;
        }

        // Gather student info and shoot it to handlebars:
        context.numEntries = rows.length;
        context.row = [];

        var index;
        var row;
        for (index = 0; index < context.numEntries; index++) {
          row = rows[index];
          context.row.push({
            studentNumber : row.studentNumber,
            school_id : row.school_id,
            ageGroup_id : row.ageGroup_id,
            firstName : row.firstName,
            lastName : row.lastName
          });
        } // end for

        res.render('studentSearchResults', context);
       });
  } // end no errors in input

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




