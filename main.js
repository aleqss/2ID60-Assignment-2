/* Entry point for the application
 * API is available on /api/nthprime and /api/factorise.
 * More information can be found in API documentation.
 * This app uses express and sqlite3 node.js modules.
 * The website is served as static content from ./client folder.
 * DEBUG flag enables/disables debug output to the console.
 * The application runs on port 9973, the largest prime number below 10,000.
 * For more explanations check the API docs and README file.
 * Author: s143364@TU/e, 2ID60 Web Technology, Assignment 2, Q2 2014–2015
 */

var DEBUG = false;

var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');

var app = express();

var Tools = require('./tools.js');
var NthPrime = require('./nthprime.js');
var Factoriser = require('./factorise.js');

var tools = new Tools(DEBUG, '/data/primes.db');
var nthprime = new NthPrime(tools);
var factoriser = new Factoriser(tools);

app.use(compression());
app.use(favicon(__dirname + '/client/favicon.ico'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Because Javascript is weird
app.get('/api/nthprime', function (req, res) {
    nthprime.find(req, res);
}.bind(nthprime));
app.get('/api/factorise', function (req, res) {
    factoriser.factorise(req, res);
}.bind(factoriser));

app.use('/', express.static(__dirname + '/client'));

app.use(function (req, res) {
    res.status(404);
    res.format({
        'text/html': function() {
            res.sendFile(__dirname + '/client/404.html');
        },
        'application/json': function() {
            res.json({"error":"Cannot find the requested page."});
        },
        'default': function() {
            res.send("404 File not found");
        }
    });
});

var server = app.listen(9973);
