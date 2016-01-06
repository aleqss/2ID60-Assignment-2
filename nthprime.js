/* NthPrimeFinder module
 * Contains the code that processes the requests to find the n-th prime, with n between 1 and 
 * 50,000,000
 * Author: s143364@TU/e, 2ID60 Web Technology, Assignment 2, Q2 2014–2015
 *
 * Exports:
 * tools: an instance of Tools as defined in tools.js
 * find:  function, takes the request and response objects, finds the n-th prime in the tools.db, 
 *        and sends it back to the user in JSON format. The expected request and response format 
 *        are described in detail in the API documentation.
 *
 * Parameters:
 * tools: a valid instance of Tools class, defined in tools.js
 */

function NthPrimeFinder(tools) {
    this.tools = tools;
}

NthPrimeFinder.prototype.find = function (req, res) {
    if (req.query.n === undefined || !/\d+/.test(req.query.n) || parseInt(req.query.n) <= 0 || 
        parseInt(req.query.n) > this.tools.maxid) {
        this.tools.sendErrJson(res, 400, 'N for nth prime incorrect or missing.');
        return;
    }
    this.tools.db.get('SELECT prime FROM primes WHERE rowid = ?;', req.query.n, function (err, row) {
        if (this.tools.dberr(err)) {
            this.tools.sendErrJson(res, 500, 'Sorry, you request could not be processed. Try again later.');
            return;
        }
        res.json({n: parseInt(req.query.n), prime: row.prime});
    }.bind(this));
};

module.exports = NthPrimeFinder;
