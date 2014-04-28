exports.view = function(req, res) {
	res.render('index');
}

exports.authenticate = function(req, res) {
    console.log("hi");
    console.log(exports.fb);
    
    
    // get authorization url
    var authUrl = exports.graph.getOauthUrl({
        "client_id":     '484197295013302'
      , "redirect_uri":  'http://contempo.herokuapp.com/connect'
    });

    // shows dialog
    res.redirect(authUrl);

    // after user click, auth `code` will be set
    // we'll send that and get the access token
    exports.graph.authorize({
        "client_id":      '484197295013302'
      , "redirect_uri":   'http://contempo.herokuapp.com/connect'
      , "client_secret":  '3b6dea2d1ecf2e4a101039a280f6d1ad'
      , "code":           req.query.code
    }, function (err, facebookRes) {
      res.redirect('/connect');
    });
    
    
    
    
    
    
    
    
    
    
}





