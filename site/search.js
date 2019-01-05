

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){






// +==========================================+
// |             SEARCH STUDENT               |
// +==========================================+

app.get("/search", function (req, res, next) {

  var context = {
    errorList: []
  };

  res.render('searchStudent');
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









}
