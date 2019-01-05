

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){


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









}
