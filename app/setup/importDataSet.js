/**
 * Import the data set into database
 */

var fs=require('fs');
var exec = require('child_process').exec;
//var fileDirectory = "/Users/sharon/Dropbox/5-1.COMP5347-Web/Ass2/a2-test1/";
var fileDirectory = "/Users/sharon/Dropbox/5-1.COMP5347-Web/Ass2/revisions/";
                    
var cmdStr = 'mongoimport --jsonArray --db wiki --collection revisions --file ' + fileDirectory;
var files;

if(fs.existsSync(fileDirectory)){
    fs.readdir(fileDirectory, function (err, f) {
        if (err) {
            console.log(err);
            return;
        }

        files = f;
        if(files.length > 0){
            process(files.pop());
        }        
    });
} 
else  {
    console.log(fileDirectory + "  Not Found!");
}

function process(filename){
    if(filename != '.DS_Store'){
        var child =  exec(cmdStr+escapeFileName(filename));
        console.log('processing '+filename);
        child.stdout.on('data', function(data) {
            console.log(data);
        });
        child.stderr.on('data', function(data) {
            console.log(data);
        });
        child.on('close', function(code) {
            if(files.length > 0){
                process(files.pop());
            }
        });
    }else{
        if(files.length > 0){
            process(files.pop());
        }
    }   
}

function escapeFileName(filename){
    var name = "";
    for (var i = 0, len = filename.length; i < len; i++) {
        if(filename[i]==" " || filename[i]=="(" || filename[i]==")" || filename[i]=="'" )
        {
            name+="\""+filename[i]+"\"";
        }else{
            name+=filename[i];
        }
    }
    return name;
}