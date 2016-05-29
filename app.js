var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var passport = require('passport');
var sessionstore = require('sessionstore');

var flash = require('connect-flash');

var cfg = require('./routes/config');
    cfg.init();

var routes = require('./routes/routes');
var cms = require('./routes/cms');
var passportRoute = require('./routes/passport');
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
    prefix:  '/css' 
}));

app.use(sassMiddleware({
    /* Options */
    src: __dirname +'/sass_cms',
    dest: path.join(__dirname, 'public') + "/css/cms",
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css/cms'  
}));

app.use(session({
    secret: 'a4f8771f-c823-1234-8tt2',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto' },
    store: sessionstore.createSessionStore({
        type: 'elasticsearch',
        host: 'localhost:9200',    // optional
        prefix: '',                // optional
        index: 'cms',          // optional
        typeName: 'session',       // optional
        pingInterval: 1000,        // optional
        timeout: 10000             // optional
    })
}));

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

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotchyeah' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


//ROUTES
app.use('/', routes);
app.use('/', passportRoute);
app.use('/', cms);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Start the server
var port = process.env.PORT || 3030;
var server = app.listen(port)
console.log("CMS is listening on port: " + port)

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
