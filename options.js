var duplicateValidateBoxStatus;

document.onload
{
  visiallyConfirmTokenStored();
  duplicateValidateCheckboxStore();
}
// use button to store token
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("tokenEnterButton").addEventListener("click", tStore);
});
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("duplicateCheckBox").addEventListener("click", duplicateCheckboxStore);
});// listen for box option 


function tStore()//stores the token in chrome locally
{
   var token2 = document.getElementById("tokenInputBox").value;
     
   chrome.storage.local.set({"token": token2}, function()
   {
     //console.log("value is " + token2);
     alert("Token Stored succesfully")
     location.reload(); // reload the page to update visiallyConfirmTokenStored()
   });

}
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("ClearToken").addEventListener("click", tRemove);

});

function tRemove() //removes the stored token from chrome. 
{
  chrome.storage.local.remove(["token"],function()

  {
    console.log("Token Removed");
    alert("token cleared successfully");
    location.reload(); // reload the page to update visiallyConfirmTokenStored()
  })
};
function visiallyConfirmTokenStored()// shows if the token is stored
{
  chrome.storage.local.get(["token"], function(result)
  {
    if(result.token != null)
    {
      var removeNoTokenWarning = document.getElementById("storedTokenNo");
      removeNoTokenWarning.style.display="none";
    }
    else{
      var removeTokenPresentMessage = document.getElementById("storedTokenYes");
      removeTokenPresentMessage.style.display="none";
    }
  })
}
function duplicateCheckboxStore()
{
  duplicateValidateBoxStatus = document.getElementById("duplicateCheckBox").checked;
  

  chrome.storage.local.set({"duplicateValidateOnOff": duplicateValidateBoxStatus}, function()
{
  console.log("duplicate check " +  duplicateValidateBoxStatus);

});
  
}// store box option. 

function duplicateValidateCheckboxStore()
{
  chrome.storage.local.get("duplicateValidateOnOff", function(result)
  {
    document.getElementById("duplicateCheckBox").checked = result.duplicateValidateOnOff;
  })
}// hold the checkbox status accross refresh. 
