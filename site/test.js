



// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){



	// +==========================================+
	// |        VIEW ALL STUDENTS IN DB           |
	// +==========================================+

	app.get("/test", function(req, res, next) {

  	var context = {};

		var sqlString = "SELECT SUM(pointEarnedAmount) as pts, dateCompleted as dte " +
										"FROM `tbl_libraryTicket` " + 
										"GROUP BY dateCompleted " +
										"ORDER BY dateCompleted DESC " +
										"LIMIT 30 ";



		/*
		context.data1.push(1.7);
		context.data1.push(0.8);
		context.data1.push(0.9);
		context.data1.push(1.2);
		context.data1.push(0.65);
		context.data1.push(2.3);

		context.data2.push(0.2);
		context.data2.push(0.3);
		context.data2.push(0.2);
		context.data2.push(0.1);
		context.data2.push(0.35);
		context.data2.push(0.5);
		*/


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
				} else { context.data2.push("'Today'"); }
			} // end for

			context.data1.reverse();
			context.data2.reverse();

		// test:
		res.render("test", context);

	}); // end query for insert

}); // end app.get

} // end export
