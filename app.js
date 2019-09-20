var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const indexRouter = require('./routes/index');
const blogRouter = require('./routes/blog')
const userRouter = require('./routes/user')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(logger('dev'));
const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  // 开发环境 / 测试环境
  app.use(logger('dev'));
} else {
  // 线上环境
  // 获取文件路径
  const logFileName = path.join(__dirname, 'logs', 'access.log') 
  // 写入流
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a' //a:流部分方式写入
  })
  app.use(logger('combined', {
    stream: writeStream
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const redisClient = require('./db/redis')
const sessionStore = new RedisStore({
  client: redisClient
})
app.use(session({
  resave: false, //添加 resave 选项
  saveUninitialized: true, //添加 saveUninitialized 选项
  secret: 'WJiol#23123_', // 秘钥
  cookie: {
    path: '/',   // 默认配置
    httpOnly: true,  // 默认配置
    maxAge: 24 * 60 * 60 * 1000 // 24小时
    // maxAge: 1/60 * 60 * 60 * 1000 //1分钟测试
  },
  store: sessionStore // 把sesstion存储到redis
}))
app.use('/', indexRouter);
app.use('/api/blog', blogRouter)
app.use('/api/user', userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
