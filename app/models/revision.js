/**
 * Revision Scahma and model
 */

var mongoose = require('./db')
var fs = require('fs');

var admin = fs.readFileSync(__dirname + '/../../public/admin.txt').toString().split("\n");
var bot = fs.readFileSync(__dirname + '/../../public/bot.txt').toString().split("\n");
var registed = admin.concat(bot);

var RevisionSchema = new mongoose.Schema(
		{title: String, 
		 timestamp:String, 
		 user:String, 
		 anon:String,
		 type:String},
		 {
			    versionKey: false 
		})

//Overall-1: find the article with the most number of revisions
var mostNumRevisions = [
	{$group: {_id:"$title", numOfRevisions:{$sum:1}}},
	{$sort: {numOfRevisions:-1}},
	{$limit: 1}
]

RevisionSchema.statics.findMostNumRevisions = function(callback){
	return this.aggregate(mostNumRevisions)
	.exec(callback)
}

//Overall-2: find the article with the least number of revisions
var leastNumRevisions = [
	{$group: {_id:"$title", numOfRevisions:{$sum:1}}},
	{$sort: {numOfRevisions:1}},
	{$limit: 1}
]

RevisionSchema.statics.findLeastNumRevisions = function(callback){
	return this.aggregate(leastNumRevisions)
	.exec(callback)
}

//Overall-3: find the article edited by largest group of registered users.
var largestRegUsers = [
	{$match: {'anon': {$exists: false}, 'user': {'$nin': registed}}},
	{$group: {_id: {title: "$title", user: "$user"}}},
	{$group: {_id: "$_id.title", numOfUser:{$sum:1}}},
	{$sort: {numOfUser:-1}},
	{$limit: 1}
]

RevisionSchema.statics.findLargestResUsers = function(callback){
	return this.aggregate(largestRegUsers)
	.exec(callback)
}

//Overall-4: find the article edited by largest group of registered users.
var smallestRegUsers = [
	{$match: {'anon': {$exists: false}, 'user': {'$nin': registed}}},
	{$group: {_id: {title: "$title", user: "$user"}}},
	{$group: {_id: "$_id.title", numOfUser:{$sum:1}}},
	{$sort: {numOfUser:1}},
	{$limit: 1}
]

RevisionSchema.statics.findSmallestResUsers = function(callback){
	return this.aggregate(smallestRegUsers)
	.exec(callback)
}

//Overall-5: find the article with the longest history (measured by age)
var longestAge = [
	{$group: {_id: "$title", timestamp: {"$min": "$timestamp"}}},
	{$sort: {timestamp: 1}},
    {$limit: 1}
]

RevisionSchema.statics.findLongestAge = function(callback){
	return this.aggregate(longestAge)
	.exec(callback)
}

//Overall-6: find the article with the shortest history (measured by age)
var shortestAge = [
	{$group: {_id: "$title", timestamp: {"$min": "$timestamp"}}},
	{$sort: {timestamp: -1}},
    {$limit: 1}
]

RevisionSchema.statics.findShortestAge = function(callback){
	return this.aggregate(shortestAge)
	.exec(callback)
}

//Overall-barchart
var barChart = [
	{$project: {
		year: {$substr: ["$timestamp", 0, 4]}, 
		type: "$type"
	}},        
    {$group: {_id: {year:"$year", type:"$type"}, number: {$sum: 1}}},
    {$project: {
		_id: 0,
		year: "$_id.year",
		type:"$_id.type", 
        number: "$number"
    }},
	{$sort: {"year": 1}},
]

RevisionSchema.statics.listBarChart = function(callback){
	return this.aggregate(barChart)
	.exec(callback)
}	

//Overall-piechart
var pieChart = [    
    {$group: {_id: "$type", number: {$sum: 1}}},
	{$project: {
		_id: 0,
		type:"$_id", 
        number: "$number"
    }},
]

RevisionSchema.statics.listPieChart = function(callback){
	return this.aggregate(pieChart)
	.exec(callback)
}	

//update data set
RevisionSchema.statics.updateData = function(data, callback){
	return this.insertMany(data, {}, function(error, result){
	 	callback();
	})
}

//find the latest rev time of a article
RevisionSchema.statics.findTitleLatestRev = function(title, callback){	
	return this.find({'title':title})
	.sort({'timestamp':-1})
	.limit(1)
	.exec(callback)
}

//Individual-1: find the total number of revisions
RevisionSchema.statics.getNumRevs = function(title, callback){
	return this.find({'title':title}).count().exec(callback)
}

//Individual-2: list the top 5 regular users
RevisionSchema.statics.listTop5Users = function(title, callback){
	return this.aggregate([
		{$match: {"title": title}},
		{$group: {_id: "$user", numOfRevisions:{$sum:1}}},
		{$sort: {numOfRevisions:-1}},
		{$limit: 5}
	])
	.exec(callback)
}

//Individual-3: barchart
RevisionSchema.statics.listIndBarChart = function(title, callback){
	return this.aggregate([
		{$match: {"title": title}},
		{$project: {
			year: {$substr: ["$timestamp", 0, 4]}, 
			type: "$type"
		}},        
		{$group: {_id: {year:"$year", type:"$type"}, number: {$sum: 1}}},
		{$project: {
			_id: 0,
			year: "$_id.year",
			type:"$_id.type", 
			number: "$number"
		}},
		{$sort: {"year": 1}},
	])
	.exec(callback)
}	

//Individual-4: piechart
RevisionSchema.statics.listIndPieChart = function(title, callback){
	return this.aggregate([
		{$match: {"title": title}},
		{$group: {_id: "$type", number: {$sum: 1}}},
		{$project: {
			_id: 0,
			type:"$_id", 
			number: "$number"
		}},
	])
	.exec(callback)
}	

//Individual-5: barchart2
RevisionSchema.statics.listIndBarChart2 = function(title, userList, callback){
	this.aggregate([
		{$match: {"title": title, "user": {'$in': userList}}},
		{$project: {
			year: {$substr: ["$timestamp", 0, 4]}, 
		}},
		{$group: {_id: "$year", number: {$sum:1}}},
		{$sort: {"_id": 1}},
	])
	.exec(callback)
}	


var Revision = mongoose.model('Revision', RevisionSchema, 'revisions')

module.exports = Revision