var https = require('https');
var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

var queue = [];
var totalDBCalls = 12;
var counter = 0;
var cbCount = 0;
var cbGoal = totalDBCalls; //989

  if (cbCount === cbGoal){
    db.close();
  } 

while (counter < totalDBCalls){
  console.log("yay for zack and ella");
  db.get('SELECT fileName FROM photoTags WHERE idNum = ' + counter, dataCallback);

  function dataCallback( err, data ) {
      console.log("yay");
      var filename = data.fileName;
      console.log(filename);
      queue.push( () => getImageTags(filename));
      next();
  }
  counter++;
  cbCount++;

}

next();


var API_KEY= 'AIzaSyCe31QbxiHWLedN6egRGDvckIQCMSj_dTU';

function printTags(response, filename) {
    //console.log(JSON.stringify(response));
    var rspString = JSON.stringify(response);

    //check if 'error' is in the response
    var check0 = rspString.includes("error");
    if (check0 == true){
      console.log("You got an error: ");
      console.log(JSON.stringify(response));
      cbCount = cbGoal;
      return;
    }

    //check if 'labelAnnotations' is in the response
    var check1 = rspString.includes("labelAnnotations");
    if (check1 == false) {
      console.log("No tags.");
      tags = '';
    }
    else{
      var tags = response.responses[0].labelAnnotations;
      var tagsStr = '';
      for (var idx = 0; idx < tags.length; idx++) {
         //console.log( tags[idx].description);
         tagsStr += tags[idx].description + ',';
       }
       tagsStr = tagsStr.substr(0, tagsStr.length-1);
       console.log("Tags:",tagsStr);
    }
    

     //check if 'landmarkAnnotations' is in the response
     var check2 = rspString.includes("landmarkAnnotations");
     if (check2 == false) {
      console.log("No landmark.");
      landmarkStr = '';
     }
     else{
      var landmarkStr = response.responses[0].landmarkAnnotations[0].description;
      console.log("Landmark:",landmarkStr);
     }

     updateDB(filename, tagsStr,landmarkStr);
     next();

}

function updateDB(filename, tags,landmark){

  var cmdStr = "UPDATE [photoTags] SET landmark='Belém', tags='sky' WHERE fileName='A Torre Manuelina.jpg'";

  var cmd = cmdStr.replace("Belém", landmark);
  cmd = cmd.replace("sky", tags);
  cmd = cmd.replace("A Torre Manuelina.jpg", filename);
  //console.log(cmd);

  console.log("Updating entry with fileName: ",filename);


  db.run(cmd, function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log("Database entry updated");
  
  });
 
// close the database connection
  //db.close();

} // end of updateDB


function getImageTags(filename) {

    console.log("yay image tags");

    var imageStringB64 = filename.toString('base64');

    var options = {
        hostname: 'vision.googleapis.com',
        port: 443,
        path: '/v1/images:annotate?key=' + API_KEY,
        method: 'POST'
    };
    
    var params = {

          "requests":[
            {
              "image":{
                "source": {"imageUri": imageStringB64}
              },
              "features":[
                {
                  "type":"LABEL_DETECTION",
                  "maxResults":6
                },
                {
                  "type":"LANDMARK_DETECTION",
                }
              ]
            }
          ]
    };

    var response = [];

    const req = https.request(options, (res) => {

        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        
        res.on('data', (d) => {
            response.push(d);
        }).on('end', () => {
            printTags( JSON.parse(Buffer.concat(response)), filename );
        });
    });

    req.on('error', (e) => { console.error(e); });

    req.write( JSON.stringify(params) );
    req.end();
}

function next() {
    if (queue.length > 0) {
        console.log("    Launching item", queue.length-1);
        queue.pop()();
    }
}
