const _ = require('lodash');
const redis = require('redis');
const q = require('q');

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

		return this._connection = q(this.options)
		.then(options => redis.createClient(options));
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

	return _.wrap(property, _.wrap(client.connection, proxy));
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
	return connection.then(client => {
		return q.npost(client, func, args);
	});
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
