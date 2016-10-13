/*
 	Requires npm packages `mongodb` & `q` to be installed

 	Copyright (C) 2016 Alex Wakeman

 	mongo-data-access is a CRUD boilerplate API for MongoDB.
 	Now you need a lot less boilerplate code for reading and updating Mongo.
 	Works asynchronously too, using promises / Q lib.
 */

var MongoDataAccess = module.exports = function () {};

MongoDataAccess.prototype = (function () {
	'use strict';
	var db, // maintain persistent reference to Mongo
		mongo = require('mongodb'),
		mongoClient = mongo.MongoClient,
		ObjectID = mongo.ObjectID,
		q = require('q');

	return {
		/**
		 * @param settings {Object} specifies the parameters for the Mongo connection { host: 'http://localhost:27017' [, user: 'admin', password: 'admin' ] }
		 */
		connect: function (settings) {
			if (!settings || typeof settings !== 'object') throw new Error('`settings` argument must be an object like { host: \'http://localhost:27017\' }');

			var host = settings.host,
				user = settings.user,
				pass = settings.password;

			if (!host) throw new Error('Host is required!');

			mongoClient.connect(host, function (error, _db) {
				if (error) throw error;
				db = _db;
				if (user && pass) {
					db.authenticate(user, pass, function (err) {
						if (err) console.log('Unable to authenticate MongoDB!');
					});
				}
			});
		},
		
		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param doc {Object} the document to store in the collection
		 */
		addEntry: function (collectionName, doc) {
			return new Promise((resolve, reject) => {
				db.collection(collectionName, function (error, collection) {
					if (error) return handleErrorResolve(reject, error);
					collection.insert(doc, {w: 1}, function (error, doc) {
						return handleErrorResolve(reject, error, resolve, doc);
					});
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @returns {Promise} resolves with all records in given collection
		 */
		findAll: function (collectionName) {
			return new Promise((resolve, reject) => {
				db.collection(collectionName, function (error, collection) {
					if (error) return handleErrorResolve(reject, error);
					collection.find().toArray(function (error, doc) {
						handleErrorResolve(reject, error, resolve, doc);
					});
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param query {Object} a MongoClient query object
		 * @param limit {Number} max number of results
		 * @returns {Promise}
		 */
		find: function (collectionName, query, limit) {
			if (query.hasOwnProperty('_id') && typeof query._id === 'string') {
				query._id = new ObjectID(query._id);
			}
			return new Promise((resolve, reject) => {
				db.collection(collectionName, function (error, collection) {
					if (error) {
						console.error(error);
						reject(error);
						return;
					}
					if (limit && typeof limit === 'number' && limit > 0) {
						collection.find(query).limit(parseInt(limit)).toArray(function (error, data) {
							if (error) return handleErrorResolve(reject, error);
							data.length === 1 ? resolve(data[0]) : resolve(data);
						});
					}
					else {
						collection.find(query).toArray(function (error, data) {
							if (error) return handleErrorResolve(reject, error);
							data.length === 1 ? resolve(data[0]) : resolve(data);
						});
					}
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param id {String} Mongo id string (hexadecimal)
		 * @param doc {Object} the document to store in the collection
		 * @returns {Promise} the id of the updated document for convenience
		 */
		updateEntry: function (collectionName, id, doc) {
			return new Promise((resolve, reject) => {
				if (typeof id !== 'string') return handleErrorResolve(reject, new Error('ID param must be of type `string`.'));
				if (!collectionName || !id || !doc) {
					return handleErrorResolve(reject, new Error('All params are required.'));
				}
				var oId = new ObjectID(id);
				delete doc._id;
				db.collection(collectionName, function (error, collection) {
					if (error) return handleErrorResolve(reject, error);
					collection.update(
						{ _id: oId },
						{ $set: doc },
						function (error) {
							return handleErrorResolve(reject, error, resolve, id);
						}
					);
				});
			});
		},

		/**
		 * @param collectionName {String} name of the Mongo collection
		 * @param id {String} Mongo id string (hexadecimal)
		 */
		removeEntry: function (collectionName, id) {
			return new Promise((resolve, reject) => {
				if (typeof id !== 'string') return handleErrorResolve(reject, new Error('`id` must be a hexadecimal BSON ObjectID `string`.'));
				var oId = new ObjectID(id); // generate a binary of id
				db.collection(collectionName, function (error, collection) {
					handleErrorResolve(reject, error);
					collection.remove({ _id: oId }, {justOne: true}, function (error) {
						handleErrorResolve(reject, error, resolve, id);
					})
				});
			});
		},

		/**
		 * Close the Mongo connection
		 */
		disconnect: function () {
			db.close();
		}
	};

	/**
	 * @param reject {Function} - a Promise instance's reject method
	 * @param error {MongoError|Error} - an Error type instance
	 * @param resolve? {Function} - a Promise instance's resolve method (optional)
	 * @param doc? - document to return to Promise .then() callback
	 */
	function handleErrorResolve(reject, error, resolve, doc) {
		if (error) {
			if (console && console.error) console.error(error);
			reject(error);
		} else if (resolve) {
			resolve(doc || true);
		}
	}
})();