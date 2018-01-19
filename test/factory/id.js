'use strict';

const { expect } = require('chai');

const { IdFactory: described_class } = require('factory/id');

const id_class = class {
	static generate() { return new this(`id_${Date.now()}`) }
	static MIN() { return new this('\x00') }
	static MAX() { return new this('\xFF') }
	constructor(value) { this._bytes = value }
	get bytes() { return this._bytes }
};

const factory = new described_class({
	id: id_class,
	canonical_coder: {
		encode: (bytes) => `canonical ${bytes}`,
		encodeTrusted: (bytes) => `canonical ${bytes}`,
		decode: (str) => str.replace(/^canonical(?:_distrusted)? /, ''),
		decodeTrusted: (str) => str.replace(/^canonical /, ''),
	},
	raw_coder: {
		encode: (bytes) => `raw ${bytes}`,
		encodeTrusted: (bytes) => `raw ${bytes}`,
		decode: (str) => str.replace(/^raw(?:_distrusted)? /, ''),
		decodeTrusted: (str) => str.replace(/^raw /, ''),
	},
});


function assertInjectsInstanceMethods(generator) {
	[
		'toCanonical',
		'toRaw',
	].forEach((injected_function) => {
		describe(injected_function, function() {
			it(`is injected into the instance using encodeTrusted`, function() {
				const id = generator();

				expect(() => id[injected_function]()).not.to.throw();
				expect(id[injected_function]()).to.equal(factory[injected_function](id));
			});

			it('is only injected into the instance', function() {
				const id = generator();

				expect(new id_class()[injected_function]).to.be.undefined;
			});
		})
	});
}

describe(described_class.name, function() {
	describe('#generate', function() {
		const subject = () => factory.generate();

		it(`returns an id`, function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		it('always returns a different object', function() {
			expect(subject()).not.to.equal(subject());
		});

		assertInjectsInstanceMethods(subject);
	});

	describe('#MIN', function() {
		const subject = () => factory.MIN();

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		it('always returns the same object', function() {
			expect(subject()).to.equal(subject());
		});

		assertInjectsInstanceMethods(subject);
	});

	describe('#MAX', function() {
		const subject = () => factory.MAX();

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		it('always returns the same object', function() {
			expect(subject()).to.equal(subject());
		});

		assertInjectsInstanceMethods(subject);
	});

	describe('#fromCanonical', function() {
		const subject = () => factory.fromCanonical('canonical_distrusted some_id');

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		assertInjectsInstanceMethods(subject);
	});

	describe('#fromCanonicalTrusted', function() {
		const subject = () => factory.fromCanonicalTrusted('canonical some_id');

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		assertInjectsInstanceMethods(subject);
	});

	describe('#fromRaw', function() {
		const subject = () => factory.fromRaw('raw_distrusted some_id');

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		assertInjectsInstanceMethods(subject);
	});

	describe('#fromRawTrusted', function() {
		const subject = () => factory.fromRawTrusted('raw some_id');

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		assertInjectsInstanceMethods(subject);
	});

	describe('#toCanonical', function() {
		const subject = () => factory.toCanonical(factory.generate());

		it('canonical encodes the bytes of the id', function() {
			expect(subject()).to.match(/^canonical id_\d+$/);
		});
	});

	describe('#toRaw', function() {
		const subject = () => factory.toRaw(factory.generate());

		it('raw encodes the bytes of the id', function() {
			expect(subject()).to.match(/^raw id_\d+$/);
		});
	});
});

