

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;






module.exports = function(app){
















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
									"ORDER BY T.submitTimestamp DESC LIMIT 75";


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
									"ORDER BY T.submitTimestamp DESC LIMIT 75";


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
									"ORDER BY T.submitTimestamp DESC LIMIT 75";


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
                   "ORDER BY P.submitTimestamp DESC LIMIT 75";

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
        context.errorList.push("Please finish filling out the information below:");
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
                   "ORDER BY P.submitTimestamp DESC LIMIT 75";

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
                   "ORDER BY P.submitTimestamp DESC LIMIT 75";


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












}
