



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

		context.data = [];

		context.data.push(200);
		context.data.push(300);
		context.data.push(500);
		context.data.push(100);
		context.data.push(300);
		context.data.push(500);

		// test:
		res.render("test", context);



	});

}
