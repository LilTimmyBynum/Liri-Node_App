// liri.js file

const fs = require("fs");

var request = require("request");

var Keys = require("./keys.js");

var Twitter = require('twitter');

var Spotify = require('node-spotify-api');

var rottenMovies = require('rotten-movies');

var mySpotKeys = Keys.spotifyKeys;

var myKeys = Keys.twitterKeys;

// my_tweetes shows last 20 tweets and when they were created
function my_tweets() {

    var myTwitter = new Twitter({
        consumer_key: myKeys.consumer_key,
        consumer_secret: myKeys.consumer_secret,
        access_token_key: myKeys.access_token_key,
        access_token_secret: myKeys.access_token_secret
    });

    var params = { screen_name: 'TimoNBNY' };
    myTwitter.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            for (var count = 0; count < tweets.length; count++) {
                console.log(tweets[count].created_at);
                console.log(tweets[count].text);
                console.log("");
                fs.appendFile("log.txt", tweets[count].created_at + "\n" + tweets[count].text + "\n" + "\n", function(err) {
                    if (err) {
                        return console.log(err);
                    };
                });
            };
        };
    });
};

function spotify_this_song(song, dealer) {
    var fullSong = "";
    var songQuery;

    if (dealer) {
        fullSong = song;
    } else {
        for (var i = 3; i < process.argv.length; i++) {
            fullSong += process.argv[i] + " ";
        };
    };
    if (song) {
        songQuery = "track:\"" + fullSong + "\"";
    } else {
        songQuery = "track:\"The Sign\"&artist:\"Ace of Base\"";
    };
    var spotify = new Spotify({
        id: mySpotKeys.client_Id,
        secret: mySpotKeys.client_Secret
    });
    spotify.search({ type: 'track', query: songQuery, limit: '1' }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        };

        for (var loop = 0; loop < data.tracks.items.length; loop++) {

            var artist = "Artist: " + data.tracks.items[loop].album.artists[0].name;
            var namex = "Name: " + data.tracks.items[loop].name;
            var preview = "Song preview: " + data.tracks.items[loop].preview_url;
            var album = "Album: " + data.tracks.items[loop].album.name;

            console.log(artist);
            console.log(namex);
            console.log(preview);
            console.log(album);
            fs.appendFile("log.txt", artist + "\n" + namex + "\n" + preview + "\n" + album + "\n" + "\n", function(err) {
                if (err) {
                    return console.log(err);
                };
            });

        };
    });
};


function rottenUrl(title) {
    var movieUrl;
    var lowerTitle = title.toLowerCase();
    var trimTitle = lowerTitle.trim();
    var noSpace = trimTitle.replace(/ /g, "_");
    var cleanTitle = noSpace.replace(/,|'/g, "");
    rottenMovies.findUrl(cleanTitle, undefined, undefined, function(err, url) {
        if (err) {
            var error = "Rotten Tomatoes URL: " + err;
            console.log(error);
            fs.appendFile("log.txt", error + "\n" + "\n", function(err) {
                if (err) {
                    return console.log(err);
                };
            });
        } else {
            movieUrl = url;
            console.log("Rotten Tomatoes URL: " + movieUrl);
            fs.appendFile("log.txt", movieUrl + "\n" + "\n", function(err) {
                if (err) {
                    return console.log(err);
                };
            });
        }
    });
};

// movie_this shows movie information
function movie_this(movie, dealer) {
    var movieName;
    var fullTitle = "";

    if (dealer) {
        fullTitle = movie;
    } else {
        for (var i = 3; i < process.argv.length; i++) {
            fullTitle += process.argv[i] + " ";
        };
    };
    if (movie) {
        movieName = fullTitle;
    } else {
        movieName = "mr nobody";
    };

    request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=40e9cece", function(error, response, body) {
        if (!error && response.statusCode === 200) {

            var myTitle = "Title: " + JSON.parse(body).Title;
            var myYear = "Year: " + JSON.parse(body).Year;
            var myCountry = "Country: " + JSON.parse(body).Country;
            var myLanguage = "Language: " + JSON.parse(body).Language;
            var myPlot = "Plot: " + JSON.parse(body).Plot;
            var myActors = "Actors: " + JSON.parse(body).Actors;

            console.log(myTitle);
            console.log(myYear);
            console.log(myCountry);
            console.log(myLanguage);
            console.log(myPlot);
            console.log(myActors);
            fs.appendFile("log.txt", myTitle + "\n" + myYear + "\n" + myCountry + "\n" + myLanguage + "\n" + myPlot + "\n" + myActors + "\n", function(err) {
                if (err) {
                    return console.log(err);
                };
            });
            rottenUrl(movieName);
        }
    });
};

if (process.argv[2] === "my-tweets") {
    my_tweets();
};

if (process.argv[2] === "movie-this") {
    var movie = process.argv[3];
    movie_this(movie);
};

if (process.argv[2] === "spotify-this-song") {
    var song = process.argv[3];
    spotify_this_song(song);
};

if (process.argv[2] === "do-what-it-says") {
    var myData = "";
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            return console.log("ERROR" + error);
        };
        // console.log("DATA" + data);
        myData = data;

        // console.log("MYDATA -->" + myData);
        var randomArray = myData.split(/,| /);

        // console.log(randomArray[0]);

        if (randomArray[0] === "my-tweets") {
            my_tweets();
        };

        if (randomArray[0] === "spotify-this-song") {
            var randomSong = "";
            for (var i = 1; i < randomArray.length; i++) {
                randomSong += randomArray[i] + " ";
            };
            var song = randomSong;
            var dealer = "dealer";
            spotify_this_song(song, dealer);
        };

        if (randomArray[0] === "movie-this") {
            var randomMovie = "";
            for (var i = 1; i < randomArray.length; i++) {
                randomMovie += randomArray[i] + " ";
            };
            var movie = randomMovie;
            var dealer = "dealer";
            movie_this(movie, dealer);
        };
    });
};
