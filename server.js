var express  = require('express');
var app      = express();
var port  	 = process.env.PORT || 8080;

app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		
	app.use(express.logger('dev')); 						
	app.use(express.bodyParser()); 
	app.use(express.methodOverride());

  app.use(express.cookieParser() );
  app.use(express.session({ secret: 'secretaplicacioncietiesquiz0123456789' }));
});

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
