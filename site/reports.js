

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){



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









}
