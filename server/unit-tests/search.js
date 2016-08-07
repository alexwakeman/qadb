/*
	tests to validate backend data structure, efficiency of search.

	Initially search looks for union of word matches, ranks these highly

	Then amongst single word matches, rank according to word count across data set

	Also looks for synonyms in word matches - and extracts accordingly - ranking them
 */

var assert = require('chai').expect;
var sinon = require('sinon');
var db;
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;


describe('search.js routes', function() {
	describe('getResults', function() {

		beforeEach(function() {
			db = getFakeMongoDataAccess();
		});

		it('should return an empty array or results with no text give', function() {

		});
		it('should return a result that contains a union of two matched words', function() {

		});
		it('should return a synonym result and a direct match result', function() {

		});
		it('should rank single word or synonym matches according to word count', function() {

		});
	});
});

function getFakeMongoDataAccess() {
	var mongoDataAccess = {
		findOneByObject: function() {},
		findAllByObject: function() {}
	};
	sinon.stub(mongoDataAccess, 'findOneByObject', function () {
		return {}
	});
	sinon.stub(mongoDataAccess, 'findAllByObject', function () {
		return []
	});
}

