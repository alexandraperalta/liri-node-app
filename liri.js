require("dotenv").config();
var keys = require("./keys.js"); //my keys file
var SpotifyClient = require("node-spotify-api");
var TwitterClient = require("twitter");
var request = require("request"); //calls to API
var fs = require("fs"); //file writing for logs
var spotify = new SpotifyClient(keys.spotify);
var twitter = new TwitterClient(keys.twitter);


//start
main();
// takes in user input
function main(){
    var command = process.argv[2];
    var requestData = process.argv[3];
    // if the user doesn't use quotes around their song/movie, 
    // get the rest of the args and stick them in quotes
    if(process.argv.length > 4){
        for(var i = 4; i < process.argv.length; i++){
            requestData += " ";
            requestData += process.argv[i];
        };
    };
    processCommands(command, requestData);
};

//takes in user arguments to determine which API to use
function processCommands(command, data){
    switch(command){
        case 'my-tweets':
            getTweets()
            break;
    
        case 'spotify-this-song':
            getSong(data)
            break;

        case 'movie-this':
            getMovie(data)
            break;

        case 'do-what-it-says':
            doIt()
            break;

        default:
            console.log("No such command '" + command + "'");
            console.log("Try one of these commands:\n'my-tweets'\n'spotify-this-song'\
            \n'movie-this'\n'do-what-it-says");
            break;    
        
    }
}

function getTweets(){
    console.log("tweet function called");
    // set parameters for api call
    var endpoint = "statuses/user_timeline"
    var params = {
        // user_name: "alexand73926758",
        count: 20
    }

    // call api
    twitter.get(endpoint, params, function(error, results){
        if(!error){           
           for(var i in results){
                output = "------------------------------\n";
                output += results[i].created_at + "\n";
                output += results[i].text + "\n";
                output += "------------------------------\n";
                console.log(output);
                // updateLog(output);
           };
        } else {
            console.log("Sorry, there was an error getting your tweets");
            output = "ERROR: " + error;
            updateLog(output, "my-tweets");
        };
    });
}

//get song from Spotify
function getSong(song){
    if(song == undefined){
        song = "The Sign Ace of Base";
    }
    // set api parameters
    var params = {
        type: 'track',
        query: song,
        limit: 5
    };
    //call the api
    spotify.search(params, function(error, results){
        if(!error){
          var tracks = results.tracks.items;
          console.log("\n------------------------------\n");
            for(var i in tracks){
                var output = '';
                var artists = [];
                var previewUrl = tracks[i].preview_url;

                for(var j in tracks[i].artists){
                    artists.push(" " + tracks[i].artists[j].name);
                };
                if(previewUrl === null || previewUrl === "undefined"){
                    previewUrl = "Currently Unavailable"
                };
                output += "Song: " + tracks[i].name + "\n";
                output += "Artist(s): " + artists + "\n";
                output += "Album: " + tracks[i].album.name + "\n";
                output += "Preview: " + previewUrl + "\n";
                output += "\n------------------------------\n";
                console.log(output);
            };
        } else {
            console.log("I'm sorry, there was an error getting that song");
            console.log("Error: " + error);
            updateLog(output, "spotify-this-song");
        };
    });
}

//get movie from omdb
function getMovie(movie){
    if(movie == undefined){
        movie = "Mr. Nobody";
    }
    // set the api url
    var url = "http://www.omdbapi.com/?apikey=trilogy&t=" + movie + "&type=movie&plot=full";
    // call the api
    request(url, function(error, response, results){
        if(!error&& response.statusCode === 200){
            var  parsedData = JSON.parse(results);
            var output = "\n------------------------------\n";
            output += "Title: " + parsedData.Title;
            output += "\nDirector: " + parsedData.Director;
            output += "\nYear: " + parsedData.Year;
            output += "\nRated: " + parsedData.Rated;
            output += "\nCountry: " + parsedData.Country;
            output += "\nLanguage: " + parsedData.Language;
            output += "\nIMDB Rating: " + parsedData.imdbRating;
            output += "\nRotten Tomatoes Rating: " + parsedData.Ratings[1].Value;
            output += "\nStarring: " + parsedData.Actors;
            output += "\nPlot: \n" + parsedData.Plot;
            output += "\n------------------------------\n";
            console.log(output);
           } else {
               console.log("I'm sorry, there was an error getting that movie");
               output = "ERROR: " + error;
           };
     updateLog(output, "movie-this");
    });
}

function doIt(){    
    //read random.txt and send the info to processArgs function
    fs.readFile("random.txt", "utf8", function(error, data){
        var arr = data.split(",");
        var command = arr[0];
        var requestData = arr[1];
        processArgs(command, requestData);
    });
};

// updates log.txt
function updateLog(data, command){
    var file = "log.txt";
    
    var logMessage = "\n*****************BEGIN LOG ENTRY*****************\n";
    logMessage += new Date() + "\nResults of" + command + ":\n";
    logMessage += "Output\n";
    logMessage += data;
    
    fs.appendFile(file, logMessage, function(err){
        if(err){
            console.log("Error writing to log file");
        };
    });
};