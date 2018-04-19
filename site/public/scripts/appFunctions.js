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





