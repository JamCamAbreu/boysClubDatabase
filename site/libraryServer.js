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



// ------------- HOME PAGE -------------==

app.get("/", function (req, res, next) {
  res.render('home');
});














// +==========================================+
// |        ADD NEW STUDENT TO DB             |
// +==========================================+
app.get("/newStudent", function (req, res, next) {

  res.render('newStudent');
});



app.post("/newStudent", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;

  // Get variables to be used for database Query:
  var studentNum = req.body.studentNumber;


  mysql.pool.query("SELECT S.studentNumber, S.firstName, S.lastName " + 
                   " FROM tbl_student S " + 
                   "WHERE S.studentNumber = ?", [studentNum], 
     function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      if (rows.length > 0) {
        completeForm = false;
        var student_fName = rows[0].firstName;
        var student_lName = rows[0].lastName;
        context.errorList.push("Student with ID number " + studentNum + 
          " already exists in database with name: " + 
          student_lName + ", " + student_fName);
      }

  var fName = req.body.firstName;
  var lName = req.body.lastName;
  var school_id = req.body.school_id;
  var ageG_id = req.body.ageGroup_id;


  // Check boxes:
  var hitlists = [];
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


  // STUDENT NUMBER
  var studentNumInt = parseInt(studentNum);
  if (studentNum == "") {
    completeForm = false;
    context.errorList.push("Required Field: Student Number");
  } else if (studentNumInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be greater than zero.");
  } else if (studentNumInt > MAX_STUDENT_NUM) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be less than " + MAX_STUDENT_NUM + ".");
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

    var name = context.lName + ", " + context.fName;
    context.successList.push(name + " added successfully.");

  } // end if test correct response

  res.render('newStudent', context);

  }); // end query for student already exists
});





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





















// +==========================================+
// |        VIEW ALL STUDENTS IN DB           |
// +==========================================+

app.get("/allStudents", function(req, res, next) {

  var context = {};

  mysql.pool.query("SELECT S.studentNumber, SCH.name AS 'school', " + 
                   "AG.name AS 'ageGroup', " +
                   "S.firstName, S.lastName FROM tbl_student S INNER JOIN " + 
                   "tbl_school SCH ON SCH.id = S.school_id INNER JOIN " + 
                   "tbl_ageGroup AG ON AG.id = S.ageGroup_id " + 
                   "ORDER BY S.lastName",
     function(err, rows, fields){
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
          school : row.school,
          ageGroup : row.ageGroup,
          firstName : row.firstName,
          lastName : row.lastName
        });
      } // end for

      res.render("allStudents", context);
     }); // end query select all students
});





















// +==========================================+
// |             NEW LIBRARY TICKET           |
// +==========================================+

app.get("/newTicket", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");

  var sqlString =  "SELECT T.id, T.dateCompleted AS 'date', " + 
									 "S.studentNumber, " + 
                   "S.firstName, S.lastName, WT.name AS 'type', " +
                   "T.pointEarnedAmount AS 'amount', T.notes, T.submitTimestamp " + 
                   "FROM tbl_libraryTicket T INNER JOIN " +
                   "tbl_student S ON S.studentNumber = T.student_id INNER JOIN " + 
                   "tbl_libraryWorkType WT ON WT.id = T.libraryWorkType " + 
                   "ORDER BY T.submitTimestamp DESC LIMIT 25";

    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numTT = rows.length;
      context.TT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numTT; index++) {
        row = rows[index];
        context.TT.push({
          id : row.id,
					num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          type : row.type,
          amount : row.amount,
          notes : row.notes
        });


      } // end for

      res.render("newTicket", context);

     }); // end query select all students
});










app.post("/newTicket", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;

  context.todayDate = moment().format("YYYY-MM-DD");


  // FIRST get student number to see if student exists:
  var studentNum = req.body.studentNumber;

  mysql.pool.query("SELECT S.studentNumber FROM tbl_student S " + 
                   "WHERE S.studentNumber = ?", [studentNum], 
     function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      if (rows.length <= 0) {
        completeForm = false;
        context.errorList.push("Student with ID number " + studentNum + " does not exist in database yet.");
      }

  // Get variables to be used for database Query:
  var date = req.body.date;
  var workType = req.body.workType;
  var amount = req.body.amount;
  var notes = req.body.notes;

  // Save the data in case there were errors:
  context.studentNum = req.body.studentNumber;

  // only override today's date if necessary
  if (date)
    context.todayDate = req.body.date;

  context.workType = req.body.workType;
  context.amount = parseInt(req.body.amount); // on load
  context.notes = req.body.notes;


  // STUDENT NUMBER
  var studentNumInt = parseInt(studentNum);
  if (studentNum == "") {
    completeForm = false;
    context.errorList.push("Required Field: Student Number");
  } else if (studentNumInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be greater than zero.");
  } else if (studentNumInt > MAX_STUDENT_NUM) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be less than " + MAX_STUDENT_NUM + ".");
  }

  // DATE
  if (date == "") {
    completeForm = false;
    context.errorList.push("Required Field: Date");
  }

  // Work Type
  if (workType == "") {
    completeForm = false;
    context.errorList.push("Required Field: Work Type");
  }

  // Amount
  var amountInt = parseInt(amount);
  if (amount == "") {
    completeForm = false;
    context.errorList.push("Required Field: Amount");
  } else if (amountInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Point amount must be greater than zero. Use Purchase for balance-reduction");
  }

  // TEST CORRECT RESPONSE:
  if (completeForm) {
    console.log("New Ticket:");
    console.log("\tStudent Number: " + studentNum);
    console.log("\tDate: " + date);
    console.log("\tWork Type: " + workType);
    console.log("\tAmount: " + amount);
    console.log("\tNotes: " + notes);

    // Query the database (insert):
    var sqlString2 = "INSERT INTO tbl_libraryTicket " + 
                    "(`student_id`, `libraryWorkType`, " +  
                    "`pointEarnedAmount`, `dateCompleted`, `notes`) " + 
                    "VALUES (?, ?, ?, ?, ?)";

    // array of parameters:
    var inserts2 = [studentNum, workType, amount, date, notes];

    // SEND the query:
    mysql.pool.query(sqlString2, inserts2, function(err, results){
      if(err){
        next(err);
        return
      }

      console.log("Query sent successfully.");
      context.successList.push("Ticket for " + amount + " points added successfully to account: " + studentNum);




  // QUERY FOR MOST RECENT TICKETS
  var sqlString =  "SELECT T.id, T.dateCompleted AS 'date', " + 
                   "S.firstName, S.lastName, WT.name AS 'type', " +
									 "S.studentNumber, " + 
                   "T.pointEarnedAmount AS 'amount', T.notes, T.submitTimestamp " + 
                   "FROM tbl_libraryTicket T INNER JOIN " +
                   "tbl_student S ON S.studentNumber = T.student_id INNER JOIN " + 
                   "tbl_libraryWorkType WT ON WT.id = T.libraryWorkType " + 
                   "ORDER BY T.submitTimestamp DESC LIMIT 25";


    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numTT = rows.length;
      context.TT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numTT; index++) {
        row = rows[index];
        context.TT.push({
          id : row.id,
					num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          type : row.type,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

          res.render("newTicket", context);

        }); // end query most recent tickets
      }); // end query for insert

      } // end if test correct response





      // STUDENT DID NOT EXIST IN DATABASE
      else {

  // QUERY FOR MOST RECENT TICKETS
  var sqlString =  "SELECT T.id, T.dateCompleted AS 'date', " + 
                   "S.firstName, S.lastName, WT.name AS 'type', " +
									 "S.studentNumber, " + 
                   "T.pointEarnedAmount AS 'amount', T.notes, T.submitTimestamp " + 
                   "FROM tbl_libraryTicket T INNER JOIN " +
                   "tbl_student S ON S.studentNumber = T.student_id INNER JOIN " + 
                   "tbl_libraryWorkType WT ON WT.id = T.libraryWorkType " + 
                   "ORDER BY T.submitTimestamp DESC LIMIT 25";

    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numTT = rows.length;
      context.TT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numTT; index++) {
        row = rows[index];
        context.TT.push({
          id : row.id,
				  num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          type : row.type,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

        res.render("newTicket", context);

      }); // end query most recent tickets
    } // END ELSE
  }); // end query for test student number
});
















// +==========================================+
// |             NEW LIBRARY PURCHASE         |
// +==========================================+

app.get("/newPurchase", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");


  var sqlString =  "SELECT P.id, P.dateOfPurchase AS 'date', " + 
                   "S.firstName, S.lastName, " +
									 "S.studentNumber, " + 
                   "P.pointAmount AS 'amount', P.notes, P.submitTimestamp " + 
                   "FROM tbl_libraryPurchase P INNER JOIN " +
                   "tbl_student S ON S.studentNumber = P.student_id " + 
                   "ORDER BY P.submitTimestamp DESC LIMIT 25";

    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting purchases from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numPT = rows.length;
      context.PT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numPT; index++) {
        row = rows[index];
        context.PT.push({
          id : row.id,
				  num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

      res.render("newPurchase", context);

    }); // end query select all students
});










app.post("/newPurchase", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");


  // FIRST get student number to see if student exists:
  var studentNum = req.body.studentNumber;

  mysql.pool.query("SELECT S.studentNumber, S.firstName FROM tbl_student S " + 
                   "WHERE S.studentNumber = ?", [studentNum], 
     function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      if (rows.length <= 0) {
        completeForm = false;
        context.errorList.push("Student with ID number " + studentNum + " does not exist in database yet.");
      }

      var studentName = rows[0].firstName;

  // Get variables to be used for database Query:
  var date = req.body.date;
  var amount = req.body.amount;
  var notes = req.body.notes;

  // Save the data in case there were errors:
  context.studentNum = req.body.studentNumber;

  // only override today's date if necessary
  if (date)
    context.todayDate = req.body.date;

  context.amount = parseInt(req.body.amount);
  context.notes = req.body.notes;


  // STUDENT NUMBER
  var studentNumInt = parseInt(studentNum);
  if (studentNum == "") {
    completeForm = false;
    context.errorList.push("Required Field: Student Number");
  } else if (studentNumInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be greater than zero.");
  } else if (studentNumInt > MAX_STUDENT_NUM) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be less than " + MAX_STUDENT_NUM + ".");
  }

  // DATE
  if (date == "") {
    completeForm = false;
    context.errorList.push("Required Field: Date");
  }

  // Amount
  var amountInt = parseInt(amount);
  if (amount == "") {
    completeForm = false;
    context.errorList.push("Required Field: Amount");
  } else if (amountInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Point amount must be greater than zero.");
  }

  // TEST CORRECT RESPONSE:
  if (completeForm) {
    console.log("New Purchase:");
    console.log("\tStudent Number: " + studentNum);
    console.log("\tDate: " + date);
    console.log("\tAmount: " + amount);
    console.log("\tNotes: " + notes);


    // Query the database (insert):
    var sqlString2 = "INSERT INTO tbl_libraryPurchase " + 
                    "(`student_id`, " +  
                    "`pointAmount`, `dateOfPurchase`, `notes`) " + 
                    "VALUES (?, ?, ?, ?)";

    // array of parameters:
    var inserts2 = [studentNum, amount, date, notes];

    // SEND the query:
    mysql.pool.query(sqlString2, inserts2, function(err, results){
      if(err){
        next(err);
        return
      }




  var sqlString =  "SELECT P.id, P.dateOfPurchase AS 'date', " + 
                   "S.firstName, S.lastName, " +
									 "S.studentNumber, " + 
                   "P.pointAmount AS 'amount', P.notes, P.submitTimestamp " + 
                   "FROM tbl_libraryPurchase P INNER JOIN " +
                   "tbl_student S ON S.studentNumber = P.student_id " + 
                   "ORDER BY P.submitTimestamp DESC LIMIT 25";

    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting purchases from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numPT = rows.length;
      context.PT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numPT; index++) {
        row = rows[index];
        context.PT.push({
          id : row.id,
					num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

          console.log("Query sent successfully.");
          context.successList.push("Purchase for " + amount + 
              " points added to " + studentName + 
              "'s account successfully.");

          res.render("newPurchase", context);

        }); // end query most recent purchases 
      }); // end query for insert
    } // end if test correct response


      // STUDENT DID NOT EXIST IN DATABASE
      else {



  // QUERY FOR MOST RECENT PURCHASES:
  var sqlString =  "SELECT P.id, P.dateOfPurchase AS 'date', " + 
                   "S.firstName, S.lastName, " +
									 "S.studentNumber, " + 
                   "P.pointAmount AS 'amount', P.notes, P.submitTimestamp " + 
                   "FROM tbl_libraryPurchase P INNER JOIN " +
                   "tbl_student S ON S.studentNumber = P.student_id " + 
                   "ORDER BY P.submitTimestamp DESC LIMIT 25";

    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting purchases from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numPT = rows.length;
      context.PT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numPT; index++) {
        row = rows[index];
        context.PT.push({
          id : row.id,
				  num : row.studentNumber, 
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

        res.render("newPurchase", context);

      }); // end query most recent purchase
    } // END ELSE (student did not exist in database)
  }); // end query for test student number
});

















// +==========================================+
// |             SEARCH STUDENT               |
// +==========================================+

app.get("/search", function (req, res, next) {

  var context = {
    errorList: []
  };

  res.render('searchStudent');
});



app.get("/student", function (req, res, next) {

  var context = {
    errorList: []
  };
  var completeForm = true; // true until proven false

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");


  // This is the passed in scanID:
  var fullNum = req.query.scanID;

  // EMPTY:
  if (fullNum.length <= 0) {
    completeForm = false;
    context.errorList.push("Invalid ID card");
    res.render('searchStudent', context);
  }


  // VALID SCAN, SEARCH DATABASE:
  else { 

    // fill string with zeros at the beginning if needed:
    if (fullNum.length < 6) {
      var neededZeros = 6 - fullNum.length;
      var zString = "";
      while (neededZeros > 0) {
        zString += "0";
        neededZeros--;
      }

      var newString = zString + fullNum;

      // replace string here:
      fullNum = newString;
    }


    // This is what will be sent to the QUERY!
    context.studentNum = fullNum.substr(fullNum.length - 6);


    var sqlString = "SELECT S.studentNumber, SCH.name AS 'school', " +
                    "AG.name AS 'ageGroup', " +
                     "S.firstName, S.lastName FROM tbl_student S " +
                     "INNER JOIN tbl_school SCH ON SCH.id = S.school_id " + 
                     "INNER JOIN tbl_ageGroup AG ON AG.id = S.ageGroup_id " + 
                     "WHERE S.studentNumber = ?";

    // array of parameters:
    var inserts = [context.studentNum];

    // SEND the query:
    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
        if (err) {
          console.log("Error in selecting student from DB.");
          next(err);
          return;
        }


        // Gather student info and shoot it to handlebars:
        var numEntries = rows.length;

        if (numEntries == 1) {
          row = rows[0];
          context.studentNumber = row.studentNumber;
          context.school = row.school;
          context.ageGroup = row.ageGroup;
          context.firstName = row.firstName;
          context.lastName = row.lastName;
          context.lifeTimeEarned = 0; // starts at zero, incremented further down
          context.lifeTimeSpent = 0; // starts at zero, incremented further down




          // RUN ANOTHER QUERY FOR TICKETS:
          var ticketSql = "SELECT T.id, " + 
                          "T.dateCompleted AS 'dateCompleted', " + 
                          "WT.name AS 'workType', " + 
                          "T.pointEarnedAmount, " + 
                          "T.notes " + 
                          "FROM tbl_libraryTicket T " +
                          "INNER JOIN tbl_student S ON S.studentNumber = T.student_id " +
                          "INNER JOIN tbl_libraryWorkType WT ON WT.id = T.libraryWorkType " + 
                          "WHERE S.studentNumber = ? " +
                          "ORDER BY T.dateCompleted DESC LIMIT 15";

          var ticketInsert = [context.studentNumber];

          // SEND the query:
          mysql.pool.query(ticketSql, ticketInsert, function(err, Trows, fields){
              if (err) {
                console.log("Error in selecting student tickets from DB.");
                next(err);
                return;
              }

              // Gather ticket info and shoot it to handlebars:
              context.numTickets = Trows.length;
              context.ticket = [];

              var index;
              var Trow;
              for (index = 0; index < context.numTickets; index++) {
                Trow = Trows[index];
                context.ticket.push({
                  id : Trow.id,
                  date : moment(Trow.dateCompleted).format("MM.DD.YYYY"),
                  workType : Trow.workType,
                  pointsEarned : Trow.pointEarnedAmount,
                  notes : Trow.notes
                });

                context.lifeTimeEarned += parseInt(Trow.pointEarnedAmount); // started at zero above

              } // end for


          


              // RUN ANOTHER QUERY FOR PURCHASES:
              var purchaseSql = "SELECT P.id, " + 
                              "P.dateOfPurchase AS 'date', " + 
                              "P.pointAmount, " + 
                              "P.notes " + 
                              "FROM tbl_libraryPurchase P " +
                              "INNER JOIN tbl_student S ON S.studentNumber = P.student_id " +
                              "WHERE S.studentNumber = ? " +
                              "ORDER BY P.dateOfPurchase DESC LIMIT 15";

              var purchaseInsert = [context.studentNumber];

              // SEND the query:
              mysql.pool.query(purchaseSql, purchaseInsert, function(err, Prows, fields){
                  if (err) {
                    console.log("Error in selecting student purchases from DB.");
                    next(err);
                    return;
                  }

                  // Gather purchase info and shoot it to handlebars:
                  context.numPurchases = Prows.length;
                  context.purchase = [];

                  var index;
                  var Prow;
                  for (index = 0; index < context.numPurchases; index++) {
                    Prow = Prows[index];
                    context.purchase.push({
                      id : Prow.id,
                      date : moment(Prow.date).format("MM.DD.YYYY"),
                      amount : Prow.pointAmount,
                      notes : Prow.notes
                    });

                    context.lifeTimeSpent += parseInt(Prow.pointAmount); // started at zero above
                  } // end for

                  // FINALLYYYY DISPLAY THE PAGE:

                  // Here is the current balance
                  var balance = parseInt(context.lifeTimeEarned) - 
                    parseInt(context.lifeTimeSpent);

                  // set balance color depending on balance:
                  if (balance < 0) 
                    context.balanceRed = "true";
                  else if (balance == 0)
                    context.balanceYellow = "true";
                  else 
                    context.balanceGreen = "true";

                  context.balance = balance;
                  res.render('studentDisplay', context);

            }); // end PURCHASES query
          }); // end TICKET query

        } // END MAKE SURE THERE IS ONLY 1 ENTRY FOR STUDENT
        else if (numEntries <= 0){
          context.errorList.push("Student with ID (" + context.studentNum + ") not found in database.");
          res.render('newStudent', context);

          //value="{{studentNum}}"></td></tr>

        }
        else {
          context.errorList.push("Multiple students found with same id! Please update database.");
          res.render('searchStudent', context);
        }

       }); // end student query
  } // end no errors in input
});








// USING NAME:
app.post("/searchStudentName", function (req, res, next) {

  var context = {
    errorList: []
  };

  var completeForm = true; // true until proven false

  context.fName = req.body.firstName;
	var fNameParse = "%" + req.body.firstName + "%";
  context.lName = req.body.lastName;
	var lNameParse = "%" + req.body.lastName + "%";

  if ((context.fName.length <= 0) && (context.lName.length <= 0)) {
    completeForm = false;
    context.errorList.push("Please Provide either a first or last name");
    res.render('searchStudent', context);
  }



  // SEARCH DATABASE (no errors in input)
  else {

    // QUERY HERE:

    var sqlString = "SELECT S.studentNumber, SCH.name AS 'school', " +
                    "AG.name AS 'ageGroup', " +
                     "S.firstName, S.lastName FROM tbl_student S " +
                     "INNER JOIN tbl_school SCH ON SCH.id = S.school_id " + 
                     "INNER JOIN tbl_ageGroup AG ON AG.id = S.ageGroup_id " + 
                     "WHERE ";

    // array of parameters:
    var inserts = [];

    // first name provided:
    if (context.fName.length > 0) {
      sqlString += "firstName LIKE ?";
      inserts.push(fNameParse);
    }

    if (context.fName.length > 0 && context.lName.length > 0)
      sqlString += " AND ";

    if (context.lName.length > 0) {
      sqlString += "lastName LIKE ?";
      inserts.push(lNameParse);
    }

		// last name alphebetical:
		sqlString += " ORDER BY lastName";

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
            school : row.school,
            ageGroup : row.ageGroup,
            firstName : row.firstName,
            lastName : row.lastName
          });
        } // end for

        res.render('studentSearchResults', context);
       });
  } // end no errors in input

});








// +==========================================+
// |             REPORTS                      |
// +==========================================+

app.get("/reports", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");

  res.render('reports', context);

});










app.post("/reports-studentWork", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");

  context.id = req.body.studentNumber;
  context.fName = req.body.firstName;
  context.lName = req.body.lastName;
  context.dateBeg = req.body.dateB;
  context.dateEnd = req.body.dateE;
  context.WT = req.body.workType;
  context.school = req.body.school_id;
  context.AG = req.body.ageGroup_id;
	context.sort = req.body.sortBy;

  // Check boxes:
  var hitlists = [];
  var getString;
  if (req.body.hitlist_school)   // school work
    hitlists.push(req.body.hitlist_school);
  if (req.body.hitlist_reading) // reading
    hitlists.push(req.body.hitlist_reading);
  if (req.body.hitlist_math)    // math
    hitlists.push(req.body.hitlist_math);

  // Save the data in case there were errors:
  context.h_schoolWork = hitlists.includes("1"); // helper function
  context.h_reading = hitlists.includes("2");    // helper function
  context.h_math = hitlists.includes("3");       // helper function

	// ERROR CHECKING:
  // STUDENT NUMBER
  var studentNumInt = parseInt(context.id);
  if (studentNumInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be greater than zero.");
  } else if (studentNumInt > MAX_STUDENT_NUM) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be less than " + MAX_STUDENT_NUM + ".");
  }


	// CHECK BEGIN DATE EARLIER THAN END DATE:
  if (moment(context.dateEnd, 'DD-MM-YYYY').isBefore(moment(context.dateBeg, 'DD-MM-YYYY'))) {
    context.errorList.push("Field Error: Beginning date must be earlier or the same as the end date");
		completeForm = false;
	}


	if (completeForm) {

		// QUERY HERE:
		var sqlString = "SELECT S.studentNumber, S.firstName, S.lastName, " + 
										"SCH.name AS 'school', " + "AG.name AS 'ageGroup', " + "WT.name AS 'workType', " + 
										"T.id AS 'tid', T.pointEarnedAmount AS 'amount', T.dateCompleted AS 'dateC', T.notes " + 
										 "FROM tbl_student S " +
										 "INNER JOIN tbl_school SCH ON SCH.id = S.school_id " + 
										 "INNER JOIN tbl_ageGroup AG ON AG.id = S.ageGroup_id " + 
										 "INNER JOIN tbl_libraryTicket T ON T.student_id = S.studentNumber " + 
										 "INNER JOIN tbl_libraryWorkType WT ON WT.id = T.libraryWorkType " + 
										 "WHERE ";


		// array of parameters:
		var inserts = [];

		// helps us know when to use 'AND' in query
		var conditionCount = 0;

		// student number provided:
		if (context.id != "") {
			if (conditionCount > 0)
				sqlString += " AND ";
			sqlString += "studentNumber = ?";
			inserts.push(context.id);
			conditionCount++;
		}

		// first name provided:
		if (context.fName.length > 0) {
			if (conditionCount > 0)
				sqlString += " AND ";
			sqlString += "firstName = ?";
			inserts.push(context.fName);
			conditionCount++;
		}

		// Last name provided:
		if (context.lName.length > 0) {
			if (conditionCount > 0)
				sqlString += " AND ";
			sqlString += "lastName = ?";
			inserts.push(context.lName);
			conditionCount++;
		}

		// WORK TYPE (if provided)
		if (parseInt(context.WT) != 0) {
			if (conditionCount > 0)
				sqlString += " AND ";
			sqlString += "T.libraryWorkType = ?";
			inserts.push(context.WT);
			conditionCount++;
		}

		// SCHOOL (if provided)
		if (parseInt(context.school) != 0) {
			if (conditionCount > 0)
				sqlString += " AND ";
			sqlString += "S.school_id = ?";
			inserts.push(context.school);
			conditionCount++;
		}

		// AGE GROUP (if provided)
		if (parseInt(context.AG) != 0) {
			if (conditionCount > 0)
				sqlString += " AND ";
			sqlString += "S.ageGroup_id = ?";
			inserts.push(context.school);
			conditionCount++;
		}


		// HIT LISTS HERE:




		// dates
		var dayBeg = moment(context.dateBeg).format('YYYY-MM-DD');
		var dayEnd = moment(context.dateEnd).format('YYYY-MM-DD');
		//console.log("searching from " + dayBeg + " to " + dayEnd);

		if (conditionCount > 0)
			sqlString += " AND ";
		sqlString += "T.dateCompleted BETWEEN '" + dayBeg + "' AND '" + dayEnd + "' ";


		// One result per ticket:
    sqlString += "GROUP BY T.id ";


		// HOW TO ORDER RESULTS:
		sqlString += "ORDER BY T.dateCompleted DESC, ";

		// SORT BY LAST NAME
		if (parseInt(context.sort) == 1) {
			sqlString += "S.lastName ";
		}

		// SORT BY FIRST NAME
		else if (parseInt(context.sort) == 2) {
			sqlString += "S.firstName ";
		}

		// SORT BY AGE GROUP 
		else if (parseInt(context.sort) == 3) {
			sqlString += "S.ageGroup_id ";
		}

		// SORT BY SCHOOL
		//else if (parseInt(context.sort) == 4) 
		else {
			sqlString += "S.school_id ";
		}


		//console.log("total string = " + sqlString);
		//console.log("TOTAL CONDITIONS = " + conditionCount);
		//console.log("INSERTS = " + inserts.length);


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
						school : row.school,
						ageGroup : row.ageGroup,
						firstName : row.firstName,
						lastName : row.lastName,

						tid : row.tid,
						date : moment(row.dateC).format("MM.DD.YYYY"),
						workType : row.workType,
						points : row.amount,
						notes : row.notes
					});
				} // end for


				res.render('report-studentWork', context);

			 });

		//alert("Error in report query, contact web app admin (Cam)");

	} // there was input field errors in the form

	else {
		res.render('reports', context);
	}

});
















app.get("/minecraftClub", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

	// DEFAULT settings:
	var daysRequirement = 2;
  var beg = "\"" + moment(moment().startOf('isoWeek')).format("YYYY-MM-DD") + "\"";
  var end = "\"" + moment(moment().endOf('isoWeek')).format("YYYY-MM-DD") + "\"";
	context.beg = beg;
	context.end = end;
	console.log("Generating Minecraft Club report between " + beg + " and " + end + "...");


	
  var reqDays = req.query.days;
	if (reqDays > 0)
		daysRequirement = reqDays;
	context.days = daysRequirement;


/* THIS WORKS (in PHPmyAdmin):
SELECT temp.id, temp.fn, temp.ln, temp.w
FROM 
    (SELECT temp2.ID AS "id", temp2.fName AS "fn", temp2.lName AS "ln", COUNT(*) AS "w"
    FROM 
        (SELECT S.studentNumber AS "ID", S.firstName AS "fName", S.lastName AS "lName", 
         LT.dateCompleted, COUNT(*) AS "num" FROM tbl_student S 
         INNER JOIN tbl_libraryTicket LT ON LT.student_id = S.studentNumber 
         WHERE LT.dateCompleted BETWEEN "2018-04-02" AND "2018-04-06" 
         GROUP BY S.studentNumber, LT.dateCompleted) AS temp2
    GROUP BY temp2.ID) AS temp
    
WHERE temp.w >= 3
*/

	var sqlString = "SELECT temp.id, temp.fn, temp.ln, temp.w " + 
									"FROM " + 
    								"(SELECT temp2.ID AS 'id', temp2.fName AS 'fn', temp2.lName AS 'ln', COUNT(*) AS 'w' " + 
    								"FROM " + 
        							"(SELECT S.studentNumber AS 'ID', S.firstName AS 'fName', S.lastName AS 'lName', " + 
         							"LT.dateCompleted, COUNT(*) AS 'num' FROM tbl_student S " + 
         							"INNER JOIN tbl_libraryTicket LT ON LT.student_id = S.studentNumber " + 
											"WHERE LT.dateCompleted BETWEEN " + beg + " AND " + end + " " + 
         							"GROUP BY S.studentNumber, LT.dateCompleted) AS temp2 " + 
    							"GROUP BY temp2.ID) AS temp " + 
									"WHERE temp.w >= " + daysRequirement +
									" ORDER BY temp.w DESC, temp.ln";


	// array of parameters:
	var inserts = [];

	// SEND the query:
	mysql.pool.query(sqlString, inserts, function(err, rows, fields){

		// SQL ERROR
		if (err) {
			console.log("Error in selecting student from DB.");
			next(err);
			return;
		}

		// Gather student info and shoot it to handlebars:
		context.numStudents = rows.length;
		context.S = []; // Each student in returned table

		var index;
		var row;

		for (index = 0; index < context.numStudents; index++) {
			row = rows[index];
			context.S.push({
				id : row.id,
				fName : row.fn,
				lName : row.ln,
				works : row.w
			});

		} // end for

		// RENDER PAGE:
		res.render('minecraft', context);

	}); // end query for insert

});













// +==========================================+
// |         NEW PANTHER TICKET               |
// +==========================================+


app.get("/pantherTicket", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");

  var sqlString = "SELECT T.id, T.dateCompleted AS 'date', " + 
									"S.studentNumber, " +
									"S.firstName, S.lastName, WT.name AS 'type', " +
									"T.points AS 'amount', T.notes, T.submitTimestamp " + 
									"FROM tbl_pantherTicket T INNER JOIN " + 
									"tbl_student S ON S.studentNumber = T.student_id INNER JOIN " +
									"tbl_pantherWorkType WT ON WT.id = T.workType " +
									"ORDER BY T.submitTimestamp DESC LIMIT 50";


    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting Tickets from database.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numTT = rows.length;
      context.TT = []; 

      var index;
      var row;
      for (index = 0; index < context.numTT; index++) {
        row = rows[index];
        context.TT.push({
          id : row.id,
					num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          type : row.type,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

  		res.render("newPT", context);

     }); // end query select all students


});






























app.post("/pantherTicket", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;

  // FIRST get student number to see if student exists:
  var studentNum = req.body.studentNumber;

  mysql.pool.query("SELECT S.studentNumber, S.firstName FROM tbl_student S " + 
                   "WHERE S.studentNumber = ?", [studentNum], 
     function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      if (rows.length <= 0) {
        completeForm = false;
        context.errorList.push("Student with ID number " + studentNum + " does not exist in database yet.");
      }


  // Get variables to be used for database Query:
  var date = req.body.date;
  var amount = req.body.amount;
  var workType = req.body.workType;
  var notes = req.body.notes;

  // Save the data in case there were errors:
  context.studentNum = req.body.studentNumber;

  // only override today's date if necessary
  if (date)
    context.todayDate = req.body.date;

  context.amount = parseInt(req.body.amount);
  context.workType = req.body.workType;
  context.notes = req.body.notes;


  // STUDENT NUMBER
  var studentNumInt = parseInt(studentNum);
  if (studentNum == "") {
    completeForm = false;
    context.errorList.push("Required Field: Student Number");
  } else if (studentNumInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be greater than zero.");
  } else if (studentNumInt > MAX_STUDENT_NUM) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be less than " + MAX_STUDENT_NUM + ".");
  }

  // DATE
  if (date == "") {
    completeForm = false;
    context.errorList.push("Required Field: Date");
  }

  // Work Type
  if (workType == "") {
    completeForm = false;
    context.errorList.push("Required Field: Work Type");
  }

  // Amount
  var amountInt = parseInt(amount);
  if (amount == "") {
    completeForm = false;
    context.errorList.push("Required Field: Amount");
  } else if (amountInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Point amount must be zero or greater. Use purchase for point reduction.");
  }

  // TEST CORRECT RESPONSE:
  if (completeForm) {
    console.log("New Panther Ticket:");
    console.log("\tStudent Number: " + studentNum);
    console.log("\tDate: " + date);
    console.log("\tAmount: " + amount);
    console.log("\tWork Type: " + workType);
    console.log("\tNotes: " + notes);


    // Query the database (insert):
    var sqlString2 = "INSERT INTO tbl_pantherTicket " + 
                    "(`student_id`, `workType`, " +  
                    "`points`, `dateCompleted`, `notes`) " + 
                    "VALUES (?, ?, ?, ?, ?)";

    // array of parameters:
    var inserts2 = [studentNum, workType, amount, date, notes];

    // SEND the query:
    mysql.pool.query(sqlString2, inserts2, function(err, results){
      if(err){
        next(err);
        return
      }

      console.log("Query sent successfully.");
      context.successList.push("Panther Ticket for " + amount + " points added successfully to account: " + studentNum);


	// QUERY FOR MOST RECENT TICKETS
  var sqlString = "SELECT T.id, T.dateCompleted AS 'date', " + 
									"S.studentNumber, " +
									"S.firstName, S.lastName, WT.name AS 'type', " +
									"T.points AS 'amount', T.notes, T.submitTimestamp " + 
									"FROM tbl_pantherTicket T INNER JOIN " + 
									"tbl_student S ON S.studentNumber = T.student_id INNER JOIN " +
									"tbl_pantherWorkType WT ON WT.id = T.workType " +
									"ORDER BY T.submitTimestamp DESC LIMIT 50";


    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting Tickets from database.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numTT = rows.length;
      context.TT = []; 

      var index;
      var row;
      for (index = 0; index < context.numTT; index++) {
        row = rows[index];
        context.TT.push({
          id : row.id,
					num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          type : row.type,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

  		res.render("newPT", context);

     }); // end query most recent tickets
   }); // end query for insert


	} // end if test correct response


		// STUDENT DID NOT EXIST IN DATABASE:
		else {

	// QUERY FOR MOST RECENT TICKETS
  var sqlString = "SELECT T.id, T.dateCompleted AS 'date', " + 
									"S.studentNumber, " +
									"S.firstName, S.lastName, WT.name AS 'type', " +
									"T.points AS 'amount', T.notes, T.submitTimestamp " + 
									"FROM tbl_pantherTicket T INNER JOIN " + 
									"tbl_student S ON S.studentNumber = T.student_id INNER JOIN " +
									"tbl_pantherWorkType WT ON WT.id = T.workType " +
									"ORDER BY T.submitTimestamp DESC LIMIT 50";


    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting Tickets from database.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numTT = rows.length;
      context.TT = []; 

      var index;
      var row;
      for (index = 0; index < context.numTT; index++) {
        row = rows[index];
        context.TT.push({
          id : row.id,
					num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          type : row.type,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

  		res.render("newPT", context);

     }); // end query most recent tickets
		} // END ELSE
  }); // end query for test student number
});

















// +==========================================+
// |         NEW PANTHER Purchase             |
// +==========================================+

app.get("/pantherPurchase", function (req, res, next) {



  var context = {
    errorList: [],
    successList: []
  };

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");


  var sqlString =  "SELECT P.id, P.dateOfPurchase AS 'date', " + 
                   "S.firstName, S.lastName, " +
									 "S.studentNumber, " + 
                   "P.pointAmount AS 'amount', P.notes, P.submitTimestamp " + 
                   "FROM tbl_pantherPurchase P INNER JOIN " +
                   "tbl_student S ON S.studentNumber = P.student_id " + 
                   "ORDER BY P.submitTimestamp DESC LIMIT 50";

    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting panther purchases from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numPT = rows.length;
      context.PT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numPT; index++) {
        row = rows[index];
        context.PT.push({
          id : row.id,
				  num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

  		res.render("newPP", context);

     }); // end query select all students
});





app.post("/pantherPurchase", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // DATA VALIDATION BEFORE QUERY (make this more robust later..)
  var completeForm = true;

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");


  // FIRST get student number to see if student exists:
  var studentNum = req.body.studentNumber;

  mysql.pool.query("SELECT S.studentNumber, S.firstName FROM tbl_student S " + 
                   "WHERE S.studentNumber = ?", [studentNum], 
     function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      if (rows.length <= 0) {
        completeForm = false;
        context.errorList.push("Student with ID number " + studentNum + " does not exist in database yet.");
      }


  // Get variables to be used for database Query:
  var date = req.body.date;
  var amount = req.body.amount;
  var notes = req.body.notes;

  // Save the data in case there were errors:
  context.studentNum = req.body.studentNumber;

  // only override today's date if necessary
  if (date)
    context.todayDate = req.body.date;

  context.amount = parseInt(req.body.amount);
  context.notes = req.body.notes;


  // STUDENT NUMBER
  var studentNumInt = parseInt(studentNum);
  if (studentNum == "") {
    completeForm = false;
    context.errorList.push("Required Field: Student Number");
  } else if (studentNumInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be greater than zero.");
  } else if (studentNumInt > MAX_STUDENT_NUM) {
    completeForm = false;
    context.errorList.push("Field Error: Student Number must be less than " + MAX_STUDENT_NUM + ".");
  }

  // DATE
  if (date == "") {
    completeForm = false;
    context.errorList.push("Required Field: Date");
  }

  // Amount
  var amountInt = parseInt(amount);
  if (amount == "") {
    completeForm = false;
    context.errorList.push("Required Field: Amount");
  } else if (amountInt < 0) {
    completeForm = false;
    context.errorList.push("Field Error: Point amount must be greater than zero.");
  }

  // TEST CORRECT RESPONSE:
  if (completeForm) {
    console.log("New Purchase:");
    console.log("\tStudent Number: " + studentNum);
    console.log("\tDate: " + date);
    console.log("\tAmount: " + amount);
    console.log("\tNotes: " + notes);


    // Query the database (insert):
    var sqlString2 = "INSERT INTO tbl_pantherPurchase " + 
                    "(`student_id`, " +  
                    "`pointAmount`, `dateOfPurchase`, `notes`) " + 
                    "VALUES (?, ?, ?, ?)";

    // array of parameters:
    var inserts2 = [studentNum, amount, date, notes];

    // SEND the query:
    mysql.pool.query(sqlString2, inserts2, function(err, results){
      if(err){
        next(err);
        return
      }



  var sqlString =  "SELECT P.id, P.dateOfPurchase AS 'date', " + 
                   "S.firstName, S.lastName, " +
									 "S.studentNumber, " + 
                   "P.pointAmount AS 'amount', P.notes, P.submitTimestamp " + 
                   "FROM tbl_pantherPurchase P INNER JOIN " +
                   "tbl_student S ON S.studentNumber = P.student_id " + 
                   "ORDER BY P.submitTimestamp DESC LIMIT 50";

    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting purchases from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numPT = rows.length;
      context.PT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numPT; index++) {
        row = rows[index];
        context.PT.push({
          id : row.id,
					num : row.studentNumber,
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

          console.log("Query sent successfully.");
          context.successList.push("Panther Purchase for " + amount + 
              " points added to " + studentName + 
              "'s account successfully.");

          res.render("newPP", context);

        }); // end query most recent purchases 
      }); // end query for insert
    } // end if test correct response


      // STUDENT DID NOT EXIST IN DATABASE
      else {



  // QUERY FOR MOST RECENT PURCHASES:
  var sqlString =  "SELECT P.id, P.dateOfPurchase AS 'date', " + 
                   "S.firstName, S.lastName, " +
									 "S.studentNumber, " + 
                   "P.pointAmount AS 'amount', P.notes, P.submitTimestamp " + 
                   "FROM tbl_pantherPurchase P INNER JOIN " +
                   "tbl_student S ON S.studentNumber = P.student_id " + 
                   "ORDER BY P.submitTimestamp DESC LIMIT 50";


    var inserts = [];

    mysql.pool.query(sqlString, inserts, function(err, rows, fields){
      if (err) {
        console.log("Error in selecting purchases from DB.");
        next(err);
        return;
      }

      // Gather student info and shoot it to handlebars:
      context.numPT = rows.length;
      context.PT = []; // Tickets Today

      var index;
      var row;
      for (index = 0; index < context.numPT; index++) {
        row = rows[index];
        context.PT.push({
          id : row.id,
				  num : row.studentNumber, 
          date : moment(row.date).format("MM-DD-YYYY"),
          fName : row.firstName,
          lName : row.lastName,
          amount : row.amount,
          notes : row.notes
        });

      } // end for

        res.render("newPP", context);

      }); // end query most recent purchase
    } // END ELSE (student did not exist in database)
  }); // end query for test student number
});





















































// +==========================================+
// |         PANTHER REPORTS                  |
// +==========================================+

app.get("/pantherReports", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  res.render("PR", context);

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
    console.log('Express started with local ip and port ' + 
      app.get('port') + '; press Ctrl-C to terminate.');
});




