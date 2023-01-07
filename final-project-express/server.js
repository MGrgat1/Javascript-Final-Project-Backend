const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mysql = require('promise-mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const helmet = require('helmet');
const bcrypt = require('bcrypt');

const config = require('./config');

const pool = mysql.createPool(config.pool);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname+'/public/app'));

app.use(helmet());

app.use(function(req, res, next) {
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
     next();
     });

app.use(morgan('dev'));

//import all other modules - login.js, register.js, api.js
const loginRouter = require('./app/routes/login')(express, pool, jwt, config.secret, bcrypt);
app.use('/login', loginRouter);

const registrationRouter = require('./app/routes/register')(express, pool, jwt, config.secret, bcrypt);
app.use('/login/register', registrationRouter);

const apiRouter = require('./app/routes/api')(express, pool, jwt, config.secret, bcrypt);
app.use('/api', apiRouter);

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/index.html'));
});


app.listen(config.port);

console.log('Running on port ' + config.port);
