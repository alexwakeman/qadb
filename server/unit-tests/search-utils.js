/*
 Tests to validate backend data structure, efficiency of search.

 Initially search looks for union of word matches, ranks these highly

 Then amongst single word matches, rank according to word count across data set

 Also looks for synonyms in word matches - and extracts accordingly - ranking them

 Must ignore self-referential synonyms - where a synonym is also an input word
 */

var expect = require('chai').expect;
var sinon = require('sinon');
var mongo = require('mongodb');
var ObjectId = mongo.ObjectID;
var searchUtils,
	modLib = {},
	_this = this;

const errorMsg = 'No records found';

function setupUnionResults() {
	var match1ObjId = new ObjectId();
	var match2ObjId = new ObjectId();
	var term1 = 'match1', term2 = 'match2';
	_this.contentIds = [
		new ObjectId("5774752c998e45c364e44ee4"),
		new ObjectId("577475b8998e45c364e45191"),
		new ObjectId(),
		new ObjectId()
	];
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: term1})
		.returns(Promise.resolve(new Promise((resolve, reject) => {
			resolve({
				"_id": match1ObjId,
				"word": term1,
				"count": 6,
				"content_refs": [_this.contentIds[0], _this.contentIds[1], _this.contentIds[2]],
				"synonyms": {
					"example": {
						"word": "example",
						"references": [
							_this.contentIds[2] // this means the second result should be this synonym reference (third entry)
						],
						"count": 1
					}
				}
			})
		})));
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: term2})
		.returns(new Promise((resolve, reject) => {
			resolve({
				"_id": match2ObjId,
				"word": term2,
				"count": 10,
				"content_refs": [_this.contentIds[0], _this.contentIds[3]]
			})
		}));
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: ''})
		.returns(new Promise((resolve, reject) => {
			reject(new Error(errorMsg));
		}));
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: 'nonmatchedword'})
		.returns(new Promise((resolve, reject) => {
			reject(new Error(errorMsg));
		}));
	modLib.db.asyncFindOneByObject.withArgs('content', {_id: _this.contentIds[0].toString()})
		.returns(new Promise((resolve, reject) => {
			resolve({
				_id: _this.contentIds[0],
				question: "Example question 1?",
				answer: "Some answer 1",
				likes: 10,
				dislikes: 5,
				wordbag: ['example', 'question'],
				urls:['http://example.com/question']
			})
		}));
	modLib.db.asyncFindOneByObject.withArgs('content', {_id: _this.contentIds[1].toString()})
		.returns(new Promise((resolve, reject) => {
			resolve({
				_id: _this.contentIds[1],
				question: "Example question 2?",
				answer: "Some answer 2",
				likes: 4,
				dislikes: 2,
				wordbag: ['example', 'question'],
				urls:['http://example.com/question']
			})
		}));
	modLib.db.asyncFindOneByObject.withArgs('content', {_id: _this.contentIds[2].toString()})
		.returns(new Promise((resolve, reject) => {
			resolve({
				_id: _this.contentIds[2],
				question: "Example question 3?",
				answer: "Some answer 3",
				likes: 8,
				dislikes: 5,
				wordbag: ['example', 'question'],
				urls:['http://example.com/question']
			})
		}));
	modLib.db.asyncFindOneByObject.withArgs('content', {_id: _this.contentIds[3].toString()})
		.returns(new Promise((resolve, reject) => {
			resolve({
				_id: _this.contentIds[3],
				question: "Example question 4?",
				answer: "Some answer 4",
				likes: 1,
				dislikes: 5,
				wordbag: ['example', 'question'],
				urls:['http://example.com/question']
			})
		}));
}

describe('search-utils', function () {
	describe('performSearch', function () {

		beforeEach(function () {
			modLib.db = {
				asyncFindOneByObject: sinon.stub()
			};
			searchUtils = require('../utils/search-utils')(modLib);
		});

		it('should return a set of Q&A results that contains a union of two matched words first, followed by synonym unions', function () {
			var input = 'match1 match2';
			setupUnionResults();
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[0]._id.toString()).to.equal(_this.contentIds[0].toString()) &&
						expect(results.data.qaResults[1]._id.toString()).to.equal(_this.contentIds[2].toString());
				});
		});
		it('should return a synonym result as higher priority than single word match', function () {
			var input = 'match1 match2';
			setupUnionResults();
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[1]._id.toString()).to.equal(_this.contentIds[2].toString()) &&
						expect(results.data.qaResults[3]._id.toString()).to.equal(_this.contentIds[3].toString());
				});
		});
		it('should rank single word or synonym matches according to word count', function () {
			var input = 'match1 match2';
			setupUnionResults();
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[2]._id.toString()).to.equal(_this.contentIds[1].toString());
				});
		});
		it('should return an empty results list with no text given', function () {
			var input = '';
			setupUnionResults();
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results).to.not.be.ok;
				}, (error) => {
					return expect(error).to.be.ok && expect(error.message).to.equal(errorMsg);
				});
		});
		it('should return an empty results list with no matches available', function () {
			var input = 'nonmatchedword';
			setupUnionResults();
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results).to.not.be.ok;
				}, (error) => {
					return expect(error.message).to.be.ok && expect(error.message).to.equal(errorMsg);
				});
		});
		it('should lookup synonyms in word_index if results are limited, and apply content refs', function () {
			var input = 'match';
			setupUnionResults();
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results).to.not.be.ok;
				}, (error) => {
					return expect(error.message).to.be.ok && expect(error.message).to.equal(errorMsg);
				});
		});
		it('should use word_bag words for further results if results are still lacking, fetch word_index content refs', function () {
			var input = 'match';
			setupUnionResults();
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results).to.not.be.ok;
				}, (error) => {
					return expect(error.message).to.be.ok && expect(error.message).to.equal(errorMsg);
				});
		});
	});

	describe('suggest', function () {
		xit('should fetch at most 5 questions that match this given input', function () {
			return expect(false).to.be.ok;
		});
		xit('should return an empty array if no matches questions match given input', function () {
			return expect(false).to.be.ok;
		});
	});
});

