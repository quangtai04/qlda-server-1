var createError = require("http-errors");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const port = 3002;
// var logger = require('morgan');

// kết nối databse
require("./src/loaders/database")();

// tạo các thư mục cần thiết
// require('./loaders/mkdirs')();

var app = express();
// app.use(logger('dev'));

// cài đặt cors
var cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3001",
    methods: "GET,POST,OPTIONS,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,x-access-token,x-requested-with",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// cài đặt router
require("./src/routers")(app);
var server = require("http").Server(app);
var io = require("./src/loaders/socket")(server);
app.set("io", io);
app.set("port", port);
console.log("Server is running at -> http://localhost:" + port);
server.listen(port);

// app.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });
module.exports = app;

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// handle error
// require('./loaders/handleError')(app);

// var app = express();

// // view engine setup

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
