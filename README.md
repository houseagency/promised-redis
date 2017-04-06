Promised Redis
==============

Promise and RxJS wrapper for [Node Redis Client](http://redis.js.org/)

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

Subscribing on channels with RxJS
---------------------------------

```javascript
const redis = require('promised-redis');
const pub = redis();
const sub = redis();

sub.on('subscribe', () => {
  pub.publish('some-channel', '1 message');
  pub.publish('some-other-channel', '2 message');
  pub.publish('some-channel', '3 message');
});

sub.listen('some-channel')
  .take(2)
  .toArray()
  .toPromise()
  .then(messages => {
    expect(messages.length).to.equal(2);
    expect(messages[0]).to.equal('1 message');
    expect(messages[1]).to.equal('3 message');
  });
```
