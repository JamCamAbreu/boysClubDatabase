
// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){


app.get("/readingLab", function (req, res, next) {

  var context = {
    errorList: [],
    successList: []
  };


	// week is what I need to pass. If negative, that many weeks back,
	// if positive, that many weeks forward. 

	// DEFAULT settings:
	var daysRequirement = 1;
  var beg = "\"" + moment(moment().startOf('isoWeek')).format("YYYY-MM-DD") + "\"";
  var end = "\"" + moment(moment().endOf('isoWeek')).format("YYYY-MM-DD") + "\"";
	context.beg = beg.substring(1,beg.length - 1); context.end = end.substring(1, end.length - 1);
	var thisWeek = true;
	
	if (req.query.week) {
		console.log("req.query.week=" + req.query.week);
  	var WEEK = Math.abs(parseInt(req.query.week));

		if (WEEK == 0) { context.week0 = true; }
		else if (WEEK == 1) { context.week1 = true; }
		else if (WEEK == 2) { context.week2 = true; }
		else if (WEEK == 3) { context.week3 = true; }
		else if (WEEK == 4) { context.week4 = true; }

		if (WEEK > 0) {
			thisWeek = false;
			beg = "\"" + moment().subtract(WEEK, 'weeks').startOf('isoWeek').format("YYYY-MM-DD") + "\"";
			end = "\"" + moment().subtract(WEEK, 'weeks').endOf('isoWeek').format("YYYY-MM-DD") + "\"";
			context.beg = beg.substring(1,beg.length - 1); context.end = end.substring(1, end.length - 1);
		}
	}

	console.log("beg=" + beg + ", end=" + end);
	console.log("Generating Top 10 list from:" + beg + " and " + end + "...");
	context.whichWeek = 0;

	if (req.query.prizeStart) { context.prizeStart = req.query.prizeStart; }
	if (req.query.prizeEnd) { context.prizeEnd = req.query.prizeEnd; }
  //context.prizeEnd = moment(moment().endOf('month')).format("YYYY-MM-DD");

	var sqlString = "SELECT temp.id, temp.fn, temp.ln, temp.w, temp.tp " + 
									"FROM " + 
    								"(SELECT temp2.ID AS 'id', temp2.fName AS 'fn', temp2.lName AS 'ln', COUNT(*) AS 'w', " + 
										"SUM(temp2.totalPages) AS 'tp' " + 
    								"FROM " + 
        							"(SELECT S.studentNumber AS 'ID', S.firstName AS 'fName', S.lastName AS 'lName', " + 
         							"LT.dateCompleted, COUNT(*) AS 'num', SUM(LT.pointEarnedAmount) as 'totalPages' " + 
											"FROM tbl_student S " + 
         							"INNER JOIN tbl_libraryTicket LT ON LT.student_id = S.studentNumber " + 
											"WHERE LT.dateCompleted BETWEEN " + beg + " AND " + end + " " + 
         							"GROUP BY S.studentNumber, LT.dateCompleted) AS temp2 " + 
    							"GROUP BY temp2.ID) AS temp " + 
									"WHERE temp.w >= " + daysRequirement +
									" ORDER BY temp.w DESC, temp.tp DESC LIMIT 20";

	console.log("\nSQLSTRING: " + sqlString + "\n\n");

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
				place: (index + 1),
				pagesRead: row.tp,
				id : row.id,
				fName : row.fn,
				lName : row.ln,
				works : row.w
			});

		} // end for


	// Query pages read for students each day this week:
	context.today = moment().format("YYYY-MM-DD");
	var isToday = " (Today)";
	var Mon = moment().subtract(WEEK, 'weeks').day("Monday").format("YYYY-MM-DD");
	if (Mon == context.today && thisWeek == true) { context.monToday = isToday; } 
	var Tue = moment().subtract(WEEK, 'weeks').day("Tuesday").format("YYYY-MM-DD");
	if (Tue == context.today && thisWeek == true) { context.tueToday = isToday; }
	var Wed = moment().subtract(WEEK, 'weeks').day("Wednesday").format("YYYY-MM-DD");
	if (Wed == context.today && thisWeek == true) { context.wedToday = isToday; }
	var Thu = moment().subtract(WEEK, 'weeks').day("Thursday").format("YYYY-MM-DD");
	if (Thu == context.today && thisWeek == true) { context.thuToday = isToday; }
	var Fri = moment().subtract(WEEK, 'weeks').day("Friday").format("YYYY-MM-DD");
	if (Fri == context.today && thisWeek == true) { context.friToday = isToday; }
	context.fri = Fri;
	var startMonth = moment().subtract(WEEK, 'weeks').startOf("month").format("YYYY-MM-DD");
	context.monthName = moment(startMonth).format("MMMM");
	context.startSchoolYear = moment().subtract(WEEK, 'weeks').month("August").startOf("month").format("YYYY-MM-DD");

	// august this year or last year?
	if (moment(context.today).isBefore(moment(context.startSchoolYear))) {
		context.startSchoolYear = moment().subtract(1, 'year').month("August").startOf("month").format("YYYY-MM-DD");
	}


	var dayQ = "SELECT SUM(LT.pointEarnedAmount) AS 'sum' " + 
						 "FROM `tbl_libraryTicket` LT " + 
						 "WHERE LT.dateCompleted ";


	//if (req.query.beg) { startMonth = "\"" + req.query.beg + "\""; }
	//if (req.query.end) { context.today = "\"" + req.query.end + "\""; }


	var mondayQ = "='" + Mon + "'";
	var tuesdayQ = "='" + Tue + "'";
	var wednesdayQ = "='" + Wed + "'";
	var thursdayQ = "='" + Thu + "'";
	var fridayQ = "='" + Fri + "'";
	var monthQ = "BETWEEN '" + startMonth + "' AND '" + context.today + "'";
	var yearQ = "BETWEEN '" + context.startSchoolYear + "' AND '" + context.today + "'";


	// -- SEND MONDAY -->
	mysql.pool.query(dayQ + mondayQ, inserts, function(err, rows, fields){
		if (err) { console.log("Error in selecting student from DB."); next(err); return; }
		var row = rows[0];
		context.pagesMonday = row.sum;
		if (!context.pagesMonday) { context.pagesMonday = '0'; }

	// -- SEND TUESDAY -->
	mysql.pool.query(dayQ + tuesdayQ, inserts, function(err, rows, fields){
		if (err) { console.log("Error in selecting student from DB."); next(err); return; }
		var row = rows[0];
		context.pagesTuesday = row.sum;
		if (!context.pagesTuesday) { context.pagesTuesday = '0'; }


	// -- SEND WEDNESDAY -->
	mysql.pool.query(dayQ + wednesdayQ, inserts, function(err, rows, fields){
		if (err) { console.log("Error in selecting student from DB."); next(err); return; }
		var row = rows[0];
		context.pagesWednesday = row.sum;
		if (!context.pagesWednesday) { context.pagesWednesday = '0'; }


	// -- SEND THURSDAY -->
	mysql.pool.query(dayQ + thursdayQ, inserts, function(err, rows, fields){
		if (err) { console.log("Error in selecting student from DB."); next(err); return; }
		var row = rows[0];
		context.pagesThursday = row.sum;
		if (!context.pagesThursday) { context.pagesThursday = '0'; }


	// -- SEND FRIDAY -->
	mysql.pool.query(dayQ + fridayQ, inserts, function(err, rows, fields){
		if (err) { console.log("Error in selecting student from DB."); next(err); return; }
		var row = rows[0];
		context.pagesFriday = row.sum;
		if (!context.pagesFriday) { context.pagesFriday = '0'; }


	// -- WEEK TOTAL -->
	var weekTotal = 0;
	weekTotal += parseInt(context.pagesMonday, 10);
	weekTotal += parseInt(context.pagesTuesday, 10);
	weekTotal += parseInt(context.pagesWednesday, 10);
	weekTotal += parseInt(context.pagesThursday, 10);
	weekTotal += parseInt(context.pagesFriday, 10);
	context.pagesWeekTotal = weekTotal; // set context here

	// Query pages read this month total:
	// -- SEND MONTH -->

	console.log(dayQ + monthQ);

	mysql.pool.query(dayQ + monthQ, inserts, function(err, rows, fields){
		if (err) { console.log("Error in selecting student from DB."); next(err); return; }
		var row = rows[0];
		context.pagesMonthTotal = row.sum;
		if (!context.pagesMonthTotal) { context.pagesMonthTotal = '0'; }


	// Query pages read this year total:
	// -- SEND SCHOOL YEAR -->
	mysql.pool.query(dayQ + yearQ, inserts, function(err, rows, fields){
		if (err) { console.log("Error in selecting student from DB."); next(err); return; }
		var row = rows[0];
		context.pagesProgramTotal = row.sum;
		if (!context.pagesProgramTotal) { context.pagesProgramTotal = '0'; }


	// Reading Winners:
	var sqlString = "SELECT RW.id, RW.student_id, RW.notes, RW.submitTimestamp, S.firstName, S.lastName " +
									"FROM tbl_readingWinner RW " + 
									"INNER JOIN tbl_student S on RW.student_id = S.studentNumber " + 
									"ORDER BY submitTimestamp DESC LIMIT 10";

	console.log(sqlString);

	// array of parameters:
	var inserts = [];

	// SEND the query:
	mysql.pool.query(sqlString, inserts, function(err, rows, fields){

		console.log("Number of winners: " + rows.length);

		// SQL ERROR
		if (err) {
			console.log("Error in reading winner query");
			next(err);
			return;
		}

		// Gather student info and shoot it to handlebars:
		context.numWinners = rows.length;
		context.winner = []; // Each student in returned table

		var index;
		var row;

		for (index = 0; index < context.numWinners; index++) {
			row = rows[index];

			var t = row.submitTimestamp;
			var timeS = moment(t).format("MM-DD-YYYY");

			context.winner.push({
				row_id : row.id,
				date : timeS,
				fName : row.firstName,
				lName : row.lastName,
				id : row.student_id,
				notes : row.notes
			});
		} // end for





		var sqlString = "SELECT SUM(pointEarnedAmount) as pts, dateCompleted as dte " +
										"FROM `tbl_libraryTicket` " + 
										"GROUP BY dateCompleted " +
										"ORDER BY dateCompleted DESC " +
										"LIMIT 30 ";



		// SEND the query:
		mysql.pool.query(sqlString, inserts, function(err, rows, fields){

			// SQL ERROR
			if (err) {
				console.log("Error in selecting student from DB.");
				next(err);
				return;
			}

			context.data1 = [];
			context.data2 = [];

			var index;
			var row;
			for (index = 0; index < rows.length; index++) {
				row = rows[index];
				context.data1.push(row.pts);

				var d = "'" + moment(row.dte).format("M-DD") + "'";
				if (index != 0) {
					context.data2.push(d);
				} else { context.data2.push("'Latest'"); }
			} // end for

			context.data1.reverse();
			context.data2.reverse();






		// PAGES READ PER WEEK
		var sqlString = "SELECT SUM(dayPoints) as weekPoints, " +
											"weekNumber FROM " +
													"(SELECT SUM(pointEarnedAmount) as dayPoints,  " +
													"dateCompleted as dte, " +
													"ROUND(DATEDIFF('" + context.today + "', dateCompleted)/7, 0) AS weekNumber " +
													"FROM `tbl_libraryTicket`  " +
													"GROUP BY dateCompleted " +
													"ORDER BY dateCompleted DESC " +
													"LIMIT 30) AS part " +
											"GROUP BY WeekNumber";

		// SEND the query:
		mysql.pool.query(sqlString, inserts, function(err, rows, fields){

			// SQL ERROR
			if (err) {
				console.log("Error in selecting student from DB.");
				next(err);
				return;
			}

			context.weekTotalData = [];
			context.weekTotalWeeks = [];

			var index;
			var row;
			for (index = 0; index < rows.length; index++) {
				row = rows[index];
				context.weekTotalData.push(row.weekPoints);

				var d = "'" + row.weekNumber + " weeks ago'";
				if (index != 0) {
					context.weekTotalWeeks.push(d);
				} else { context.weekTotalWeeks.push("'This Week'"); }
			} // end for

			context.weekTotalData.reverse();
			context.weekTotalWeeks.reverse();














		// UNIQUE STUDENTS PER WEEK
		var sqlString = "SELECT COUNT(*) as numberUniqueStudents, " +
										"weekNumber FROM " +
												"(SELECT student_id as si, " +
												"ROUND(DATEDIFF('" + context.today + "', dateCompleted)/7, 0) AS weekNumber " +
												"FROM `tbl_libraryTicket`  " +
												"GROUP BY si, weekNumber) AS part " +
										"GROUP BY WeekNumber ";

		// SEND the query:
		mysql.pool.query(sqlString, inserts, function(err, rows, fields){

			// SQL ERROR
			if (err) {
				console.log("Error in selecting student from DB.");
				next(err);
				return;
			}

			context.weekUniqueStudents = [];
			context.weekUniqueStudentsWeeks = [];

			var index;
			var row;
			for (index = 0; index < rows.length; index++) {
				row = rows[index];
				context.weekUniqueStudents.push(row.numberUniqueStudents);

				var d = "'" + row.weekNumber + " weeks ago'";
				if (index != 0) {
					context.weekUniqueStudentsWeeks.push(d);
				} else { context.weekUniqueStudentsWeeks.push("'This Week'"); }
			} // end for

			context.weekUniqueStudents.reverse();
			context.weekUniqueStudentsWeeks.reverse();







		// UNIQUE STUDENTS in whole program:
		var sqlString = "SELECT COUNT(*) as numberUniqueStudents FROM " +
											"(SELECT student_id as si " +
											"FROM `tbl_libraryTicket`  " +
											"GROUP BY si) AS part ";


		// SEND the query:
		mysql.pool.query(sqlString, inserts, function(err, rows, fields){

			// SQL ERROR
			if (err) {
				console.log("Error in selecting student from DB.");
				next(err);
				return;
			}

			context.totalUniqueStudents = rows[0].numberUniqueStudents;

		// RENDER PAGE:
		res.render('readingLab', context);

	}); // end query for unique students TOTAL

	}); // end query for unique students graph
	}); // end query for Weekly pages GRAPH
	}); // end query for Daily Pages 30 days GRAPH

	}); // end query for Recent Winners Reading

	}); // end query for Year 
	}); // end query for Month 
	}); // end query for Friday 
	}); // end query for Thursday 
	}); // end query for Wednesday
	}); // end query for Tuesday 
	}); // end query for Monday 

	}); // end query for days read this week
});














app.get("/getWinner", function (req, res, next) {


	var beginDate = req.query.begin;
	var endDate = req.query.end;
	var notes = req.query.notes;

	res.setHeader("Content-Type", "application/json");
	var winText = "0";

	var qString = " SELECT temp.id, temp.fn, temp.ln, temp.w FROM " +
	"(SELECT temp2.ID AS 'id', temp2.fName AS 'fn', temp2.lName AS 'ln', COUNT(*) AS 'w' FROM " +
		"(SELECT S.studentNumber AS 'ID', S.firstName AS 'fName', S.lastName AS 'lName', " +
		"LT.dateCompleted, COUNT(*) AS 'num' FROM tbl_student S " +
		"INNER JOIN tbl_libraryTicket LT ON LT.student_id = S.studentNumber " +
		"WHERE LT.dateCompleted BETWEEN '" + beginDate + "' AND '" + endDate + "' " + 
		"GROUP BY S.studentNumber, LT.dateCompleted) AS temp2 " +
		"GROUP BY temp2.ID) AS temp " +
"WHERE temp.w >= 1 " +
"ORDER BY temp.w DESC, temp.ln ";


  var inserts = [];

  mysql.pool.query(qString, inserts, function(err, rows, results) {
      if(err){
        next(err);
        return;
      }


			if (rows.length > 1) {

				// Gather s
				numS = rows.length;

				S = []; // Tickets Today
				t = [];

				var index;
				var row;
				for (index = 0; index < numS; index++) {
					row = rows[index];
					S.push({
						id : row.id,
						fName : row.fn,
						lName : row.ln,
						tickets : row.w
					});
					var i;
					for (i = 0; i < S[index].tickets; i++) {
						t.push({
							id : row.id,
							fName : row.fn,
							lName : row.ln
						});
					}

				} // end for

				var min = 0;
				var max = t.length - 1;
				var winIndex = Math.floor(Math.random() * (max - min) + min);
				var winner = t[winIndex];
				winText = "error";
				if (winner != undefined) winText = winner.fName + " " + winner.lName + " " + winner.id;
				console.log("Picking winner...");
				console.log("Congratulations " + winText + "!");


				// Push Winner to database:
		var qString = "INSERT INTO `tbl_readingWinner` (`id`, `student_id`, `notes`, `submitTimestamp`) " + 
									"VALUES (NULL, " + winner.id + ", '" + notes + "', CURRENT_TIMESTAMP); ";

		var inserts = [];

		mysql.pool.query(qString, inserts, function(err, rows, results) {
				if(err){
					next(err);
					return;
				}

			// HTTP RESPONSE:
			res.write(winText);
			res.end();

    }); // end winner INSERT

		} // end if rows > 1
		
		else {
			// HTTP RESPONSE:
			res.write(winText);
			res.end();
		}

    }); // end all student query

});









// +==========================================+
// |      DELETE READING WINNER FROM DB       |
// +==========================================+

app.get("/removeWinner", function(req,res,next) {

  var idString = "" + req.query["id"];

  mysql.pool.query("DELETE FROM tbl_readingWinner WHERE id = ?", 

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















}



