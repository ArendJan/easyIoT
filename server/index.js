const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sql = require('./conn/sql');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const settings = require('./settings');
const webpush = require('web-push');
const publicVapidKey = '<EDIT!!>';
const privateVapidKey = '<EDIT!!>';

//setting vapid keys details
webpush.setVapidDetails('mailto:<EDIT!!>', publicVapidKey,privateVapidKey);

const ash = require('express-async-handler');

const app = express();

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const session = require('express-session');
app.use(cors({ credentials: true, origin: settings.serverURL }));

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool: sql.conn
  }),
  secret: 'test123f',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  // Insert express-session options here
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(ash(async (req, res, next) => {
  console.log('start', req.originalUrl);
  next();
}));

app.use('/push', require('./routes/push'));
app.use('/get', require('./routes/get'));
app.use('/api', require('./routes/api'));

app.use(history({
  verbose: true
}));
app.use(express.static(path.join(__dirname, 'public')));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
