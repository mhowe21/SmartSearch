var returnStatus;
var authStatus;
var duplicateInstanceName;
var duplicateInstanceURL;
var duplicateInstanceID;
// actions
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("swag").addEventListener("click", run); // click the button and have it do crap
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("searchInstance").addEventListener("click", sRun); // click the button and have it do crap
}); 



// page decliration 
chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: 'siteadmin.instructure.com'
      },
    })],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
}); // make sure the page is a siteadmin page

// get storage values from chrome. 

chrome.storage.local.get(["token"], function (result) {
  token = result.token;
  if (token == "" || token == undefined || token == null) {
    alert("Please head to the options page to set your token."); // tell the user to add a token in the options page if one is not stored
  }

}); 

chrome.storage.local.get(["duplicateValidateOnOff"], function (result) {
  duplicateCheck = result.duplicateValidateOnOff;
  console.log(duplicateCheck);
}); // retrive on off status 1


//run the following functions on create request
function run() 
{

  instanceURL();
  instanceName();
  instanceAuth();

  if (instName == "" || instURL == "") {
    alert("name or URL are not valid");
    return;
  }

  if (duplicateCheck == true) {
    checkForDuplicate().then((message) => {

      // check for duplicate and handle if one is possible
      if (message == true) {
       $(function () {
         
           $("#dialog").dialog({
                
                                
             buttons: {
               "Process": function () {
                 submitRequest();
                 $( this ).dialog("close");
                 
               },
               "Replace": function () {
                 deleteRequest(duplicateInstanceID);
                 submitRequest();
                 $( this ).dialog("close");

               },
               "Delete": function () {
                 deleteRequest(duplicateInstanceID);
                 alert("entry deleted");
                 $( this ).dialog("close");
               },
               "Cancel": function () {
                $( this ).dialog("close");
               }
             }
           });
         });
         $(dialog).text("A potential duplicate was found selct an option" + "\nName:" + duplicateInstanceName + "\nDomain:" + duplicateInstanceURL + "\nID:" + duplicateInstanceID);
       


        

     
      }

      if (message == false) {
        submitRequest();
      }

    }).catch((message) => {
      console.log(message);

    })


  }
  //if duplicate checking is not enabled simply submit the request as is. 
  else {

    submitRequest();
  }

}

// run the following on search request
async function sRun(){
instanceURL();
instanceName();
instanceAuth();  

let sRay = await searchXHR();
console.log(sRay);
}




// general functions
function submitRequest() {

  if (instAuth != "") {
    xhrRequestAuth1();
  }
  if (instAuth == "") {
    xhrRequestAuth0();
  }

  function xhrRequestAuth1() {
    var data = new FormData();
    data.append("account_domain_lookup[name]", instName);
    data.append("account_domain_lookup[domain]", instURL);
    data.append("account_domain_lookup[authentication_provider]", instAuth);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        returnStatus = this.status;
        console.log(returnStatus);
        successFail(returnStatus);
      }
    });

    xhr.open("POST", "https://siteadmin.instructure.com/api/v1/account_domain_lookups/");
    xhr.setRequestHeader("Authorization", "Bearer " + token);

    xhr.send(data);


  }

  function xhrRequestAuth0() {
    var data = new FormData();
    data.append("account_domain_lookup[name]", instName);
    data.append("account_domain_lookup[domain]", instURL);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        returnStatus = this.status;
        console.log(returnStatus);
        successFail(returnStatus);
      }
    });

    xhr.open("POST", "https://siteadmin.instructure.com/api/v1/account_domain_lookups/");
    xhr.setRequestHeader("Authorization", "Bearer " + token);

    xhr.send(data);
  }
}



function checkForDuplicate() {
  return new Promise(function (resolve, reject) {
       
    //XHR request
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        //console.log(this.responseText);
        jsonDataArray = JSON.parse(this.responseText)
        status = this.status;
        //console.log(jsonDataArray);


        // need logic to catch blank returned array. 
        if (jsonDataArray.length == undefined || jsonDataArray.length == 0) {
          console.log("no likely duplicate found")
          resolve(false)
        }

        // if the array is not blank parse the array
        if (jsonDataArray.length != undefined || jsonDataArray.length != 0) {

          for (var i = 0; i <= jsonDataArray.length; i++) {
            if (jsonDataArray[i].name == instName || jsonDataArray[i].domain == instURL) {
              resolve(true);
              console.log("Likely duplicate found")
              duplicateInstanceName = jsonDataArray[i].name;
              duplicateInstanceURL = jsonDataArray[i].domain;
              duplicateInstanceID = jsonDataArray[i].id;
            } else {
              resolve(false);
              console.log("no likely duplicate found");
            }
          }
          reject(Error("something went wrong"));
        }
      }

    });

    xhr.open("GET", "https://siteadmin.instructure.com/api/v1/accounts/search?domain=" + instURL);
    xhr.setRequestHeader("Authorization", "Bearer " + token);

    xhr.send(data);

  })
}

// Remove Entry from SS List. Also utilized for replacements. 
function deleteRequest(did){
  var data = null;

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("DELETE", "https://siteadmin.instructure.com/api/v1/account_domain_lookups/" + did);
  xhr.setRequestHeader("Authorization", "Bearer " + token);
    
  xhr.send(data);

}

// search API request
function searchXHR(){
return new Promise(function(resolve ,reject){
var data = null;

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
    let searchJSON = JSON.parse(this.responseText); 
    if(this.status == 200){
      resolve(searchJSON);
    }
    if(this.status != 200){
      reject("An error occured when searching");
    }
    

  }
});

xhr.open("GET", "https://siteadmin.instructure.com/api/v1/accounts/search?domain=" + instURL);
xhr.setRequestHeader("Authorization", "Bearer " + token);


xhr.send(data);

})

}




