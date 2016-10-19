/*
 	Requires npm packages `mongodb` to be installed

 	Copyright (C) 2016 Alex Wakeman

 	mongo-data-access is a CRUD boilerplate API for MongoDB.
 	Meaning a lot less boilerplate code for reading and updating MongoDB.
 	Works asynchronously using native ECMA-6 Promise.
 */

var MongoDataAccess = module.exports = function() {};

MongoDataAccess.prototype = (() => {
	'use strict';
	var db, // maintain persistent reference to Mongo
		mongo = require('mongodb'),
		mongoClient = mongo.MongoClient,
		ObjectID = mongo.ObjectID;

	return {
		/**
		 *
		 * @param settings {Object} specifies the parameters for the Mongo connection { host: 'mongodb://127.0.0.1:27017/dbName' [, user: 'admin', password: 'admin' ] }
		 */
		connect: (settings) => {
			if (!settings || typeof settings !== 'object') {
				throw new Error('`settings` argument must be an object like { host: \'mongodb://127.0.0.1:27017/dbName\' }');
			}

			if (!settings.host) {
				throw new Error('Host address for MongoDB is required.');
			}

			var host = settings.host,
				user = settings.user,
				pass = settings.password;

			mongoClient.connect(host, (error, _db) => {
				if (error) throw error;
				db = _db;
				if (user && pass) {
					db.authenticate(user, pass, (error) => {
						if (error) throw error;
					});
				}
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @returns {Promise} resolves with all records in given collection
		 */
		findAll: (collectionName) => {
			return new Promise((resolve, reject) => {
				db.collection(collectionName, (error, collection) => {
					if (error) return handleErrorResolve(reject, error);
					collection.find().toArray((error, doc) => handleErrorResolve(reject, error, resolve, doc));
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param query {Object} a MongoClient query object
		 * @param limit {Number} max number of results
		 * @returns {Promise} results returned. if limit of `1` is passed, results array is discarded in favour of first result within it.
		 */
		find: (collectionName, query, limit) => {
			if (query.hasOwnProperty('_id') && typeof query._id === 'string') {
				query._id = new ObjectID(query._id);
			}
			return new Promise((resolve, reject) => {
				db.collection(collectionName, (error, collection) => {
					if (error) {
						return handleErrorResolve(reject, error);
					}
					if (limit && typeof limit === 'number' && limit > 0) {
						collection.find(query).limit(parseInt(limit)).toArray((error, data) => {
							if (error) {
								return handleErrorResolve(reject, error);
							}

							if (limit === 1 && data.length === 1) {
								resolve(data[0]);
							} else if (data.length > 1) {
								resolve(data);
							} else {
								resolve(null);
							}
						});
					}
					else {
						collection.find(query).toArray((error, data) => handleErrorResolve(reject, error, resolve, data));
					}
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param input {Object} the document to store in the collection
		 * @returns {Promise} the input document with _id property set by Mongo after insert
		 */
		insertOne: (collectionName, input) => {
			return new Promise((resolve, reject) => {
				db.collection(collectionName, (error, collection) => {
					if (error) {
						return handleErrorResolve(reject, error);
					}
					collection.insert(input, {w: 1}, (error, resultObj) => {
						if (!error && resultObj.result.n === 1) { // only give the input its ID if write op was ok
							input._id = resultObj.insertedIds[0];
						}
						handleErrorResolve(reject, error, resolve, input);
					});
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param id {String} Mongo id string (hexadecimal)
		 * @param input {Object} the document to store in the collection
		 * @returns {Promise} the id of the updated document for convenience
		 */
		update: (collectionName, id, input) => {
			return new Promise((resolve, reject) => {
				if (typeof id !== 'string') return handleErrorResolve(reject, new Error('ID param must be of type `string`.'));
				if (!collectionName || !id || !input) {
					return handleErrorResolve(reject, new Error('All params are required.'));
				}
				var oId = new ObjectID(id);
				delete input._id;
				db.collection(collectionName, (error, collection) => {
					if (error) {
						return handleErrorResolve(reject, error);
					}
					collection.update(
						{ _id: oId },
						{ $set: input },
						(error) => {
							if (!error) {
								input._id = oId;
							}
							handleErrorResolve(reject, error, resolve, input)
						}
					);
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param pullObj {Object} a MongoDB $pull update compatible object https://docs.mongodb.com/manual/reference/operator/update/pull/
		 * @returns {Promise}
		 */
		pull: (collectionName, pullObj) => {
			return new Promise((resolve, reject) => {
				if (!pullObj || typeof pullObj !== 'object') return handleErrorResolve(reject, new Error('pullObj param must be of type `object`.'));
				db.collection(collectionName, (error, collection) => {
					if (error) {
						return handleErrorResolve(reject, error);
					}
					collection.update(
						{  },
						{ $pull: pullObj },
						{ multi: true },
						(error, doc) => {
							handleErrorResolve(reject, error, resolve)
						}
					);
				});
			});
		},

		/**
		 *
		 * @param collectionName {String} name of the Mongo collection
		 * @param id {String} Mongo id string (hexadecimal)
		 */
		remove: (collectionName, id) => {
			return new Promise((resolve, reject) => {
				if (typeof id !== 'string') return handleErrorResolve(reject, new Error('`id` must be a hexadecimal BSON ObjectID `string`.'));
				var oId = new ObjectID(id); // generate a binary of id
				db.collection(collectionName, (error, collection) => {
					handleErrorResolve(reject, error);
					collection.remove({ _id: oId }, {justOne: true}, (error) => handleErrorResolve(reject, error, resolve, id))
				});
			});
		},

		/**
		 * Close the Mongo connection
		 */
		close: () => db.close(),

		/**
		 *
		 * @param id {String} string based BSON ObjectId hexadecimal value
		 * @returns {*}
		 */
		getBsonObjectId: (id) => new ObjectID(id)
	};

	/**
	 *
	 * @param reject {Function} - a Promise instance's reject method
	 * @param error {MongoError|Error} - an Error type instance
	 * @param resolve? {Function} - a Promise instance's resolve method (optional)
	 * @param doc? {Object|String|Boolean} - document to return to Promise .then() callback
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