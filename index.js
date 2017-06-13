var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var thumb = require('mongoose-thumbnail');
// Requiring our Note and Article models
var Comment = require("./models/comment.js");
var Article = require("./models/Article.js");
//var Picture = require("./models/image.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_7nvq3lqq:b1avavgbcvk2g2v376f7j1p8h5@ds123722.mlab.com:23722/heroku_7nvq3lqq");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


app.get("/scrape", function(req, res) {
	// Save an empty result object
	var result = []; 
	var imageLink, link, title, summary;
  // First, we grab the body of the html with request
  request("http://www.goal.com/en-us/news/archive/1?ICID=HP_TN_QL_4", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:

    $("div.imgBox").each(function(i, element){
    	imageLink = $(this).children("a").attr("href");

    });

    $("articleInfo.a").each(function(i, element){
    	link = $(this).children("a").text();
    	title = $(this).children("a").attr("href");

    });

    $("div.articleSummary").each(function(i, element) {      

      // Add the text and href of every link, and save them as properties of the result object
      summary = $(this).text();

      });

    result.push({
      Title: title,
      Link: link,
      Image:imageLink,
      Summary:summary
    });
    console.log(result);

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    
  });
  // Tell the browser that we finished scraping the text
  res.send(result);
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  Article.find({}, function(err, doc){
    if(err){
      console.log(err);

    }
    else{
      res.send(doc);
    }
  })


  // TODO: Finish the route so it grabs all of the articles


});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
	Article.findOne({ "_id": req.params.id })
  // ..and populate all of the comments associated with it
  .populate("Comment")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
  });

app.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new comment the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "Comment": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});




// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});