const expect = require('chai').expect;
const db = (require('..'))();
const q = require('q');

describe('Database proxy', () => {
	it('set', () => {
		return db.set('test:key', 'value')
		.then(res => {
			expect(res).to.equal('OK');
		});
	});

	it('get', () => {
		return db.get('test:key')
		.then(res => {
			expect(res).to.equal('value');
		});
	});

	it('hset', () => {
		return q.all([
			db.hset('test:hkey', 'key1', 'value'),
			db.hset('test:hkey', 'key2', 'other value')
		])
		.spread((res1, res2) => {
			expect(res1).to.be.a('number');
			expect(res2).to.be.a('number');
		});
	});

	it('hget', () => {
		return q.all([
			db.hget('test:hkey', 'key1'),
			db.hget('test:hkey', 'key2')
		])
		.spread((res1, res2) => {
			expect(res1).to.equal('value');
			expect(res2).to.equal('other value');
		});
	});

	it('hkeys', () => {
		return db.hkeys('test:hkey')
		.then(res => {
			expect(res).to.include.members([
				'key1',
				'key1'
			]);
		});
	});

	it('hgetall', () => {
		return db.hgetall('test:hkey')
		.then(res => {
			expect(res.key1).to.equal('value');
			expect(res.key2).to.equal('other value');
		});
	});
});
