Promised Redis
==============

Q promise wrapper for [Node Redis Client](http://redis.js.org/)

Depends on node v6

Install
-------

`npm install --save redis promised-redis`

Featured Redis client functions
-------------------------------

Everything. It's proxying the Redis client.

Basic usage
-----------

```javascript
// Initiate a Redis connection
const redis = require('promised-redis');
// If no connection options are passed, connection will default to localhost
// or use REDIS_HOST, REDIS_PORT and REDIS_DB environment variables.
const database = redis({
    host: '127.0.0.1',
    port: 6379,
    db: 0
});
// or if your options comes from a promise
const database = redis(some_promise_that_resolves_an_options_object);

// Execute some Redis commands
database.get('some-key')
.then(value => {
    //
});
```
