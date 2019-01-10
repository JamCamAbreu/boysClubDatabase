

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){



// +==========================================+
// |        ADD NEW STUDENT TO DB             |
// +==========================================+
app.get("/editStudent", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };

  // Get variables to be used for database Query:
  var studentNum = req.query.studentNumber;

	var qStr = "SELECT S.studentNumber, S.firstName, S.lastName, " + 
									 "S.ageGroup_id, S.school_id " + 
                   "FROM tbl_student S " + 
                   "WHERE S.studentNumber = " + studentNum;


  mysql.pool.query( qStr, [], 
     function(err, rows, fields){
      if (err) {
        console.log("Error in selecting students from DB.");
        next(err);
        return;
      }

      if (rows.length < 1) {
        completeForm = false;
        context.errorList.push("Student with ID number " + studentNum + 
          "does not yet exist!");
      }

			else {
				// Save the data in case there were errors:
				row = rows[0];
				context.studentNum = parseInt(row.studentNumber);
				context.fName = row.firstName;
				context.lName = row.lastName
				context.school_id = parseInt(row.school_id); 
				context.ageG_id = parseInt(row.ageGroup_id);

			}

  	res.render('editStudent', context);
	}); // end query
});








app.post("/editStudent", function (req, res, next) {

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

      if (rows.length < 1) {
        completeForm = false;
        context.errorList.push("Student with ID number " + studentNum + 
          "does not yet exist!");
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

	var id = studentNum;
  var fName = req.body.firstName;
  var lName = req.body.lastName;
  var school_id = req.body.school_id;
  var ageG_id = req.body.ageGroup_id;

    // Query the database (update):
	var qString = "UPDATE tbl_student " + 
								"SET firstName = '" + fName + "', " +
								"lastName = '" + lName + "', " +
								"school_id = " + school_id + ", " + 
								"ageGroup_id = " + ageG_id + " " +
								"WHERE studentNumber = " + id;

	console.log(qString);

    // array of parameters:
    var inserts = [];

    // SEND the query:
    mysql.pool.query(qString, inserts, function(err, results){
      if(err){
        next(err);
        return
      }

      console.log("Student updated successfully.");
    }); // end query

    var name = context.lName + ", " + context.fName;
		context.successList.push(name + ": " + studentNum + " successfully updated.");

  } // end if test correct response

  res.render('editStudent', context);

  }); // end query for student already exists
});



}










