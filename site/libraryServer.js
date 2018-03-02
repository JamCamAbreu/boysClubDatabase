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

// ========== MOMENT (EASY DATES) =====
var moment = require("moment");


// ======= CONSTANTS ==================
var MAX_STUDENT_NUM = 999999;



// ------------- HOME PAGE -------------==

app.get("/", function (req, res, next) {
  res.render('home');
});













// TODO: Error thrown when duplicate student already exists! (student number
// already exists) - Crashes site. TODO TODO TODO

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
      context.successList.push("Ticket for " + amount + " points added successfully.");




  // QUERY FOR MOST RECENT TICKETS
  var sqlString =  "SELECT T.id, T.dateCompleted AS 'date', " + 
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





// USING SCAN MACHINE:
app.post("/searchStudentScanCard", function (req, res, next) {

  var context = {
    errorList: []
  };
  var completeForm = true; // true until proven false

  // This is the passed in scanID:
  var fullNum = req.body.scanID;

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
                  context.balance = parseInt(context.lifeTimeEarned) - parseInt(context.lifeTimeSpent);
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
  context.lName = req.body.lastName;

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










app.post("/reports", function (req, res, next) {

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




