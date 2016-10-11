const redis = require('..');
const expect = require('chai').expect;
const q = require('q');

describe('Database connection', () => {
	it('with defaults', () => {
		return redis().connection.then(client => {
			expect(client.options.host)
			.to.equal('127.0.0.1');
			expect(client.options.port)
			.to.equal('6379');
			expect(client.options.db)
			.to.equal('0');
		});
	});

	it('with plain options object', () => {
		return redis({
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
		return redis(q({
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
});
