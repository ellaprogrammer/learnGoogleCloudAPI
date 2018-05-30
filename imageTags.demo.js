var https = require('https');
var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

var API_KEY= 'AIzaSyCe31QbxiHWLedN6egRGDvckIQCMSj_dTU';

function printTags(response) {
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

     //updateDB("A Torre Manuelina.jpg", tagsStr,landmarkStr);

     //console.log(response.responses[0]);
}

function updateDB(filename, tags,landmark){

  let sql = `UPDATE photoTags
            SET landmark =`landmark, `tags=`tags` 
            WHERE fileName =`filename;

  db.run(sql, function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log("Database entry updated");
  });
 
// close the database connection
  db.close();

} // end of updateDB

function getImageTags(filename) {

    var imageStringB64 = fs.readFileSync(filename).toString('base64');

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
                "content":imageStringB64
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
            printTags( JSON.parse(Buffer.concat(response)) );
        });
    });

    req.on('error', (e) => { console.error(e); });

    req.write( JSON.stringify(params) );
    req.end();
}

getImageTags("A Torre Manuelina.jpg");

