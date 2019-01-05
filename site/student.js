


// ========== SETUP ==========
var mysql = require("./mysqlSetup.js");
var moment = require("moment");
var MAX_STUDENT_NUM = 999999;

module.exports = function(app){



app.get("/student", function (req, res, next) {

  var context = {
    errorList: []
  };
  var completeForm = true; // true until proven false

  // Default date is today's date:
  context.todayDate = moment().format("YYYY-MM-DD");


  // This is the passed in scanID:
  var fullNum = req.query.scanID;

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
                    "AG.name AS 'ageGroup', S.ageGroup_id AS 'ageGroupid', " +
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
					context.ageGroupid = row.ageGroupid;
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
										"ORDER BY T.dateCompleted DESC";

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

				var recentReading = "";

				for (index = 0; index < context.numTickets; index++) {
					Trow = Trows[index];
					context.ticket.push({
						id : Trow.id,
						date : moment(Trow.dateCompleted).format("MM.DD.YYYY"),
						workType : Trow.workType,
						pointsEarned : Trow.pointEarnedAmount,
						notes : Trow.notes
					});

					// RECENT READING STRING
					recentReading += "~" + Trow.notes + "~";
					if (recentReading.length < (150 - 12)) { recentReading += "&emsp;&emsp;"; }

					context.lifeTimeEarned += parseInt(Trow.pointEarnedAmount); // started at zero above
				} // end for


				// RECENT READING: Trim to max string size
				var maxLength = Math.min(150, recentReading.length);
				recentReading = recentReading.substring(0, maxLength);
				recentReading += "...";
				context.recentReading = recentReading;
          
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






		// RUN ANOTHER QUERY FOR READING INFORMATION:
		//var purchaseSql = "SELECT P.id, " + 


var studentNum = context.studentNumber;
var today = moment().format("YYYY-MM-DD");
var begWeek = moment().day("Monday").format("YYYY-MM-DD");
var endWeek = moment().day("Friday").format("YYYY-MM-DD");
var begMonth = moment().startOf("month").format("YYYY-MM-DD");
var endMonth = moment().endOf("month").format("YYYY-MM-DD");

var allQueries = "SELECT * FROM " + 
	// -- PAGES READ TODAY:
	"(SELECT SUM(LT.pointEarnedAmount) as pagesReadToday FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + 
	" AND LT.dateCompleted = \"" + today + "\") AS PRT, " +

	"(SELECT SUM(LT.pointEarnedAmount) as pagesReadWeek FROM " + //-- PAGES READ WEEK:
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + 
	" AND LT.dateCompleted BETWEEN \"" + begWeek + "\" AND \"" + endWeek + "\") AS PRW, " +

	//-- PAGES READ MONTH:
	"(SELECT SUM(LT.pointEarnedAmount) AS pagesReadMonth FROM " + 
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + 
	" AND LT.dateCompleted BETWEEN \"" + begMonth + "\" AND \"" + endMonth + "\") AS PRM, " +

	//-- PAGES READ LIFE:
	"(SELECT SUM(LT.pointEarnedAmount) AS pagesReadLife FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + ") AS PRL, " +

	//-- DAYS READ MONDAY:
	"(SELECT COUNT(*) AS daysReadMonday FROM " +
	"(SELECT COUNT(*) FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " +
	"AND DAYOFWEEK(LT.dateCompleted) = 2 " +
	"GROUP BY LT.dateCompleted) AS temp1) AS DR_MOND, " + 

	//-- DAYS READ TUESDAY:
	"(SELECT COUNT(*) AS daysReadTuesday FROM " + 
	"(SELECT COUNT(*) FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " +
	"AND DAYOFWEEK(LT.dateCompleted) = 3 " +
	"GROUP BY LT.dateCompleted) AS temp2) AS DR_TUE, " + 

	//-- DAYS READ WEDNESDAY:
	"(SELECT COUNT(*) AS daysReadWednesday FROM " + 
	"(SELECT COUNT(*) FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " + 
	"AND DAYOFWEEK(LT.dateCompleted) = 4 " +
	"GROUP BY LT.dateCompleted) AS temp2) AS DR_WED, " + 

	//-- DAYS READ THURSDAY:
	"(SELECT COUNT(*) AS daysReadThursday FROM " +
	"(SELECT COUNT(*) FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " +
	"AND DAYOFWEEK(LT.dateCompleted) = 5 " +
	"GROUP BY LT.dateCompleted) AS temp2) AS DR_THU, " + 

	//-- DAYS READ FRIDAY:
	"(SELECT COUNT(*) AS daysReadFriday FROM " + 
	"(SELECT COUNT(*) FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " +
	"AND DAYOFWEEK(LT.dateCompleted) = 6 " +
	"GROUP BY LT.dateCompleted) AS temp2) AS DR_FRI, " + 

	//-- DAYS READ TOTAL:
	"(SELECT COUNT(*) AS daysReadTotal FROM " +
	"(SELECT COUNT(*) FROM " +
	"tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT on LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " +
	"GROUP BY LT.dateCompleted) AS temp2) AS DR_TOTAL, " + 

	// FIRST DAY COMPLETED READING
	"(SELECT LT.dateCompleted AS firstDate FROM tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT ON LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " +
	"ORDER BY LT.dateCompleted ASC LIMIT 1) AS First_day, " +

	// MOST RECENT DAY
	"(SELECT LT.dateCompleted AS mostRecentDate FROM tbl_student S INNER JOIN " +
	"tbl_libraryTicket LT ON LT.student_id = S.studentNumber " +
	"WHERE S.studentNumber = " + studentNum + " " +
	"ORDER BY LT.dateCompleted DESC LIMIT 1) AS recent_day, " +

	// HOW MANY DAYS BETWEEN FIRST DAY READ AND MOST RECENT DAY READ?
	"(SELECT DATEDIFF( " +
		"(SELECT LT.dateCompleted AS mostRecentDate FROM tbl_student S INNER JOIN " +
		"tbl_libraryTicket LT ON LT.student_id = S.studentNumber " +
		"WHERE S.studentNumber = " + studentNum + " " +
		"ORDER BY LT.dateCompleted DESC LIMIT 1), " +

		"(SELECT LT.dateCompleted AS firstDate FROM tbl_student S INNER JOIN " +
		"tbl_libraryTicket LT ON LT.student_id = S.studentNumber " +
		"WHERE S.studentNumber = " + studentNum + " " + 
		"ORDER BY LT.dateCompleted ASC LIMIT 1) " +
	") AS daysSinceStarted) as days_since ";


//console.log(allQueries);

		var readingInsert = [context.studentNumber];

		// SEND the query:
		mysql.pool.query(allQueries, readingInsert, function(err, Rrows, fields){
				if (err) {
					console.log("Error in selecting student purchases from DB.");
					next(err);
					return;
				}

				// Gather student reading info and shoot it to handlebars:
				if (Rrows.length > 0) {
					context.pagesReadToday = Rrows[0].pagesReadToday;
					if (context.pagesReadToday == null) { context.pagesReadToday = "0"; }
					context.pagesReadWeek = Rrows[0].pagesReadWeek;
					if (context.pagesReadWeek == null) { context.pagesReadWeek = "0"; }
					context.pagesReadMonth = Rrows[0].pagesReadMonth;
					if (context.pagesReadMonth == null) { context.pagesReadMonth = "0"; }
					context.pagesReadLife = Rrows[0].pagesReadLife;
					if (context.pagesReadLife == null) { context.pagesReadLife = "0"; }

					context.daysReadMonday = Rrows[0].daysReadMonday;
					context.daysReadTuesday = Rrows[0].daysReadTuesday;
					context.daysReadWednesday = Rrows[0].daysReadWednesday;
					context.daysReadThursday = Rrows[0].daysReadThursday;
					context.daysReadFriday = Rrows[0].daysReadFriday;
					context.daysReadTotal = Rrows[0].daysReadTotal;

					context.firstDate = moment(Rrows[0].firstDate).format('MMMM Do YYYY');
					context.mostRecentDate = moment(Rrows[0].mostRecentDate).format('MMMM Do YYYY');
					context.daysSinceStarted = Rrows[0].daysSinceStarted;
					context.weeksSinceStarted = Math.ceil(context.daysSinceStarted/7);

					var monthsSinceStarted = Math.max(context.daysSinceStarted/30, 1);
					context.readsPerMonth = context.daysReadTotal/monthsSinceStarted;
					context.readsPerMonth = context.readsPerMonth.toFixed(2);

					context.readsPerWeek = context.daysReadTotal/context.weeksSinceStarted;
					context.readsPerWeek = context.readsPerWeek.toFixed(2);

					context.cLife = 0;
					context.cSpeed = 0;
					context.cDefence = 0;
					context.cStrength = 0;
					context.cFire = 0;
					context.cCold = 0;
					context.cPoison = 0;
					context.cElemental = 0;
					context.cDamage = 0;
					var amethystArmorBonus = 1; // stands for 100%
					var diamondHealthBonus = 1; // etc.
					var diamondSpeedBonus = 1; // etc.
					var itemArmorBonus = 1; // etc.
					var itemDamageBonus = 1; // etc.
					
					// -------------- LEVEL: ----------------------
					var xp = context.daysReadTotal;
					context.xpBase = xp;
					var divider = Math.max(30*(parseInt(context.ageGroupid)), 1);
					var pagesBonus = Math.max(Math.floor(context.pagesReadLife/(divider)), 0);
					context.xpPagesBonus = pagesBonus;
					xp += pagesBonus;
					context.xpOverall = xp;
					context.level = Math.max( Math.floor(15*Math.log(xp + 20) - 43), 1); // THE GOLDEN LEVEL FORMULA

					/*
					// TEST FORMULA:
					var Level;
					var testDiv;
					for (var daysR = 1; daysR <= 22; daysR += 3) {
						for (var ageG = 1; ageG <= 5; ageG++) {
							for (var i = 0; i < 300; i += 50) {
								testDiv = 30*ageG;
								testXP = daysR + Math.floor(i/testDiv);
								Level = Math.max( Math.floor(15*Math.log(testXP + 20) - 43), 1); // THE GOLDEN LEVEL FORMULA
								console.log("Age=" + ageG + ", daysRead=" + daysR + ", pages=" + i + ", LEVEL=" + Level);
							}
						}
					}
					*/


					// BASE LIFE: based on level:
					context.cLife += (context.level*67);

					// BASE STRENGTH: based on level:
					context.cStrength += Math.ceil(context.level*2.3);


					// ------------- BADGES: ----------------------

					var gemLevel1 = 2;
					var gemLevel2 = 4;
					var gemLevel3 = 7;
					var gemLevel4 = 11;
					var gemLevel5 = 16;
					var gemLev;
					var gemText;
					var picName;
					var requirementStat;

					// monday's read
					gemLev = 0;
					gemText = "";
					picName = "ruby";
					requirementStat = context.daysReadMonday;
					if (requirementStat >= gemLevel1) { gemLev++; gemText = "(chipped " + picName + ")"; }
					if (requirementStat >= gemLevel2) { gemLev++; gemText = "(flawed " + picName + ")"; }
					if (requirementStat >= gemLevel3) { gemLev++; gemText = "(" + picName + ")"; } 
					if (requirementStat >= gemLevel4) { gemLev++; gemText = "(flawless " + picName + ")"; } 
					if (requirementStat >= gemLevel5) { gemLev++; gemText = "(perfect " + picName + ")"; }
					picName += gemLev.toString();
					context.monPic = "\"images/" + picName + ".png\"";
					context.rubyText = gemText;

				// FIRE DAMAGE: based on ruby
				context.cFire += Math.ceil((gemLev * gemLev) * 4.4 * (Math.max(context.level/6, 1)));


					// tuesday's read
					gemLev = 0;
					gemText = "";
					picName = "emerald";
					requirementStat = context.daysReadTuesday;
					if (requirementStat >= gemLevel1) { gemLev++; gemText = "(chipped " + picName + ")"; }
					if (requirementStat >= gemLevel2) { gemLev++; gemText = "(flawed " + picName + ")"; }
					if (requirementStat >= gemLevel3) { gemLev++; gemText = "(" + picName + ")"; } 
					if (requirementStat >= gemLevel4) { gemLev++; gemText = "(flawless " + picName + ")"; } 
					if (requirementStat >= gemLevel5) { gemLev++; gemText = "(perfect " + picName + ")"; }
					picName += gemLev.toString();
					context.tuePic = "\"images/" + picName + ".png\"";
					context.emeraldText = gemText;

				// POISON DAMAGE: based on emerald
				context.cPoison += Math.ceil((gemLev * gemLev) * 7.4 * (Math.max(context.level/4, 1)));


					// wednesday's read
					gemLev = 0;
					gemText = "";
					picName = "amethyst";
					requirementStat = context.daysReadWednesday;
					if (requirementStat >= gemLevel1) { gemLev++; amethystArmorBonus += 0.07; gemText = "(chipped " + picName + ")"; }
					if (requirementStat >= gemLevel2) { gemLev++; amethystArmorBonus += 0.12; gemText = "(flawed " + picName + ")"; }
					if (requirementStat >= gemLevel3) { gemLev++; amethystArmorBonus += 0.18; gemText = "(" + picName + ")"; } 
					if (requirementStat >= gemLevel4) { gemLev++; amethystArmorBonus += 0.25; gemText = "(flawless " + picName + ")"; } 
					if (requirementStat >= gemLevel5) { gemLev++; amethystArmorBonus += 0.33; gemText = "(perfect " + picName + ")"; }
					picName += gemLev.toString();
					context.wedPic = "\"images/" + picName + ".png\"";
					context.amethystText = gemText;


					// thursday's read
					gemLev = 0;
					gemText = "";
					picName = "sapphire";
					requirementStat = context.daysReadThursday;
					if (requirementStat >= gemLevel1) { gemLev++; gemText = "(chipped " + picName + ")"; }
					if (requirementStat >= gemLevel2) { gemLev++; gemText = "(flawed " + picName + ")"; }
					if (requirementStat >= gemLevel3) { gemLev++; gemText = "(" + picName + ")"; } 
					if (requirementStat >= gemLevel4) { gemLev++; gemText = "(flawless " + picName + ")"; } 
					if (requirementStat >= gemLevel5) { gemLev++; gemText = "(perfect " + picName + ")"; }
					picName += gemLev.toString();
					context.thuPic = "\"images/" + picName + ".png\"";
					context.sapphireText = gemText;

				// COLD DAMAGE: based on sapphire
				context.cCold += Math.ceil((gemLev * gemLev) * 2.6 * (Math.max(context.level/8, 1)));

					// Friday's read
					gemLev = 0;
					gemText = "";
					picName = "diamond";
					requirementStat = context.daysReadFriday;
					if (requirementStat >= gemLevel1) { 
						gemLev++; gemText = "(chipped " + picName + ")"; 
						diamondHealthBonus += 0.12;
						diamondSpeedBonus += 0.13;
					}
					if (requirementStat >= gemLevel2) { 
						gemLev++; gemText = "(flawed " + picName + ")"; 
						diamondHealthBonus += 0.10;
						diamondSpeedBonus += 0.11;
					}
					if (requirementStat >= gemLevel3) { 
						gemLev++; gemText = "(" + picName + ")"; 
						diamondHealthBonus += 0.08;
						diamondSpeedBonus += 0.9;
					} 
					if (requirementStat >= gemLevel4) { 
						gemLev++; gemText = "(flawless " + picName + ")"; 
						diamondHealthBonus += 0.06;
						diamondSpeedBonus += 0.7;
					} 
					if (requirementStat >= gemLevel5) { 
						gemLev++; gemText = "(perfect " + picName + ")"; 
						diamondHealthBonus += 0.04;
						diamondSpeedBonus += 0.5;
					}
					picName += gemLev.toString();
					context.friPic = "\"images/" + picName + ".png\"";
					context.diamondText = gemText;


	

				// Lifetime days read
				var itemLev = 0;
				var itemText = 0;
				picName = "armor"
				requirementStat = context.daysReadTotal;
				if (requirementStat >= 3) { itemLev++; itemText = "Padded Cloth"; context.cDefence += 5; }
				if (requirementStat >= 5) { itemLev++; itemText = "Studded Leather"; context.cDefence += 6;  }
				if (requirementStat >= 8) { itemLev++; itemText = "Iron Chest Plate"; context.cDefence += 7;  }
				if (requirementStat >= 12) { itemLev++; itemText = "Full Chainmail"; context.cDefence += 9;  }
				if (requirementStat >= 17) { itemLev++; itemText = "Platemail"; context.cDefence += 11;  }
				if (requirementStat >= 23) { itemLev++; itemText = "Kings Platemail"; context.cDefence += 15;  }
				if (requirementStat >= 30) { itemLev++; itemText = "Holy Cloth"; context.cDefence += 20;  }
				if (requirementStat >= 38) { itemLev++; itemText = "Robin's Luck"; context.cDefence += 27;  }
				if (requirementStat >= 47) { itemLev++; itemText = "Blacksmith's Blessing"; context.cDefence += 40;  }
				if (requirementStat >= 57) { itemLev++; itemText = "Templar Coat"; context.cDefence += 53;  }
				if (requirementStat >= 68) { itemLev++; itemText = "Unspoken Glory"; context.cDefence += 68;  }
				picName += itemLev.toString();
				context.armorLevel = itemLev;
				context.armor = "\"images/" + picName + ".png\"";
				context.armorText = itemText;




				// Main Hand: Based on level
				var itemLev = 0;
				var itemText = 0;
				picName = "main"
				requirementStat = context.level;
				if (requirementStat >= 1) { itemLev++; itemText = "Wooden Club"; }
				if (requirementStat >= 3) { itemLev++; itemText = "Iron Dagger"; }
				if (requirementStat >= 6) { itemLev++; itemText = "Iron Short Sword"; }
				if (requirementStat >= 10) { itemLev++; itemText = "Iron Mace"; }
				if (requirementStat >= 14) { itemLev++; itemText = "Steel Kris"; }
				if (requirementStat >= 18) { itemLev++; itemText = "Steel Flail"; }
				if (requirementStat >= 23) { itemLev++; itemText = "Falchion"; }
				if (requirementStat >= 28) { itemLev++; itemText = "Steel Scimitar"; }
				if (requirementStat >= 33) { itemLev++; itemText = "Double Edge Axe"; }
				if (requirementStat >= 39) { itemLev++; itemText = "Great Halberd"; }
				if (requirementStat >= 45) { itemLev++; itemText = "Crystal Sword"; }
				if (requirementStat >= 51) { itemLev++; itemText = "Wallace Sword"; }
				if (requirementStat >= 57) { itemLev++; itemText = "Bec-De-Corbin"; }
				if (requirementStat >= 64) { itemLev++; itemText = "Conan Great Sword"; }
				if (requirementStat >= 71) { itemLev++; itemText = "Royal Dwarf Double Axe"; }
				picName += itemLev.toString();
				context.mainHandLevel = itemLev;
				context.mainHand = "\"images/" + picName + ".png\"";
				context.mainHandText = itemText;





				// Shield: Based on average reads/month
				var itemLev = 0;
				var itemText = 0;
				picName = "off"
				requirementStat = context.readsPerMonth;
				if (requirementStat >= 2) { itemLev++; itemText = "Iron Buckler"; itemArmorBonus += 0.1; }
				if (requirementStat >= 3) { itemLev++; itemText = "Reinforced Round Shield"; itemArmorBonus += 0.09; }
				if (requirementStat >= 4) { itemLev++; itemText = "Secret Dagger"; itemDamageBonus += 0.3; }
				if (requirementStat >= 5) { itemLev++; itemText = "Gold Plated Shield"; itemArmorBonus += 0.08; }
				if (requirementStat >= 6) { itemLev++; itemText = "Warrior's Kite Shield"; itemArmorBonus += 0.07; }
				if (requirementStat >= 7) { itemLev++; itemText = "Spiked Shield"; itemArmorBonus += 0.06; }
				if (requirementStat >= 8) { itemLev++; itemText = "Offhand Falchion"; itemDamageBonus += 0.2; }
				if (requirementStat >= 9) { itemLev++; itemText = "Defender Shield"; itemArmorBonus += 0.05; }
				if (requirementStat >= 10) { itemLev++; itemText = "Necromancer Shield"; itemArmorBonus += 0.04; }
				if (requirementStat >= 12) { itemLev++; itemText = "Offhand Flail"; itemDamageBonus += 0.1; }
				if (requirementStat >= 14) { itemLev++; itemText = "Offhand Scimitar"; itemDamageBonus += 0.1; }
				if (requirementStat >= 16) { itemLev++; itemText = "Offhand Great Sword"; itemDamageBonus += 0.1; }
				if (requirementStat >= 18) { itemLev++; itemText = "Paladin Holy Shield"; itemArmorBonus += 0.03; }
				picName += itemLev.toString();
				context.offHandLevel = itemLev;
				context.offHand = "\"images/" + picName + ".png\"";
				context.offHandText = itemText;


				// Helm: Based on average total Pages Read
				var itemLev = 0;
				var itemText = 0;
				picName = "helm"
				requirementStat = context.pagesReadLife;
				if (requirementStat >= 100) { itemLev++; itemText = "Leather Hood"; context.cDefence += 2; }
				if (requirementStat >= 200) { itemLev++; itemText = "Iron Cap"; context.cDefence += 4; }
				if (requirementStat >= 400) { itemLev++; itemText = "Iron Helm"; context.cDefence += 6; }
				if (requirementStat >= 800) { itemLev++; itemText = "Steel Full Helm"; context.cDefence += 9; }
				if (requirementStat >= 1600) { itemLev++; itemText = "Bone Visor"; context.cDefence += 13; }
				if (requirementStat >= 3200) { itemLev++; itemText = "Warrior's Giant Helm"; context.cDefence += 18; }
				if (requirementStat >= 6400) { itemLev++; itemText = "Royal Crown"; context.cDefence += 23; }
				picName += itemLev.toString();
				context.helmLevel = itemLev;
				context.helm = "\"images/" + picName + ".png\"";
				context.helmText = itemText;






				// Boots: Based on weeks since started 
				var itemLev = 0;
				var itemText = 0;
				picName = "boots"
				requirementStat = context.weeksSinceStarted;
				if (requirementStat >= 1) { itemLev++; itemText = "Cloth Boots"; context.cSpeed += 7; context.cDefence += 5; }
				if (requirementStat >= 2) { itemLev++; itemText = "Leather Boots"; context.cSpeed += 8; context.cDefence += 5; }
				if (requirementStat >= 4) { itemLev++; itemText = "Iron Boots"; context.cSpeed += 9; context.cDefence += 5; }
				if (requirementStat >= 6) { itemLev++; itemText = "Steel Plated Boots"; context.cSpeed += 10; context.cDefence += 5; }
				if (requirementStat >= 8) { itemLev++; itemText = "War Boots"; context.cSpeed += 11; context.cDefence += 5; }
				if (requirementStat >= 10) { itemLev++; itemText = "Wizard Boots"; context.cSpeed += 12; context.cDefence += 5; }
				if (requirementStat >= 12) { itemLev++; itemText = "Rage Boots"; context.cSpeed += 13; context.cDefence += 5; }
				if (requirementStat >= 14) { itemLev++; itemText = "Ice Boots"; context.cSpeed += 14; context.cDefence += 5; }
				if (requirementStat >= 16) { itemLev++; itemText = "Corrupted Boots"; context.cSpeed += 15; context.cDefence += 5; }
				if (requirementStat >= 19) { itemLev++; itemText = "Holy Boots"; context.cSpeed += 16; context.cDefence += 5; }
				picName += itemLev.toString();
				context.bootsLevel = itemLev;
				context.boots = "\"images/" + picName + ".png\"";
				context.bootsText = itemText;


				// LIFE BONUS: based on amethyst
				context.cDefence = Math.ceil(context.cDefence*amethystArmorBonus);

				// Diamond Health and Speed Bonus:
				context.cLife = Math.ceil(context.cLife*diamondHealthBonus);
				context.cSpeed = Math.ceil(context.cSpeed*diamondSpeedBonus);
					//context.cSpeed = "Average";

				// BASE DAMAGE: based on strength:
				context.cDamage += Math.ceil(context.cStrength * 1.8);

				// ELEMENTAL DAMAGE
				context.cElemental += (context.cFire + context.cCold + context.cPoison);
				context.cDamage += context.cElemental;

				// Off hand bonuses!
				context.cDefence = Math.ceil(context.cDefence*itemArmorBonus);
				context.cDamage = Math.ceil(context.cDamage*itemDamageBonus);


				// immobile, sluggish, slow, average, quick, nimble, like a shadow, teleportation, interstellar

				// SPEED TEXT:
				var speedText = "immobile";
				if (context.cSpeed >= 10) speedText = "sluggish";
				if (context.cSpeed >= 21) speedText = "slow";
				if (context.cSpeed >= 33) speedText = "average";
				if (context.cSpeed >= 45) speedText = "quick";
				if (context.cSpeed >= 57) speedText = "nimble";
				if (context.cSpeed >= 71) speedText = "like a shadow";
				if (context.cSpeed >= 94) speedText = "teleportation";
				if (context.cSpeed >= 121) speedText = "interstellar";
				
				context.cSpeed += " &ensp; (" + speedText + ")";


				// lifetime pages read badge

			} // end if student was returned from query

                  // FINALLYYYY DISPLAY THE PAGE:
                  // Here is the current balance
                  var balance = parseInt(context.lifeTimeEarned) - 
                    parseInt(context.lifeTimeSpent);
                  // set balance color depending on balance:
                  if (balance < 0) 
                    context.balanceRed = "true";
                  else if (balance == 0)
                    context.balanceYellow = "true";
                  else 
                    context.balanceGreen = "true";
                  context.balance = balance;

                  res.render('studentDisplay', context);

			}); // end READING query
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









}
