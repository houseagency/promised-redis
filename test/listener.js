const expect = require('chai').expect;
const redis = require('..');

describe('Pub/sub listener', () => {
	it('listens on some-channel', () => {
		const pub = redis();
		const sub = redis();

		sub.on('subscribe', () => {
			pub.publish('some-channel', '1 message');
			pub.publish('some-other-channel', '2 message');
			pub.publish('some-channel', '3 message');
		});

		return sub.listen('some-channel')
			.take(2)
			.toArray()
			.toPromise()
			.then(messages => {
				expect(messages.length).to.equal(2);
				expect(messages[0]).to.equal('1 message');
				expect(messages[1]).to.equal('3 message');
			});
	});
});
