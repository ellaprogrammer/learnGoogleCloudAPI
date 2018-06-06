/*
http://server162.site:54022/query?num=200
http://server162.site:54022/testWHS2.html
*/

var static = require('node-static');
var http =  require('http');
 
var fileServer = new static.Server('./public');

var server = http.createServer(handler);

var sqlite3 = require("sqlite3").verbose();
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

function handler (request, response) {
    
    request.addListener('end', function () {
        var url = request.url; //get the url

        //if there is a query & a number in the url, print the name of the photo that corresponds to the photo id:
        var queryB = url.split("/")[1];
        console.log(queryB);

        //.  http://server162.site:54022/query?tags=nature+water
        //. query?source=Arkwright Masson Mills.jpgupdateTags=building,town,roof,residential area,house

        if (queryB.split("?")[0] == "query"){

            if (queryB.indexOf("source=") > -1){
                //do the second query
                //console.log("update query if");
                queryB = queryB.split("query?source=");
                var srcAndTags = queryB[1].split("updateTags=");
                var sourceForUpdate = srcAndTags[0];
                //console.log("source: ", sourceForUpdate); 
                var tagsForUpdate = srcAndTags[1];
                //console.log("tags: ", tagsForUpdate);


                while(sourceForUpdate.indexOf("%20") != -1){
                    sourceForUpdate = sourceForUpdate.replace("%20"," ");
                }

                while(tagsForUpdate.indexOf("%20") != -1){
                    tagsForUpdate = tagsForUpdate.replace("%20"," ");
                }

                // var cmdStr = "UPDATE [photoTags] SET tags='sky' WHERE fileName='A Torre Manuelina.jpg'";
                // var cmd = cmdStr.replace("sky", tagsForUpdate);
                // cmd = cmd.replace("A Torre Manuelina.jpg", 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/' + sourceForUpdate);
                // console.log("Cmd for db: ",cmd);

                //var cmd = 'UPDATE [photoTags] SET tags="' + tagsForUpdate + '" WHERE fileName="http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/' + sourceForUpdate + '"';
                //var cmd = 'UPDATE [photoTags] SET tags="' +''+ tagsForUpdate +''+ '" WHERE fileName="'+''+sourceForUpdate+'"'+"'";
                var cmd = 'UPDATE [photoTags] SET tags="' + tagsForUpdate + '" WHERE fileName="http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/'+sourceForUpdate+'"';
                console.log("tags for update: ", tagsForUpdate);
                console.log("Successfully removed tag from database");
                db.run(cmd); 
                response.end();

                function dataCallback2 (err, data) {
                    console.log("in data callback, data: ", data);

                    response.writeHead(200, {"Content-Type": "application/json"});
                    //response.write(JSON.stringify(dataAR), function(err) { response.end(); });
                    response.write(JSON.stringify(data));
                    response.end();

                    db.close();
                }

                //update has no callback
                //select has callback
            }

               



            else{
                //do the first query

            
            var callCount = 0;
            var numID = queryB.split("tags=")[1];
            console.log(numID); 

            //add this to handle both cases: num = num.split(", ").join(+); 

            while(numID.indexOf("%20") != -1){
                numID= numID.replace("%20"," ");
            }

            while(numID.indexOf(",") != -1){
                numID= numID.replace(",","+");
            }

            var subStrs = numID.split("+");
            //console.log(subStrs); //this puts the numbers into an array without the +'s

            var dataAR = [];
            var dbCall = "";

            //for(let i = 0; i < 12; i++){
                for(let j = 0; j < subStrs.length; j++) {
                    subStrs[j] = subStrs[j].toString();
                    //console.log("index j, subStrs[j]: ", j, subStrs[j]);
                    //db.get( 'SELECT fileName, width, height FROM [photoTags] WHERE tags = ' + subStrs[i], dataCallback);
                    dbCall +='(landmark = "' + subStrs[j] + '" OR tags LIKE "%' + subStrs[j] + '%")';

                    //(location = "Castle" OR tags LIKE "%Castle%") AND (location = "Nature Scene" OR tags LIKE "%Nature Scene%")

                    //db.all('SELECT * FROM [photoTags] WHERE (landmark = '+subStrs[j]+' OR tags LIKE "%' + subStrs[j] + '%")', dataCallback);

                    if(j != subStrs.length-1) {
                        dbCall += ' AND ';
                    }   
                } //end of database call

                //console.log("VALUE OF STRING",dbCall);
            //}
            
            //console.log('SELECT * FROM [photoTags] WHERE ' + dbCall);
            db.all('SELECT * FROM [photoTags] WHERE ' + dbCall, dataCallback);    

            function dataCallback( err, data ) {
                    //str = JSON.stringify(data);
                callCount++;
                //console.log("Value of callCount:",callCount);
                //console.log("Value of array",subStrs.length);

                //dataAR.push({src: data.fileName, width: data.width, height: data.height});
                //console.log(data);//contains 2 lists

                data = JSON.stringify(data);

                //console.log("this is what you get in data format: ", data);
                while(data.indexOf("fileName") != -1){ 
                    data = data.replace("fileName", "src");
                }
                data = JSON.parse(data);
                //dataAR.push(data);
                dataAR = data; //changed

                // if(response.ServerResponse.output === "[]") {
                //      response.writeHead(200, {"Content-Type": "text/plain"});
                //      //response.write(JSON.stringify(dataAR), function(err) { response.end(); });
                //     response.write("These were no photos satisfying this query");
                //     response.end();
                // }
                   
                if (callCount === 1){
                    response.writeHead(200, {"Content-Type": "application/json"});
                    //response.write(JSON.stringify(dataAR), function(err) { response.end(); });
                    response.write(JSON.stringify(dataAR));
                    response.end();
                }
            }
            
         }//end of big ass else statement
     }//end of big ass if statment
        
        else {
            fileServer.serve(request, response, function (e, res){
                if (e){
                    fileServer.serveFile('/error.html', 404, {}, request, response);
                }
            });
        }
        //fileServer.serveFile('/error.html', 500, {}, request, response); ?
        //console.log(request.url); //url property of the rquest object (string)
        
    }).resume();
}

server.listen("YOURPORTNUMBER");
