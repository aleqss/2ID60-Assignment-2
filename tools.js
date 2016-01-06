/* Tools helper module
 * Contains several unrelated functions and hides some of the sqlite3 database interaction
 * Author: s143364@TU/e, 2ID60 Web Technology, Assignment 2, Q2 2014–2015
 * 
 * Exports:
 * db:          sqlite3 database instance, handled by node-sqlite3 module, available on 
 *              https://github.com/mapbox/node-sqlite3/
 * debug:       boolean, shows if debug logs are enabled
 * dberr:       function, helper for outputting db access errors, as given in the argument err
 * sendErrJson: function, send the response (res) with a status code (code) and a message (msg)
 * maxprime:    integer, maximal prime in the db
 * maxid:       integer, maximal rowid in the db
 *
 * Parameters:
 * debug:       boolean, enable/disable debug logs to the console
 * db_path:     path to the database from the root of the app
 */

var sqlite = require('sqlite3').verbose();

function Tools(debug, db_path) {
    this.debug = debug;
    this.db = new sqlite.Database(__dirname + db_path, sqlite.OPEN_READWRITE, function (error) {
        if (error === null) {
            if (this.debug) console.log('Database opened successfully');
            this.db.get('SELECT MAX(rowid) FROM primes;', function (err, row) {
                if (this.dberr(err))
                    return;
                this.maxid = row['MAX(rowid)'];
            }.bind(this));
            this.db.get('SELECT MAX(prime) FROM primes;', function (err, row) {
                if (this.dberr(err))
                    return;
                this.maxprime = row['MAX(prime)'];
            }.bind(this));
        }
        else
            if (this.debug) console.log('ERROR opening database!' + error);
    }.bind(this));
}

Tools.prototype.dberr = function (err) {
    if (err !== null) {
        if (this.debug)
            console.log('Database request failed! ' + err);
        return true;
    }
    return false;
};

Tools.prototype.sendErrJson = function (res, code, msg) {
    res.status(code).json({error: msg});
};

module.exports = Tools;
