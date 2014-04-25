var gres;
var Twit = require('twit');
var request = require('request');
var T;
var allMovies;
var myFriends; //store the friend IDs
var movieData; //store the result of the get request

exports.view = function(res) {
    //res.render('connected');
    gres = res;
    movieData = {};
    //var friends = new Array();
    graph.get("/me/movies", function (err, res) {
                
                //var movies = res.data;
                //var numMovies = movies.length;
                //console.log(res);
                /*
                for (var j = 0; j < numMovies; j++) {
                    console.log("hi");
                }*/
    });
    allMovies= new Array();// [""];
    var currMovie = 1;
            var i;
    var allFriends = new Array();

    graph.get("/me/friends", function(err, res) {
        //console.log(res);
        var friends = res.data;
        var numFriends = friends.length;
        //console.log(res);
        for (i = 0; i < numFriends; i++) {
            //console.log("#" + i + ": " + friends[i].name);
            var currID = friends[i].id;
            allFriends.push(currID);
        }
            myFriends = allFriends;
            
            findMovies(myFriends);
           // console.log(allFriends.length);

        });
              
}

function strcmp(a, b) {
    a = a.toString(), b = b.toString();
    for (var i=0,n=Math.max(a.length, b.length); i<n && a.charAt(i) === b.charAt(i); ++i);
    if (i === n) return 0;
    return a.charAt(i) > b.charAt(i) ? -1 : 1;
}

var x = 0; //keeps track of how many friends were already checked
function findMovies(friends) {
    x = 0;
    for (var i = 0; i < friends.length; i++) {
        var currID = friends[i];
        //console.log(currID);
        graph.get("/" + currID + "/movies", function (err, res) {
            var movies = res.data;
            movieData[friends[x]] = res.data;
            //console.log("after adding: " + Object.keys(movieData).length + "and the ID was " + friends[x]);


            x++;
            
            for (var j = 0; j < movies.length; j++) {
                allMovies.push(movies[j].name);
            }
            
            if (x == friends.length)  //to make sure it's only executed once
                findtop(allMovies);
            //console.log("here");
        }); //end get movies
    }
} //end findmovies
var movieMap;
function findtop(movies) {
    movieMap = {};
    movies.sort(strcmp);
    //console.log("length = " + movies.length);
    for (var k = 0; k < movies.length; k++) {
        if (movieMap[movies[k]] > 0) 
            movieMap[movies[k]]++;
        else 
            movieMap[movies[k]] = 1;
        
    }
    var sortable = [];

    for (movie in movieMap) {
      sortable.push([movie, movieMap[movie]]) ;
    }
    
    sortable.sort(function(a, b) {return a[1] - b[1]})
    
    doneSorting(sortable);
   // console.log(sortable);   
}

function doneSorting(movies) {
    movies.reverse();
    
    var result = {list: []};
    
    var x = 25;
    
    //find the connections between these 25
    //get all the friends...look through all of their movies again
    //var connections = []; //an array that will store which movies are commonly liked
    var top25 = [];
    for (var i = 0; i < 25; i++) {
        top25.push(movies[i]);

    }
    for (friend in myFriends) 
    //console.log("before calling commonMovies " + movieData.length);
    var commonMovies = findCommonMovies(myFriends, top25);
    
    for (var i = 0; i < movies.length; i++) { //convert to JSON
        var curr = movies[i];
        if (curr[1] > 3) 
        result.list.push({"title": curr[0], "likes": curr[1]});
    }
    
    gres.render('connected', result);

    //var result = {'title': 'Harry Potter', 'likes': '41'};

    //document.getElementById("loading").hide();
}

function findCommonMovies(friends, movies) {
    var resultsMap = {};
    x = friends.length;


   // console.log("FRIENDS LENGTH = " + x);
    //for (friend in friends) 
    //console.log("MOVIE DATA: " + movieData[friend]);
    for (var i = 0; i < friends.length; i++) {
        var currID = myFriends[i];
                            //console.log("MOVIES HERE IS " + movieData[myFriends[i]]);

            //console.log("DURING THE METHOD adding: " + movieData[currID]);

        //console.log(currID);
        //graph.get("/" + currID + "/movies", function (err, res) {
            
            var currMovies = movieData[currID];//use results of previous get
            console.log("CURR MOVIES = " + currMovies[0]);
            x--;
        
            for (var j = 0; j < movies.length; j++) {
                //var index = currMovies.indexOf(movies[j].name);
                //if (index != -1) 
                //console.log(index);
                
                /*
                if (index >= 0) { //this movie exists in this friend's likes
                    
                    for (var k = 0; k < movies.length; k++) { //check for other common movies that they've liked
                        var curr = currMovies.indexOf(movies[k]);
                        
                        if (curr >= 0) {
                            //the user liked movies[k].name as well
                            resultsMap[movies[j].name].push(movies[k].name);
                        }     
                    }
                    //keep track of it here
                }*/
                //if the movie is the same as one of the 25 listed, then keep track of it
                
            }
        
    
    
            if (x == 0) { //to make sure it's only executed once
                //console.log("results map is " + resultsMap);
                //return resultsMap;
            }
            //console.log("here");
        //}); //end get movies
    }
}
function displayPage(movies, tweets) {

    for (var i = 0; i < 25; i++) {
        var curr = movies[i];
        result.list.push({"title": curr[0], "likes": curr[1]});
    }
    gres.render('connected', result);
}