const expect = require('chai').expect;
const db = (require('..'))();

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
		return Promise.all([
			db.hset('test:hkey', 'key1', 'value'),
			db.hset('test:hkey', 'key2', 'other value')
		])
		.then(res => {
			expect(res[0]).to.be.a('number');
			expect(res[1]).to.be.a('number');
		});
	});

	it('hget', () => {
		return Promise.all([
			db.hget('test:hkey', 'key1'),
			db.hget('test:hkey', 'key2')
		])
		.then(res => {
			expect(res[0]).to.equal('value');
			expect(res[1]).to.equal('other value');
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
