var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mwymiRouter = require('./routes/mwymi');
var twitterRouter = require('./routes/twitter');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var recordingRouter = require('./routes/recording');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/mwymi', mwymiRouter);
app.use('/twitter', twitterRouter);
app.use('/record', recordingRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// For ChessChamps or anything that requires verification, write some Middleware!


module.exports = app;
