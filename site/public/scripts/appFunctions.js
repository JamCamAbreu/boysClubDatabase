/* *******************************************
 * Author: James Cameron Abreu
 * Date: 03/10/2018
 * Description: Functions used for the Boys 
 *  Club database web app
 * Note: These functions are loaded at the top
 * of every page (see main.handlebars)
 * *******************************************/


// NOTE: If I change these I also need to change in the javascript server
var portUsed = 55850;

var URL = "http://192.168.16.89:"; // BOYS CLUB IP
//var URL = "http://192.168.0.22:"; // Cam's House IP



/* *******************************************
 * DELETE BUTTON ACTION (STUDENT ONLY...)
 * ******************************************/

function deleteButtonAction(rowNum, ID_table) {
  
  var req = new XMLHttpRequest();
  req.open("GET", URL + portUsed + "/remove?" + "id=" + rowNum, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(null);
  req.addEventListener("load", function() {

    // successfully deleted from database??:
    var responseRequest = parseInt(req.responseText);
    if (req.status >= 200 & req.status < 400 & responseRequest == 1) {

      // DELETE BY ACCESSING DOM:
      var rowToDelete = document.getElementById("row" + rowNum).rowIndex;
      document.getElementById(ID_table).deleteRow(rowToDelete);
      alert("Student with number " + rowNum + " successfully deleted.");
    }

    // COULD NOT DELETE FROM DATABASE:
    else {
      alert("Row could NOT be deleted from database!\n" + 
        "Please wait and try again in a few seconds");
      console.log("responseRequest = " + responseRequest);
    }

  });
}



/* *******************************************
 * DELETE TICKET
 * ******************************************/

function deleteTicket(rowNum, ID_table) {

  var req = new XMLHttpRequest();
  req.open("GET", URL + portUsed + "/removeTicket?" + "id=" + rowNum, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(null);
  req.addEventListener("load", function() {

    // successfully deleted from database??:
    var responseRequest = parseInt(req.responseText);
    if (req.status >= 200 & req.status < 400 & responseRequest == 1) {

      // DELETE BY ACCESSING DOM:
      var rowToDelete = document.getElementById("Trow" + rowNum).rowIndex;
      document.getElementById(ID_table).deleteRow(rowToDelete);
      alert("Ticket successfully deleted.");
    }

    // COULD NOT DELETE FROM DATABASE:
    else {
      alert("Ticket could NOT be deleted from database!\n" + 
        "Please wait and try again in a few seconds");
      console.log("responseRequest = " + responseRequest);
    }

  });
}




/* *******************************************
 * DELETE PURCHASE
 * ******************************************/

function deletePurchase(rowNum, ID_table) {
  
  var req = new XMLHttpRequest();
  req.open("GET", URL + portUsed + "/removePurchase?" + "id=" + rowNum, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(null);
  req.addEventListener("load", function() {

    // successfully deleted from database??:
    var responseRequest = parseInt(req.responseText);
    if (req.status >= 200 & req.status < 400 & responseRequest == 1) {

      // DELETE BY ACCESSING DOM:
      var rowToDelete = document.getElementById("Prow" + rowNum).rowIndex;
      document.getElementById(ID_table).deleteRow(rowToDelete);
      alert("Purchase successfully deleted.");
    }

    // COULD NOT DELETE FROM DATABASE:
    else {
      alert("Purchase could NOT be deleted from database!\n" + 
        "Please wait and try again in a few seconds");
      console.log("responseRequest = " + responseRequest);
    }

  });
}




/* *******************************************
 * DELETE PANTHER TICKET
 * ******************************************/

function deletePantherTicket(rowNum, ID_table) {

  var req = new XMLHttpRequest();
  req.open("GET", URL + portUsed + "/removePantherTicket?" + "id=" + rowNum, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(null);
  req.addEventListener("load", function() {

    // successfully deleted from database??:
    var responseRequest = parseInt(req.responseText);
    if (req.status >= 200 & req.status < 400 & responseRequest == 1) {

      // DELETE BY ACCESSING DOM:
      var rowToDelete = document.getElementById("Trow" + rowNum).rowIndex;
      document.getElementById(ID_table).deleteRow(rowToDelete);
      alert("Panther Ticket successfully deleted.");
    }

    // COULD NOT DELETE FROM DATABASE:
    else {
      alert("Panther Ticket could NOT be deleted from database!\n" + 
        "Please wait and try again in a few seconds");
      console.log("responseRequest = " + responseRequest);
    }

  });
}






/* *******************************************
 * DELETE WINNER
 * ******************************************/

function deleteWinner(rowNum, ID_table) {
  

  var req = new XMLHttpRequest();
  req.open("GET", URL + portUsed + "/removeWinner?" + "id=" + rowNum, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(null);
  req.addEventListener("load", function() {

    // successfully deleted from database??:
    var responseRequest = parseInt(req.responseText);
    if (req.status >= 200 & req.status < 400 & responseRequest == 1) {
      alert("Winner successfully deleted.");
			location.reload();
    }

    // COULD NOT DELETE FROM DATABASE:
    else {
      alert("Purchase could NOT be deleted from database!\n" + 
        "Please wait and try again in a few seconds");
      console.log("responseRequest = " + responseRequest);
    }

  });
}











/* *******************************************
 * GO TO STUDENT PAGE
 * ******************************************/

function postStudentPage(studentNum) {

  /*
  var url = "http://flip2.engr.oregonstate.edu:" + portUsed + 
            "/searchStudentScanCard";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, false);
  //xhr.onload = // callBackFunction() {};
  */


  console.log("reached postStudentPage function");
  

  /*
  $.ajax("http://flip2.engr.oregonstate.edu:" + portUsed + 
         "/searchStudentScanCard", {
    type: 'POST',
    data: {
      scanID: studentNum
    }
  }); // end ajax request
  */
}




/* *******************************************
 * DELETE PANTHER PURCHASE
 * ******************************************/

function deletePPurchase(rowNum, ID_table) {
  
  var req = new XMLHttpRequest();
  req.open("GET", URL + portUsed + "/removePantherPurchase?" + "id=" + rowNum, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(null);
  req.addEventListener("load", function() {

    // successfully deleted from database??:
    var responseRequest = parseInt(req.responseText);
    if (req.status >= 200 & req.status < 400 & responseRequest == 1) {

      // DELETE BY ACCESSING DOM:
      var rowToDelete = document.getElementById("Prow" + rowNum).rowIndex;
      document.getElementById(ID_table).deleteRow(rowToDelete);
      alert("Panther Purchase successfully deleted.");
    }

    // COULD NOT DELETE FROM DATABASE:
    else {
      alert("Panther Purchase could NOT be deleted from database!\n" + 
        "Please wait and try again in a few seconds");
      console.log("responseRequest = " + responseRequest);
    }

  });
}







/* *******************************************
 * MONTHLY READING LAB WINNER
 * ******************************************/

function pickWinner(begin, end) {

	var notes = document.getElementById("noteBox").value;
	var pStart = document.getElementById("beginDate").value;
	var pEnd = document.getElementById("endDate").value;
  
  var req = new XMLHttpRequest();
  req.open("GET", URL + portUsed + "/getWinner?" + "begin=" + 
					 begin + "&end=" + end + "&notes=" + notes, true);

  req.setRequestHeader("Content-Type", "application/json");
  req.send(null);
  req.addEventListener("load", function() {

    // success:
    if (req.status >= 200 & req.status < 400) {
    	var winner = req.responseText;
			if (winner == "0") {
				alert("There were no readers in the date requested. Please review the date range.");
			}

			else {

				var sound = document.getElementById("victorySound"); 
				sound.play();

				// ANIMATE WINNER BOX:
				$("#winnerBox").css('display', 'block');
				$("#winnerBox").css('left', '0');
				$("#winnerBox").css("opacity", "0.0");
				$("#winnerBox").text("Congratulations " + winner + "!");

				var wid = parseInt($(document).width());
				wid /= 2;
				wid -= $("#winnerBox").outerWidth()/2;
				width = "+=" + wid.toString();

				$("#winnerBox").animate({
					left: width,
					opacity: 1
				}, 700, function() {
						setTimeout(function(){
						$("#winnerBox").css('display', 'none');
						window.location = "/readingLab?prizeStart=" + pStart + "&prizeEnd=" + pEnd;
					}, 4500)
				});

			}

		}
		// COULD NOT DETERMINE WINNER
		else {
			alert("Could not determine winner\n");
			console.log("responseRequest = " + responseRequest);
		}
	});
}

















/* *******************************************
 * Refresh the week for reading lab
 * ******************************************/

function getWeek(weekNum) {
	var num = parseInt(weekNum); 
	window.location = "/readingLab?week=" + num;
}

















