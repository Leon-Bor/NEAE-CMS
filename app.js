var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var cfg = require('./routes/config');

var routes = require('./routes/routes');
var cms = require('./routes/cms');
var ES = require('./routes/elasticsearch');

//Init cms with some data for first start
var cmsbuilder = require("./routes/cmsbuilder");
    cmsbuilder.init();

var app = express();

app.use(sassMiddleware({
    /* Options */
    src: __dirname +'/sass',
    dest: path.join(__dirname, 'public') + "/css",
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

app.use(sassMiddleware({
    /* Options */
    src: __dirname +'/sass_cms',
    dest: path.join(__dirname, 'public') + "/css/cms",
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css/cms'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

var port = process.env.PORT || 3030;
var server = app.listen(port)
console.log("CMS is listening on port: " + port)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/ace-builds')));

app.use('/', routes);
app.use('/', cms);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
