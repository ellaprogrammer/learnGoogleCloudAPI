var https = require('https');
var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

db.get('SELECT fileName FROM photoTags WHERE idNum = 2', dataCallback);

function dataCallback( err, data ) {
    var filename = data.fileName;
    getImageTags(filename);
}

var API_KEY= 'AIzaSyCe31QbxiHWLedN6egRGDvckIQCMSj_dTU';

function printTags(response, filename) {
    //console.log(JSON.stringify(response));
    var tags = response.responses[0].labelAnnotations;
    var tagsStr = '';
    //console.log(tags);

     for (var idx = 0; idx < tags.length; idx++) {
         //console.log( tags[idx].description);
         tagsStr += tags[idx].description + ',';
     }
     tagsStr = tagsStr.substr(0, tagsStr.length-1);
     console.log("Tags:",tagsStr);
     //console.log(response);
     //console.log(response.responses);
     var landmarkStr = response.responses[0].landmarkAnnotations[0].description;
     console.log("Landmark:",landmarkStr);

     updateDB(filename, tagsStr,landmarkStr);

     //console.log(response.responses[0]);
}

function updateDB(filename, tags,landmark){

  var cmdStr = "UPDATE [photoTags] SET landmark='Belém', tags='sky' WHERE fileName='A Torre Manuelina.jpg'";

  var cmd = cmdStr.replace("Belém", landmark);
  cmd = cmd.replace("sky", tags);
  cmd = cmd.replace("A Torre Manuelina.jpg", 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/'+ filename);
  console.log(cmd);

  console.log("Updating entry with fileName: ",filename);


  db.run(cmd, function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log("Database entry updated");
  });
 
// close the database connection
  db.close();

} // end of updateDB


function getImageTags(filename) {

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
