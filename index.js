const redis = require('redis');
const rx = require('rxjs');

/**
 * Minified Redis client wrapper class that handles the connection and
 * provides it within a promise.
 */
class Client {
	/**
	 * Constructs by setting connection options and initiates a connection
	 *
	 * @param {object} options Cassandra driver connection options
	 *
	 * @returns {void}
	 */
	constructor(options) {
		this.connect(options);
	}

	/**
	 * Gets the Redis client connection options.
	 *
	 * If not defined, it'll default to environment variable
	 * REDIS_HOST if defined, otherwise 127.0.0.1
	 *
	 * @returns {object} Redis client connection options
	 */
	get options() {
		if (this._options) {
			return this._options;
		}

		return {
			host: process.env.REDIS_HOST || '127.0.0.1',
			port: process.env.REDIS_PORT || '6379',
			db: process.env.REDIS_DB || '0'
		};
	}

	/**
	 * Gets a connection promise
	 *
	 * If there's no promise already in memory, it'll create one,
	 * store it and return it.
	 *
	 * @returns {object} Redis client within a promise
	 */
	get connection() {
		if (this._connection) {
			return this._connection;
		}

		return this._connection = Promise.resolve(this.options)
		.then(options => redis.createClient(options))
		.then(client => this.setupClient(client));
	}

	/**
	 * Initiates a Redis client instance by setting connection options
	 * and return connection promise.
	 *
	 * @param {object} options Redis client connection options
	 *
	 * @returns {object} Redis client within a promise
	 */
	connect(options) {
		this._options = options;

		return this.connection;
	}

	/**
	 * Setup redis client with listeners for readyness and error
	 *
	 * @param {object} client Redis client
	 *
	 * @returns {object} Redis client within a promise
	 */
	setupClient(client) {
		return new Promise((resolve, reject) => {
			client.on('error', reject);
			client.on('ready', () => resolve(client));
		});
	}

	/**
	 * Listens on a given channel
	 *
	 * @param {string} channel Channel to listen on.
	 *
	 * @returns {object} ReactiveX Observable
	 */
	listen(channel) {
		return rx.Observable.fromPromise(this.connection)
			.flatMap(client => {
				client.subscribe(channel);

				return rx.Observable.fromEvent(
					client,
					'message',
					(channel, message) => message
				);
			});
	}
}

/**
 * A proxy getter that returns properties in client connection wrapper
 * object in first hand otherwise through the connection promise.
 *
 * @param {object} client Redis client connection wrapper
 * @param {string} property Property name
 *
 * @returns {object} Either some property in client wrapper otherwise
 * through connection promise
 */
function getter(client, property) {
	const value = client[property];

	if (value) {
		return value;
	}

	return proxy.bind(client, client.connection, property);
}

/**
 * Redis callback with binded promise resolvers.
 *
 * @param {function} resolve Promise resolver
 * @param {function} reject Promise rejection
 * @param {object} err Redis error
 * @param {object} data Redis data
 *
 * @returns {void}
 */
function callback(resolve, reject, err, data) {
	if (err) {
		return reject(err);
	}

	return resolve(data);
}

/**
 * Takes the connection promise and invokes function at the resolved
 * objected with arguments
 *
 * @param {object} connection Connection promise
 * @param {string} func Function name
 * @param {...object} args Arguments passed to function
 *
 * @returns {object} Whatever the resolved function returns
 */
function proxy(connection, func, ...args) {
	return connection.then(client => new Promise((resolve, reject) =>
		client[func].apply(client, args.concat(
			callback.bind(client, resolve, reject)
		))
	));
}

/**
 * Sets up the client connection wrapper with proxy
 *
 * @param {object} options Redis client connection options
 *
 * @returns {object} Redis client connection wrapper
 */
function setup(options) {
	return new Proxy(new Client(options), {
		get: getter
	});
}

module.exports = setup;
