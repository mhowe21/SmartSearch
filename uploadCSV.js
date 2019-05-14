var CSVFile;
var CSVName;
var CSVDomain;
var CSVAuth;




getChromeVariables();

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitFile").addEventListener("click", Run2);
}); //event listiner for form file submission. 

function Run2() {
    DrMoo(); //async function to carry out on form submission
}

function getChromeVariables() {

    chrome.storage.local.get(["token"], function (result) {
        token = result.token;
    })
    chrome.storage.local.get(["duplicateValidateOnOff"], function (result) {
        duplicateCheckCSV = result.duplicateValidateOnOff;

    });
}



async function DrMoo() {
    FileStore();
    const array1 = await FileParse();
    for (let elm1 of array1) // first for of loop
    {


        let csvLineName = elm1.name;
        let csvLineDomain = elm1.domain;
        let csvLineAuth = elm1.auth;
        console.log(csvLineName + csvLineDomain + csvLineAuth);
        var array2 = await XHRRequestDuplicate(csvLineDomain);
        console.log("array 2 is " + array2.length + " long");
        if (duplicateCheckCSV == true) {
            
            if(array2.length === 0)
            {
                XHRRequestFire(csvLineName, csvLineDomain, csvLineAuth);
            }
            else{
                for (let elm2 of array2){ // second  nested parse for of loop
                let duplicateLineName = elm2.name;
                let duplicateLineDomain = elm2.domain;
                let duplicateLineAuth = elm2.authentication_provider;
                let duplicateLineID = elm2.id;
                console.log(array2.length);
                console.log("dupecall\n" + duplicateLineName + duplicateLineDomain + duplicateLineAuth, duplicateLineID);

                try {
                    let ynDuplicate = await duplicateHandle(array2, duplicateLineName, duplicateLineDomain, csvLineName, csvLineDomain, duplicateLineID);
                    console.log(ynDuplicate);

                    if (ynDuplicate == true) {
                        if (window.confirm("A potential duplicate was found. \nClick OK to process the request Click cancel to abort\n" + duplicateInstanceName + "\n" + duplicateInstanceURL + "\n" + duplicateInstanceID)) {
                            XHRRequestFire(csvLineName, csvLineDomain, csvLineAuth);

                        } else {
                            //any exit logic that will need to be done. 

                        }
                    }
                    if (ynDuplicate == false) {
                        XHRRequestFire(csvLineName, csvLineDomain, csvLineAuth);
                    }

                } catch (e) {
                    if (e == false) {
                        XHRRequestFire(csvLineName, csvLineDomain, csvLineAuth);
                    }

                }





            }
            }
            
        } else {
            XHRRequestFire(csvLineName, csvLineDomain, csvLineAuth);
        }
    }
    alert("Done");
    
}

function FileStore() {
    CSVFile = document.getElementById("file").files[0];
    console.log(CSVFile.name);

}

function FileParse() {
    return new Promise(function (resolve) {
        Papa.parse(CSVFile, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                var CSVInfo = results.data;
                //chrome.storage.local.set({'infoList':CSVInfo.data}, function(){});
                resolve(CSVInfo);
            }

        });
    })

}

/*function SubmitCSVFile() {
    FileParse().then((data1) => {
        let dataArray = data1;
        console.log(dataArray);
        //closure parse loop

        
        
            for (var i = 0; i < dataArray.length; i++) {
                (function (i) {
                    let name = dataArray[i].name;
                    let domain = dataArray[i].domain;
                    let auth = dataArray[i].auth;
                    XHRRequestFire(name, domain, auth);
                })(i);
            }
                




    })
}*/

function XHRRequestDuplicate(domain) {
    return new Promise(function (resolve, reject) {
        console.log("running...")
        console.log(domain);

        var data = new FormData();


        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);
                console.log(this.status);
                if (this.status == 200) {
                    let duplicateFindArray = JSON.parse(this.responseText);
                    resolve(duplicateFindArray);

                }
                if (this.status != 200) {
                    console.log("call not successfull");
                    reject("call not successfull");
                }

            }
        });


        xhr.open("GET", "https://siteadmin.instructure.com/api/v1/accounts/search?domain=" + domain);
        xhr.setRequestHeader("Authorization", "Bearer " + token);


        xhr.send(data);


    })
}



function XHRRequestFire(name, domain, auth) {
    console.log("sending post request");
    if (auth == "" || auth == null || auth == undefined || auth == "null") {
        var data = new FormData();
        data.append("account_domain_lookup[name]", name);
        data.append("account_domain_lookup[domain]", domain);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);
            }
        });

        xhr.open("POST", "https://siteadmin.instructure.com/api/v1/account_domain_lookups/");
        xhr.setRequestHeader("Authorization", "Bearer " + token);

        xhr.send(data);
    } else {
        var data = new FormData();
        data.append("account_domain_lookup[name]", name);
        data.append("account_domain_lookup[domain]", domain);
        data.append("account_domain_lookup[authentication_provider]", auth);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);
            }
        });

        xhr.open("POST", "https://siteadmin.instructure.com/api/v1/account_domain_lookups/");
        xhr.setRequestHeader("Authorization", "Bearer " + token);

        xhr.send(data);
    }
}

function duplicateHandle(DLA, DLN, DLD, CLN, CLD, DLID) {

    return new Promise(function (resolve, reject) {
        if (DLA.length == 0 || DLA.length == undefined) {
            reject(false);
        }
        if (DLN == CLN || DLD == CLD) {
            console.log("a duplicate may have been found");
            duplicateInstanceName = DLN;
            duplicateInstanceURL = DLD;
            duplicateInstanceID = DLID;

            resolve(true);

        } else {
            console.log("No likely duplicates ")
            resolve(false);
        }
    })

}
