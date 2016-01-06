# Prime factorisation as a service
This project consists of a Node.js back end with an SQLite database and a simple REST API and a jQuery + Bootstrap front end.
The API docs can be found on the website itself.
It is hosted at:
```
http://2id60.win.tue.nl:9973
```
## To install:
1. Clone the repository
2. Create a new sqlite3 database using the command given below
3. Add the list of primes obtained through primes.sh to that database
4. Run `npm install` inside the web directory
5. Run `node web` outside the web directory

## Implementation notes
### Database schema:
```
CREATE TABLE primes(prime INTEGER UNIQUE NOT NULL);
CREATE TABLE composites(composite INTEGER NOT NULL,
                        divisor INTEGER NOT NULL REFERENCES primes(prime),
                        count INTEGER,
                        UNIQUE(composite, divisor));
```

### Database explained
The primes table contains first 50 million primes, ordered. They can be found by rowid or prime 
attribute. The composites table gets filled dynamically, with the factors of each requested 
composite. This imitates simple cache, and needs to be cleared manually or using a bash script 
every once in a while, depending on the intensity of the service usage.

API docs are available on the client website.
Each of the files is sufficiently documented with the details.

### N-th prime API
NthPrime finds the prime by rowid.

### Factorisation API
Factoriser first checks if its argument (N) is a prime, then checks if it was already factorised
(composites table), then factorises it using trial division, with some minor improvements, and 
stores the resulting factorisation in the composites table for future reference.
