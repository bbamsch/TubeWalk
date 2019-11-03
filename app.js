
/**
 * Module dependencies.
 */
require('dotenv').config();

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.set('api_key', process.env.API_KEY);

if (app.get('env') == 'development') {
  app.use('/static', express.static('static'));
}

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
