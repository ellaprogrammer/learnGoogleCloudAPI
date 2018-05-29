var https = require('https');
var fs = require("fs");

var API_KEY= 'AIzaSyCe31QbxiHWLedN6egRGDvckIQCMSj_dTU';

function printTags(response) {
    var tags = response.responses[0].labelAnnotations;

    for (var idx = 0; idx < tags.length; idx++) {
        console.log( tags[idx].description, tags[idx].score )
    }
}

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
                  "maxResults":10
                }
              ]
            }
          ]
    };

    var response = [];

    const req = https.request(options, (res) => {

        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        
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

