const expect = require('chai').expect;
const redis = require('redis');
const wrapper = require('..');

describe('Database connection', () => {
	it('with defaults', () => {
		return wrapper().connection.then(client => {
			expect(client.options.host)
			.to.equal('127.0.0.1');
			expect(client.options.port)
			.to.equal('6379');
			expect(client.options.db)
			.to.equal('0');
		});
	});

	it('with plain options object', () => {
		return wrapper({
			host: 'localhost',
			port: 6379,
			db: 0
		}).connection.then(client => {
			expect(client.options.host)
			.to.equal('localhost');
			expect(client.options.port)
			.to.equal(6379);
			expect(client.options.db)
			.to.equal(0);
		});
	});

	it('with options within a promise', () => {
		return wrapper(Promise.resolve({
			host: 'localhost',
			port: 6379,
			db: 0
		})).connection.then(client => {
			expect(client.options.host)
			.to.equal('localhost');
			expect(client.options.port)
			.to.equal(6379);
			expect(client.options.db)
			.to.equal(0);
		});
	});

	it('with failing connection', () => {
		const server = {};
		const _createClient = redis.createClient;

		redis.createClient = function () {
			return server;
		};

		server.on = function (event, callback) {
			if (event === 'error') {
				callback(new Error('Some error'));
			}
		};

		return wrapper()
			.connection
			.then(() => {
				throw new Error('Should not happen!');
			})
			.catch(err => {
				redis.createClient = _createClient;
				expect(err.message).to.equal('Some error');
			});
	});
});
