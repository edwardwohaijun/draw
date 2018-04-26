let express = require('express');
let http = require('http');
let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let sysConfig = require('./config/systemConfig')();

let app = express();
app.disable('x-powered-by');

// if you don't know what helmet and contentSecurity is, comment out the following block, or take some time learning
let helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  browserSniff: false,
  setAllHeaders: false,
  directives:{
    defaultSrc: ["'self'"],
    childSrc: ["'none'"],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'blob:', "https://cdn.jsdelivr.net",  "http://cdn.jsdelivr.net"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", `wss://${sysConfig.hostname}:${sysConfig.port}`, `ws://${sysConfig.hostname}:${sysConfig.port}`,
      `wss://127.0.0.1:${sysConfig.port}`, `ws://127.0.0.1:${sysConfig.port}`],
  }
}));
app.use(helmet.xssFilter());

if (app.get('env') === 'production') {
  app.use(logger('combined'))
} else {
  app.use(logger('dev'))
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

let server = http.createServer(app);
app.use('/draw/public', express.static(path.join(__dirname, 'public')));
server.listen(3001);
console.log('server started on port: 3001');

let io = require('socket.io')(server, {'pingInterval': 25000, 'pingTimeout': 60000, path: '/draw/socket.io'});
io.set('transports', ['websocket']);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./routes/index')(app);
require('./utils/socketEvents').socketEvents(io);

app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  res.status(err.status || 500);
  res.render('error', { error: err })
});

module.exports = app;
