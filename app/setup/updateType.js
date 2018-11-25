/**
 * Update the data set with new property "type"
 */

var mongoose = require('mongoose');
var fs = require('fs');

var admin = fs.readFileSync(__dirname + '/../../public/admin.txt').toString().split("\n");
var bot = fs.readFileSync(__dirname + '/../../public/bot.txt').toString().split("\n");
var registed = admin.concat(bot);

mongoose.connect('mongodb://localhost/wiki',function () {
	  console.log('mongodb connected')
	});

var revSchema = new mongoose.Schema(
		{title: String, 
		 timestamp:String, 
		 user:String, 
		 anon:String,
         type:String},
		 {
			    versionKey: false 
		})

var Revision = mongoose.model('Revision', revSchema, 'revisions')

//update anon with type - anon
Revision.update(
    {'anon':{$exists:true}},
	{$set:{type:'anon'}},{multi: true, upsert:true},
    function(err,result){
		if (err){
			console.log("Update error!")
		}else{
            console.log('anon updated:');
			console.log(result);
		}})

//update admin with type - admin
Revision.update(
    {'user': {'$in': admin, '$nin': bot}},
	{$set:{type:'admin'}},{multi: true, upsert:true},
    function(err,result){
		if (err){
			console.log("Update error!")
		}else{
            console.log('admin updated:');
			console.log(result);           
	}})

//update bot with type - bots
Revision.update(
    {'user': {'$in': bot}, 'anon':{$exists:false}},
    {$set:{type:'bot'}},{multi: true, upsert:true},
    function(err,result){
        if (err){
            console.log("Update error!")
        }else{
            console.log('bot updated:');
            console.log(result);
    }})
    
//update regular user with type - regular
Revision.update(
    {'anon': {$exists: false},'user': {'$nin': registed, $exists: true}},
	{$set:{type:'regular'}},{multi: true, upsert:true},
    function(err,result){
		if (err){
			console.log("Update error!")
		}else{
			console.log('regular updated:');
            console.log(result);
		}})

//update no user with type - no
Revision.update(
    {'user': {$exists: false}},
	{$set:{type:'no'}},{multi: true, upsert:true},
    function(err,result){
		if (err){
			console.log("Update error!")
		}else{
			console.log('no user updated:');
            console.log(result);
		}})


// find the anon:'' & user:''
// Revision.find({'anon':{$exists: true}, 'user':{'$in': bot}}, function(err, result){
//     if (err){
// 			console.log("Find error!")
// 		}else{
// 			console.log('find:');
//             console.log(result);
// }})
