

// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){



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




}
