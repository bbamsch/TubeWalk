
/**
 * Module dependencies.
 */

const
    express = require('express')
  , routes = require('./routes')
  , http = require('http');

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.set('api_key', process.env.API_KEY);

// Only allow Express to serve static files in development mode
if (app.get('env') === 'development') {
  app.use(require('connect-livereload')());
  app.use('/static', express.static('dist'));
  app.use('/static', express.static('static'));
}

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
