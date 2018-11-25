var Revision = require("../models/revision")
var MediaWiki = require("./mediaWikiRequest")
var FileList = require("./importFileName")
var fs = require('fs');

var admin = fs.readFileSync(__dirname + '/../../public/admin.txt').toString().split("\n");
var bot = fs.readFileSync(__dirname + '/../../public/bot.txt').toString().split("\n");
var registed = admin.concat(bot);

module.exports.mainPage=function(req, res){
    var overallData = {};
    var count = 0;

    //Overall-1
    Revision.findMostNumRevisions(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            // console.log("The article with the most number of revisions is: ");
            // console.log(result[0]._id);
            overallData.mostNumRevisions = result[0]._id;
            handleOverall(++count, res, overallData);
        }
    })

    //Overall-2
    Revision.findLeastNumRevisions(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            // console.log("The article with the least number of revisions is: ");
            // console.log(result[0]._id);
            overallData.leastNumRevisions = result[0]._id;
            handleOverall(++count, res, overallData);
        }
    })  

    //Overall-3
    Revision.findLargestResUsers(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            // console.log("The article edited by largest group of registered users is: ");
            // console.log(result[0]._id);
            overallData.largestResUsers = result[0]._id;
            handleOverall(++count, res, overallData);
        }
    })  

    //Overall-4
    Revision.findSmallestResUsers(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            // console.log("The article edited by smallest group of registered users is: ");
            // console.log(result[0]._id);
            overallData.smallestResUsers = result[0]._id;
            handleOverall(++count, res, overallData);
        }
    })  

    //Overall-5
    Revision.findLongestAge(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            // console.log("The article with the longest history is: ");
            // console.log(result[0]._id);
            overallData.longestAge = result[0]._id;
            handleOverall(++count, res, overallData);
        }
    }) 

    //Overall-6
    Revision.findShortestAge(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            // console.log("The article with the shortest history is: ");
            // console.log(result[0]._id);
            overallData.shortestAge = result[0]._id;
            handleOverall(++count, res, overallData);
        }
    }) 

    //Overall-barchart
    Revision.listBarChart(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            //console.log("The overall bar chart is: ");
            //console.log(result);
            overallData.overallBar = result;
            handleOverall(++count, res, overallData);
        }
    }) 

    //Overall-pieChart
    Revision.listPieChart(function(err, result){
        if (err){
            console.log("Aggregation Error")
        }else{
            //console.log("The overall pie chart is: ");
            //console.log(result);
            overallData.overallPie = result;
            handleOverall(++count, res, overallData);
        }
    }) 

    //Individual-dropdown list
    FileList.listAllArticles(function(fileList){
        overallData.fileList = fileList;
        handleOverall(++count, res, overallData);
    })
}

// rander the wiki.ejs
function handleOverall(count, res, overallData){
    if(count < 9){ //!!The count need to be modified if there are more data to be loaded!!
        return;
    }
    res.render('wiki.ejs', {overallData: overallData});
}


module.exports.getByTitle=function(req, res){
    var individualData = {};
    title = req.query.title;
    individualData.title = title;
    var count = 0;
    var latestRev;
    var message;

    Revision.findTitleLatestRev(title, function(err,result){
		if (err){
			console.log("Cannot find " + title + ",s latest revision!")
		}else{
            latestRev = result[0].timestamp;
            console.log(latestRev);
            var date = new Date();
            var currentDate = date.toISOString();
            console.log(currentDate);
            var d1 = new Date(latestRev);
            var d2 = new Date(currentDate);
            var diff = d2 - d1;
            if (diff > 60e3) console.log(
                Math.floor(diff / 60e3), 'minutes ago'
            );
            else console.log(
                Math.floor(diff / 1e3), 'seconds ago'
            );
            if(diff < 1440*60e3) {
                message = "The database has been up tp date in one day!";
                individualData.message = message;
                handleIndividual(++count, res, individualData);
                //Individual-1
                Revision.getNumRevs(title,function(err,result){
                    if (err){
                        console.log("Cannot find total numble revisions of title: " + title) 
                    }else{
                        individualData.numRevs = result;
                        handleIndividual(++count, res, individualData)
                    } 
                })

                //Individual-2
                Revision.listTop5Users(title,function(err,result){
                    if (err){
                        console.log("Cannot find top 5 users of title: " + title) 
                    }else{
                        individualData.top5Users = result;
                        handleIndividual(++count, res, individualData);
                        var userList = [];
                        result.forEach(function(element){
                            userList.push(element._id);
                        })
                        //Individual-5 barchart2
                        Revision.listIndBarChart2(title, userList, function(err, result){
                            if (err){
                                console.log("Cannot list 2nd bar chart of title: " + title) 
                            }else{
                                individualData.individualBar2 = result;
                                handleIndividual(++count, res, individualData)
                            } 
                        })
                    } 
                })

                //Individual-3 barchart
                Revision.listIndBarChart(title,function(err,result){
                    if (err){
                        console.log("Cannot list bar chart of title: " + title) 
                    }else{
                        individualData.individualBar = result;
                        handleIndividual(++count, res, individualData)
                    } 
                })

                //Individual-4 piechart
                Revision.listIndPieChart(title,function(err,result){
                    if (err){
                        console.log("Cannot list pie chart of title: " + title) 
                    }else{
                        individualData.individualPie = result;
                        handleIndividual(++count, res, individualData)
                    } 
                })
            }
            else {
                // pull new revisions from MediaWiki
                MediaWiki.getUpdates(title, latestRev, function(revisions){
                    if(revisions.length > 0){
                        message = "There are " + revisions.length + " new revisions has been downloaded!";
                    }
                    else {
                        message = "There is no new revision to be downloaded!";
                    }
                    individualData.message = message;
                    handleIndividual(++count, res, individualData);

                    // add new property with each user
                    var type = "";
                    for(var o in revisions){
                        if (revisions[o].hasOwnProperty('anon')){
                            type = "anon";
                            revisions[o].type = type;
                        } else if(bot.indexOf(revisions[o].user) > -1){
                            type = "bot";
                            revisions[o].type = type;
                        } else if (admin.indexOf(revisions[o].user) > -1){
                            type = "admin";
                            revisions[o].type = type;
                        } else if (!revisions[o].hasOwnProperty('user')){
                            type = "no";
                            revisions[o].type = type;
                        } else {
                            type = "regular";
                            revisions[o].type = type;
                        }
                        revisions[o].title = title;
                    }
                    // insert into database
                    Revision.updateData(revisions, function(err,result){
                        if (err){
                            console.log("Cannot update new revisions data of : " + title) 
                        }
                        else {
                            //Individual-1
                            Revision.getNumRevs(title,function(err,result){
                                if (err){
                                    console.log("Cannot find total numble revisions of title: " + title) 
                                }else{
                                    individualData.numRevs = result;
                                    handleIndividual(++count, res, individualData)
                                } 
                            })

                            //Individual-2
                            Revision.listTop5Users(title,function(err,result){
                                if (err){
                                    console.log("Cannot find top 5 users of title: " + title) 
                                }else{
                                    individualData.top5Users = result;
                                    handleIndividual(++count, res, individualData);
                                    var userList = [];
                                    result.forEach(function(element){
                                        userList.push(element._id);
                                    })
                                    //Individual-5 barchart2
                                    Revision.listIndBarChart2(title, userList, function(err, result){
                                        if (err){
                                            console.log("Cannot list 2nd bar chart of title: " + title) 
                                        }else{
                                            individualData.individualBar2 = result;
                                            handleIndividual(++count, res, individualData)
                                        } 
                                    })
                                } 
                            })

                            //Individual-3 barchart
                            Revision.listIndBarChart(title,function(err,result){
                                if (err){
                                    console.log("Cannot list bar chart of title: " + title) 
                                }else{
                                    individualData.individualBar = result;
                                    handleIndividual(++count, res, individualData)
                                } 
                            })

                            //Individual-4 piechart
                            Revision.listIndPieChart(title,function(err,result){
                                if (err){
                                    console.log("Cannot list pie chart of title: " + title) 
                                }else{
                                    individualData.individualPie = result;
                                    handleIndividual(++count, res, individualData)
                                } 
                            })
                        }
                    });
                })  
            }
		}	
	})	  
}

// respond json result
function handleIndividual(count, res, individualData){
    if(count < 6){ //!!The count need to be modified if there are more data to be loaded!!
        return;
    }
    res.json(individualData);
}

