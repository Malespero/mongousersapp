require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth
app.use(jwt());

// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

// start server

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;  //удобная конструкция для теста на локалхосте или для выведения в прод
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});