// Global switches
var NTHPRIME = 1;
var FACTORISE = 2;
var SERVER = '2id60.win.tue.nl';
var PORT = 9973;

// Display the results for each API
var displayResults = function (API, data) {
    if (API === NTHPRIME) {
        if (data.error !== undefined) {
            console.log(data.error);
            return;
        }
        $('#nResN').text(data.n);
        $('#nResPrime').text(data.prime);
        $('#nthPrimeForm').hide();
        $('#nthPrompt').hide();
        $('#nthPrimeResults').show();
    }
    else if (API === FACTORISE) {
        if (data.error !== undefined) {
            console.log(data.error);
            return;
        }
        if (data.isPrime) {
            $('#factResText').text('The number ' + data.n + ' is a prime!');
        }
        else {
            $('#factResText').html('The number ' + data.n + 
                ' is a composite with the following prime factors:<br/>' + data.n + ' = ');
            $.each(data.factors, function(index, value) {
                $('#factResText').append(value.factor + '<sup>' + value.count + '</sup>' + 
                    ' &times; ');
            });
            // Delete the last ' &times; '
            $('#factResText').html($('#factResText').html().slice(0, -3));
        }
        $('#factoriseForm').hide();
        $('#factorisePrompt').hide();
        $('#factoriseResults').show();
    }
    else {
        console.log('What API is that? Arguments to displayResults: ' + API + ' ' + data);
    }
};

// Fetch nth prime from API
var fetchNthPrime = function(n) {
    var url = 'http://' + SERVER + ':' + PORT + '/api/nthprime?n=' + n;
    $.getJSON(url, function(data) {
        displayResults(NTHPRIME, data);
    }).fail(function() {
        console.log('Error: could not fetch the n-th prime for n equal ' + n);
    });
};

// Fetch prime factors from API
var fetchFactorisation = function(n) {
    var url = 'http://' + SERVER + ':' + PORT + '/api/factorise?mode=short&integer=' + n;
    $.getJSON(url, function(data) {
        displayResults(FACTORISE, data);
    }).fail(function() {
        console.log('Error: could not fetch the prime factorisation for n equal ' + n);
    });
};

// Can only contain digits, and at least one of them
var validateNaturalInput = function(input) {
    return /^[0-9]+$/.test(input);
};

// Red outline and error message on wrong input
var validateNInput = function() {
    var input = $('#inputN').val();
    if (validateNaturalInput(input.trim()) && parseInt(input) > 0 && parseInt(input) <= 50000000) {
        $('#inputN').parent().removeClass('has-error');
        $('#wrongNInput').hide();
        return true;
    }
    $('#inputN').parent().addClass('has-error');
    $('#wrongNInput').show();
    return false;
};

// Red outline and error message on wrong input
var validateFactorInput = function() {
    var input = $('#inputComposite').val();
    if (validateNaturalInput(input.trim()) && parseInt(input) > 1 && parseInt(input) <= 1964903306) {
        $('#inputComposite').parent().removeClass('has-error');
        $('#wrongFactInput').hide();
        return true;
    }
    $('#inputComposite').parent().addClass('has-error');
    $('#wrongFactInput').show();
    return false;
};

var nthPrime = function() {
    if (!validateNInput())
        return;
    fetchNthPrime(parseInt($('#inputN').val()));
};

var factorise = function() {
    if (!validateFactorInput())
        return;
    fetchFactorisation(parseInt($('#inputComposite').val()));
};

var showNthPrimeForm = function() {
    $('#inputN').val('');
    $('#nthPrimeResults').hide();
    $('#nthPrimeForm').show();
    $('#nthPrompt').show();
};

var showFactorForm = function() {
    $('#inputComposite').val('');
    $('#factoriseResults').hide();
    $('#factoriseForm').show();
    $('#factorisePrompt').show();
};

var main = function() {
    $('#inputN').on('focusout', validateNInput);
    $('#inputComposite').on('focusout', validateFactorInput);
    $('#findNPrime').click(nthPrime);
    $('#findFactors').click(factorise);
    $('#restoreNthPrime').click(showNthPrimeForm);
    $('#restoreFactorisation').click(showFactorForm);
    $('#nthPrimeForm').submit(function (ev) {
        ev.preventDefault();
        $('#findNPrime').trigger('click');
    });
    $('#factoriseForm').submit(function (ev) {
        ev.preventDefault();
        $('#findFactors').trigger('click');
    });
};

$(document).ready(main);
