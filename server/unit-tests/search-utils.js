/*
	tests to validate backend data structure, efficiency of search.

	Initially search looks for union of word matches, ranks these highly

	Then amongst single word matches, rank according to word count across data set

	Also looks for synonyms in word matches - and extracts accordingly - ranking them

	Must ignore self-referential synonyms - where a synonym is also an input word
 */

var expect = require('chai').expect;
var sinon = require('sinon');
var mongo = require('mongodb');
var ObjectId = mongo.ObjectID;
var searchUtils, modLib = {};

function setupResults() {
	var match1Callback = sinon.stub();
	var match1ObjId = new ObjectId();
	var match2ObjId = new ObjectId();
	var match1ContentRefs = [
		new ObjectId("5774752c998e45c364e44ee4"),
		new ObjectId("57747578998e45c364e44f8a"),
		new ObjectId(),
		new ObjectId()
	];
	var match2ContentRefs = [
		new ObjectId("5774752c998e45c364e44ee4"),
		new ObjectId("57747578998e45c364e44f8a"),
		new ObjectId(),
		new ObjectId()
	];
	var match1SynonymRefs = [
		new ObjectId(),
		new ObjectId(),
		new ObjectId("577475b8998e45c364e45191")
	];
	var match2SynonymRefs = [
		new ObjectId(),
		new ObjectId(),
		new ObjectId("577475b8998e45c364e45191")
	];
	match1Callback.returns();
	modLib.db.findOneByObject.withArgs('word_index', 'match1', function(error, doc) {}).callsArgWith(2, null, {
		"_id" : match1ObjId,
		"word" : "match1",
		"count" : "10",
		"content_refs" : match1ContentRefs,
		"synonyms" : {
			"match" : {
				"word" : "match",
				"references" : [
					match1SynonymRefs[0]
				],
				"count" : 1
			},
			"some" : {
				"word" : "some",
				"references" : [
					match1SynonymRefs[1]
				],
				"count" : 2
			},
			"word" : {
				"word" : "word",
				"references" : [
					match1SynonymRefs[2]
				],
				"count" : 3
			}
		}
	});
	modLib.db.findOneByObject.withArgs('word_index', 'match2', function(error, doc) {}).callsArgWith(2, null, {
		"_id" : match2ObjId,
		"word" : "match1",
		"count" : "10",
		"content_refs" : match2ContentRefs,
		"synonyms" : {
			"match" : {
				"word" : "match",
				"references" : [
					match2SynonymRefs[0]
				],
				"count" : 1
			},
			"some" : {
				"word" : "some",
				"references" : [
					match2SynonymRefs[1]
				],
				"count" : 2
			},
			"word" : {
				"word" : "word",
				"references" : [
					match2SynonymRefs[2]
				],
				"count" : 3
			}
		}
	});
}

describe('search-utils', function() {
	describe('performSearch', function() {

		beforeEach(function() {
			modLib.db  = {
				findOneByObject: sinon.stub(),
				findAllByObject: sinon.stub()
			};
			setupResults();
			searchUtils = require('../utils/search-utils')(modLib);
		});

		it('should return a set of Q&A results that contains a union of two matched words', function(done) {
			var input = 'match1 match2';
			Promise.resolve(searchUtils.performSearch(input))
				.then((results) => {
					return expect(results).to.be.ok && done();
				});
		});
		it('should return a synonym result and a direct match result', function() {
			return expect(false).to.be.ok;
		});
		it('should return a union of synonym matches direct match results', function() {
			return expect(false).to.be.ok;
		});
		it('should rank single word or synonym matches according to word count', function() {
			return expect(false).to.be.ok;
		});
		it('should rank union matches above single word matches', function() {
			return expect(false).to.be.ok;
		});
		it('should return an empty array of results with no text given', function() {
			return expect(false).to.be.ok;
		});
		it('should return an empty array of results with no matches available', function() {
			return expect(false).to.be.ok;
		});
	});

	describe('suggest', function() {
		it('should fetch at most 5 questions that match this given input', function() {
			return expect(false).to.be.ok;
		});
		it('should return an empty array if no matches questions match given input', function() {
			return expect(false).to.be.ok;
		});
	})
});

