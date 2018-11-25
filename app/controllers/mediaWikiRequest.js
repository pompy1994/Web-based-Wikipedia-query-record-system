var https = require('https') 

//pull new data from MediaWiki
exports.getUpdates = function(title, latestRev, callback){

    var wikiEndpointHost = "en.wikipedia.org",
    path = "/w/api.php" 
    parameters = [
        "action=query", 
        "format=json", 
        "prop=revisions", 
        "rvstart=2016-11-01T11:56:22Z", 
        "rvdir=newer", 
        "rvlimit=max", 
        "rvprop=timestamp|userid|user|ids"], 
    headers = {
        Accept: 'application/json', 
        'Accept-Charset': 'utf-8' 
    }
    var titles = "titles=" + encodeURIComponent(title);
    var latestRev = "rvstart=" + latestRev;
    parameters.push(titles);
    parameters.push(latestRev);

    var full_path = path + "?" + parameters.join("&") 
    var options = {
        host: wikiEndpointHost, 
        path: full_path, 
        headers: headers
    }

    https.get(options,function(res){
        var data ='';
        res.on('data',function(chunk){
            data += chunk;
        })
        res.on('end',function(){
            json = JSON.parse(data);
            pages = json.query.pages;
            revisions = pages[Object.keys(pages)[0]].revisions;
            revisions.splice(0, 1)
            //console.log(revisions);
            console.log("There are " + revisions.length + " new revisions.");
            var users=[]
            for (revid in revisions){
                users.push(revisions[revid].user);
            }
            uniqueUsers = new Set(users);
            console.log("The new revisions are made by " + uniqueUsers.size + " unique users");
            callback(revisions);
        })
    }).on('error',function(e){
        console.log(e);
    })

}
