/*
 Tests to validate backend data structure, efficiency of search.

 Initially search looks for union of word matches, ranks these highly

 Then amongst single word matches, rank according to word count across data set

 Also looks for synonyms in word matches - and extracts accordingly - ranking them
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
	var synWordObjId = new ObjectId();
	var wordBagWordObjId = new ObjectId();
	_this.contentIds = [
		new ObjectId(),
		new ObjectId(),
		new ObjectId(),
		new ObjectId(),
		new ObjectId(),
		new ObjectId()
	];
	modLib.db = {
		asyncFindOneByObject: sinon.stub()
	};
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: 'match1'})
		.returns(Promise.resolve(new Promise((resolve, reject) => {
			resolve({
				"_id": match1ObjId,
				"word": 'match1',
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
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: 'match2'})
		.returns(new Promise((resolve, reject) => {
			resolve({
				"_id": match2ObjId,
				"word": 'match2',
				"count": 10,
				"content_refs": [_this.contentIds[0], _this.contentIds[3]]
			})
		}));
	/* The synonym word entry */
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: 'example'})
		.returns(new Promise((resolve, reject) => {
			resolve({
				"_id": synWordObjId,
				"word": 'example',
				"count": 3,
				"content_refs": [_this.contentIds[0], _this.contentIds[4]]
			})
		}));
	/* The word_bag word entry */
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: 'question'})
		.returns(new Promise((resolve, reject) => {
			resolve({
				"_id": wordBagWordObjId,
				"word": 'question',
				"count": 9,
				"content_refs": [_this.contentIds[5]]
			})
		}));
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: ''})
		.returns(new Promise((resolve, reject) => {
			resolve(null);
		}));
	modLib.db.asyncFindOneByObject.withArgs('word_index', {word: 'nonmatchedword'})
		.returns(new Promise((resolve, reject) => {
			resolve(null);
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
				urls: ['http://example.com/question']
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
				urls: ['http://example.com/question']
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
				urls: ['http://example.com/question']
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
				urls: ['http://example.com/question']
			})
		}));
	modLib.db.asyncFindOneByObject.withArgs('content', {_id: _this.contentIds[4].toString()})
		.returns(new Promise((resolve, reject) => {
			resolve({
				_id: _this.contentIds[4],
				question: "Synonym referenced content? - 5",
				answer: "Synonym ref'd content - 5",
				likes: 12,
				dislikes: 5,
				wordbag: ['example', 'question'],
				urls: ['http://example.com/question']
			})
		}));
	modLib.db.asyncFindOneByObject.withArgs('content', {_id: _this.contentIds[5].toString()})
		.returns(new Promise((resolve, reject) => {
			resolve({
				_id: _this.contentIds[5],
				question: "Word bag content lookup? - 6",
				answer: "Word bag content lookup - 6",
				likes: 4,
				dislikes: 0,
				wordbag: ['wordbag', 'content'],
				urls: ['http://other.com/word']
			})
		}));
}

function setupSuggestResults() {
	_this.contentIds = [
		new ObjectId(),
		new ObjectId(),
		new ObjectId(),
		new ObjectId(),
		new ObjectId(),
		new ObjectId()
	];
	modLib.db = {
		asyncFindAllByObject: sinon.stub()
	};
	// the $regex value here "what" is the test value expected after non-alpha chars are stripped
	modLib.db.asyncFindAllByObject.withArgs('content', {$regex: '^what.*', $options: 'i'}, 5)
		.returns(new Promise((resolve, reject) => {
			resolve([
					{
						_id: _this.contentIds[0],
						question: "What question 1?",
						answer: "Some answer 1",
						likes: 10,
						dislikes: 5,
						wordbag: ['example', 'question'],
						urls: ['http://example.com/question']
					},
					{
						_id: _this.contentIds[1],
						question: "What question 2?",
						answer: "Some answer 2",
						likes: 4,
						dislikes: 2,
						wordbag: ['example', 'question'],
						urls: ['http://example.com/question']
					},
					{
						_id: _this.contentIds[2],
						question: "What question 3?",
						answer: "Some answer 3",
						likes: 8,
						dislikes: 5,
						wordbag: ['example', 'question'],
						urls: ['http://example.com/question']
					},
					{
						_id: _this.contentIds[3],
						question: "What question 4?",
						answer: "Some answer 4",
						likes: 1,
						dislikes: 5,
						wordbag: ['example', 'question'],
						urls: ['http://example.com/question']
					},
					{
						_id: _this.contentIds[4],
						question: "What referenced content? - 5",
						answer: "Synonym ref'd content - 5",
						likes: 12,
						dislikes: 5,
						wordbag: ['example', 'question'],
						urls: ['http://example.com/question']
					}
				]
			)
		}));
}

describe('search-utils', function () {
	describe('performSearch', function () {

		beforeEach(function () {
			setupUnionResults();
			searchUtils = require('../utils/search-utils')(modLib);
		});

		it('should return a set of Q&A results that contains a union of two matched words first, followed by synonym unions', function () {
			var input = 'match1 match2';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[0]._id.toString()).to.equal(_this.contentIds[0].toString()) &&
						expect(results.data.qaResults[1]._id.toString()).to.equal(_this.contentIds[2].toString());
				});
		});
		it('should return a synonym result as higher priority than single word match', function () {
			var input = 'match1 match2';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[1]._id.toString()).to.equal(_this.contentIds[2].toString());
				});
		});
		it('should rank single word or synonym matches according to word count', function () {
			var input = 'match1 match2';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[2]._id.toString()).to.equal(_this.contentIds[3].toString());
				});
		});
		it('should return an empty results list with no text given', function () {
			var input = '';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results).to.not.be.ok;
				}, (error) => {
					return expect(error).to.be.ok && expect(error.message).to.equal(errorMsg);
				});
		});
		it('should return an empty results list when no matches are available', function () {
			var input = 'nonmatchedword';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results).to.not.be.ok;
				}, (error) => {
					return expect(error).to.be.ok && expect(error.message).to.equal(errorMsg);
				});
		});
		it('should look up synonyms in word_index and append content to the end of the results', function () {
			var input = 'match1 match2';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[4]._id.toString()).to.equal(_this.contentIds[4].toString());
				});
		});
		it('should not return duplicate results', function () {
			var input = 'match1 match2';
			var uniqueEntries = [];
			var allUnique = true;
			return searchUtils.performSearch(input)
				.then((results) => {
					results.data.qaResults.forEach((entry) => {
						var entryId = entry._id.toString();
						!~uniqueEntries.indexOf(entryId) ? uniqueEntries.push(entryId) : (allUnique = false);
					});
					return expect(allUnique).to.be.true;
				});
		});
		it('should include a set of synonym words if available in results object', function () {
			var input = 'match1 match2';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.synonyms).to.be.ok && expect(results.data.synonyms.length).to.equal(1);
				});
		});
		it('should use word_bag words for further results and add to end of the results list', function () {
			var input = 'match1 match2';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[5]._id.toString()).to.equal(_this.contentIds[5].toString());
				});
		});
		it('should still return some results if some word look-ups fail', function () {
			var input = 'match1 nonmatchedword';
			return searchUtils.performSearch(input)
				.then((results) => {
					return expect(results.data.qaResults[0]._id.toString()).to.equal(_this.contentIds[0].toString());
				});
		});
		it('should not add search terms to the list of synonyms', function () {
			var input = 'match1 example';
			var notRequiredSynonym = 'example';
			var synonymNotPresent = true;
			return searchUtils.performSearch(input)
				.then((results) => {
					results.data.synonyms.forEach((entry) => {
						if (entry.word === notRequiredSynonym) synonymNotPresent = false;
					});
					return expect(synonymNotPresent).to.equal(true);
				});
		});
	});

	//TODO: sort suggestions by likes
	describe('suggest', function () {
		beforeEach(function () {
			setupSuggestResults();
			searchUtils = require('../utils/search-utils')(modLib);
		});
		it('should not pass any non-alpha chars to the database', function () {
			var input = 'what()';
			return searchUtils.suggest(input)
				.then((results) => {
					return expect(results.data.length).to.equal(5); // string passed to Mongo was 'what'
				});
		});
		it('should rank results by likes', function () {
			var input = 'what';
			return searchUtils.suggest(input)
				.then((results) => {
					return expect(false).to.be.ok;
				});
		});
	});
});

