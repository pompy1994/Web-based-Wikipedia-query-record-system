/**
 *  Import all files' name into an array
 */

var fs=require('fs');
var path = require('path');

//var fileDirectory = "/Users/sharon/Dropbox/5-1.COMP5347-Web/Ass2/a2-test1/";
var fileDirectory = "/Users/sharon/Dropbox/5-1.COMP5347-Web/Ass2/revisions/";
var files;
var filelist = [];

exports.listAllArticles = function(callback){
    if(fs.existsSync(fileDirectory)){
        fs.readdir(fileDirectory, function (err, f) {
            if (err) {
                console.log(err);
                return;
            }
            files = f;   
            files.forEach(function(file) {
                if (fs.statSync(path.join(fileDirectory, file)).isDirectory()) {
                    filelist = walkSync(path.join(fileDirectory, file), filelist);
                }
                else {
                    file = path.parse(file).name;
                    filelist.push(file);
                }
            })
        //console.log(filelist);   
        callback(filelist);
        }); 
    }
    else  {
        console.log(fileDirectory + "  Not Found!");
    }
}


