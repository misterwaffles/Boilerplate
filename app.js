//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var graph = require('fbgraph');
var handlebars = require('express3-handlebars');
var app = express();
var TWITTER_CONSUMER_KEY = "K2BwiEw8eKwox259cboeW4ak3";
var TWITTER_CONSUMER_SECRET = "rR2vnMDKyLrKx3FtOf98KK31weSIlZzr6HraeD76cNKI4cG9DE";
var passport = require('passport')
  , util = require('util')
  , TwitterStrategy = require('passport-twitter').Strategy;

//route files to load
var index = require('./routes/index');
//var connect = require('./routes/connect');
var twitter = require('./routes/twitter');
var connected = require('./routes/connected');
var Twit = require('twit');
global.token;
global.token_secret;
// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  //app.set('view engine', 'ejs');
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

/*
//app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
 app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

*/
// Use the TwitterStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Twitter profile), and
//   invoke a callback with a user object.
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://contempo.herokuapp.com/"
  },
  function(token, tokenSecret, profile, done) {
      global.token = token;
      global.token_secret = tokenSecret;

    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Twitter profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitter account with a user record in your database,
      // and return that user instead.
        console.log('token ' + token);
        console.log('token_secret ' + tokenSecret);
        return done(null, profile);
    });
  }
));

app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

// GET /auth/twitter/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

function ensureAuthenticated(req, res, next) {
    
  if (req.isAuthenticated()) { console.log("REQ = " + req); return next(); }
  res.redirect('/')
}

global.graph = graph;

//database setup - uncomment to set up your database
//var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/DATABASE1');

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');



var conf = {
    client_id:      '484197295013302'
  , client_secret:  '3b6dea2d1ecf2e4a101039a280f6d1ad'
  , scope:          'email, read_stream, user_status, friends_likes, user_interests, friends_interests, user_actions.video, user_likes'
  , redirect_uri:   'http://contempo.herokuapp.com/connect'
};
console.log(global.token);

//routes
app.get('/', function(req, res) {
    console.log("USER INFO");
    console.log(req.param("oauth_token"));
    console.log(req.user);
    global.token = req.param("oauth_token");
    global.token_secret = req.param("oauth_verifier");
    index.view(req, res);
});
app.get('/connect', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
        "client_id":     conf.client_id
      , "redirect_uri":  conf.redirect_uri
      , "scope":         conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
        res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }
  // code is set
  // we'll send that and get the access token
  graph.authorize({
      "client_id":      conf.client_id
    , "redirect_uri":   conf.redirect_uri
    , "client_secret":  conf.client_secret
    , "code":           req.query.code
  }, function (err, facebookRes) {
      console.log("hi " + graph.getAccessToken() + "!!!");
      
      
   

    res.redirect('/connected');
  });


});
console.log(graph.getAccessToken());
app.get('/connected', function(req, res) {
    //res.render('connected');
    connected.view(res);
});

app.get('/twitter', function(req, res) {
    //twitter authentication goes here...
    res.redirect('/connected'); 
    
});
app.post('/movies', function(req, res) {
    
});
//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});