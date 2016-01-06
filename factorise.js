/* Factoriser module
 * Handles requests to factorise an integer
 * Author: s143364@TU/e, 2ID60 Web Technology, Assignment 2, Q2 2014–2015
 *
 * Exports:
 * tools:       an instance of a Tools class, as defined in tools.js
 * sendFactors: function, helper, used to send the response. Not to be used directly.
 * findFactors: function, gets called recursively to factorise the number if direct look-up fails.
 *              Not to be used directly.
 * factorise:   function, uses the database to find the prime factors of a number. Precise request
 *              and response formats are given in the API documentation.
 *
 * Parameters:
 * tools:       a valid instance of Tools class
 */

var FULL = 1;
var SHORT = 2;

function Factoriser(tools) {
    this.tools = tools;
}

Factoriser.prototype.sendFactors = function (res, num, factors, mode) {
    var insert = [];
    insert[0] = {factor: factors[0], count: 1};
    var j = 0;
    for (var i = 1; i < factors.length; i++) {
        if (factors[i] === factors[i - 1]) {
            insert[j].count++;
            continue;
        }
        j++;
        insert[j] = {factor: factors[i], count: 1};
    }
    for (var i = 0; i < insert.length; i++) {
        this.tools.db.run('INSERT INTO composites VALUES (?, ?, ?);', num, insert[i].factor, 
            insert[i].count, function (err) {
            this.tools.dberr(err);
        }.bind(this));
    }    
    if (mode === FULL)
        res.json({n: num, isPrime: false, factors: factors});
    else
        res.json({n: num, isPrime: false, factors: insert});
};

Factoriser.prototype.findFactors = function (num, n, j, factors, res, mode) {
    if (n === 1) {
        this.sendFactors(res, num, factors, mode);
        return;
    }
    this.tools.db.get('SELECT prime FROM primes WHERE prime = ?;', n, function (err, row) {
        if (this.tools.dberr(err)) {
            this.tools.sendErrJson(res, 500, 'Sorry, you request could not be processed. Try \
                again later.');
            return;
        }
        if (row !== undefined) {
            factors[factors.length] = n;
            this.sendFactors(res, num, factors, mode);
            return;
        }
        this.tools.db.all('SELECT prime FROM primes WHERE prime BETWEEN ? AND ?;', j * 10000, 
            (j + 1) * 10000, function (err, rows) {
            if (this.tools.dberr(err)) {
                this.tools.sendErrJson(res, 500, 'Sorry, you request could not be processed. Try \
                    again later.');
                return;
            }
            for (var i = 0; i < rows.length; i++) {
                if (n % rows[i].prime === 0) {
                    n /= rows[i].prime;
                    factors[factors.length] = rows[i].prime;
                    this.findFactors(num, n, j, factors, res, mode);
                    return;
                }
            }
            this.findFactors(num, n, j + 1, factors, res, mode);
        }.bind(this));
    }.bind(this));
};

Factoriser.prototype.factorise = function (req, res) {
    if (req.query.integer === undefined || !/\d+/.test(req.query.integer) || 
        parseInt(req.query.integer) <= 1 || 
        parseInt(req.query.integer) > 2 * this.tools.maxprime) {
        this.tools.sendErrJson(res, 400, 'Integer for prime factorisation incorrect or missing.');
        return;
    }
    var mode = FULL;
    if (req.query.mode !== undefined) {
        if (req.query.mode === 'full')
            mode = FULL;
        else if (req.query.mode === 'short')
            mode = SHORT;
    }
    var n = parseInt(req.query.integer);
    this.tools.db.get('SELECT rowid FROM primes WHERE prime = ?;', n, function (err, row) {
        if (this.tools.dberr(err)) {
            this.tools.sendErrJson(res, 500, 'Sorry, your request could not be processed. Try \
                again later.');
            return;
        }
        if (row !== undefined) {
            if (mode === FULL)
                res.json({n: n, isPrime: true, factors: [n]});
            else
                res.json({n: n, isPrime: true, factors: [{factor: n, count: 1}]});
            return;
        }
        this.tools.db.all('SELECT * FROM composites WHERE composite = ?;', n, function (err, rows) {
            if (this.tools.dberr(err)) {
                this.tools.sendErrJson(res, 500, 'Sorry, your request could not be processed. Try \
                    again later.');
                return;
            }
            if (rows.length > 0) {
                var factors = [];
                var j = 0;
                if (mode === FULL) {
                    for (var i = 0; i < rows.length; i++) {
                        for (var k = 0; k < rows[i].count; k++) {
                            factors[j] = rows[i].divisor;
                            j++;
                        }
                    }
                }
                else {
                    for (var i = 0; i < rows.length; i++) {
                        factors[i] = {factor: rows[i].divisor, count: rows[i].count};
                    }
                }
                res.json({n: n, isPrime: false, factors: factors});
                return;
            }
            this.findFactors(n, n, 0, [], res, mode);
        }.bind(this));
    }.bind(this));
};

module.exports = Factoriser;
