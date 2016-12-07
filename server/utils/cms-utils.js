/*
 See helpers.js for the Array.prototype augmentations used here
 */
module.exports = function(modLib) {
	if (!modLib) throw new Error('Module Library is missing.');

	var db = modLib.db,
		config = modLib.config,
		utils = modLib.utils;

	return {
		mergeNew: (contentData) => runContentUpdate(contentData),
		mergeUpdate: (contentData, id) => runContentUpdate(contentData, true),
		remove: (id) => removeContent(db.getBsonObjectId(id))
	};

	function removeContent(id) {
		return Promise
			.resolve(db.remove(config.CONTENT, { _id: id }))
			.then(() => removeContentRefsFromWordIndex(id));
	}

	function runContentUpdate(contentData, isUpdate) {
		var idStr;
		if (!contentData || (!contentData.hasOwnProperty('answer') || !contentData.hasOwnProperty('question'))) return Promise.reject();
		contentData.word_bag = extractWordBag(contentData);
		if (!contentData.hasOwnProperty('likes') && !contentData.hasOwnProperty('dislikes')) {
			contentData.likes = 0;
			contentData.dislikes = 0;
		}
		return Promise
			.resolve(isUpdate ? db.updateDocument(config.CONTENT, contentData) : db.insertOne(config.CONTENT, contentData))
			.then((doc) => idStr = doc._id.toString())
			.then(() => isUpdate ? removeContentRefsFromWordIndex(contentData._id) : null)
			.then(() => applyToWordIndex(contentData))
			.then(updateWordIndexSynonyms)
			.then(() => idStr);
	}

	function applyToWordIndex(doc) {
		var wordIndexOps = [];
		return getWordIndexDocs(doc.word_bag)
			.then((wordIndexDocs) => {
				wordIndexDocs.forEach((wordIndexDoc, i) => {
					if (wordIndexDoc) {
						wordIndexDoc.count += 1;
						if (!wordIndexDoc.content_refs.contains(doc._id)) {
							wordIndexDoc.content_refs.push(doc._id);
						}
						wordIndexOps.push(db.updateDocument(config.WORD_INDEX, wordIndexDoc));
					} else {
						wordIndexOps.push(db.insertOne(config.WORD_INDEX, {
							word: doc.word_bag[i],
							count: 1,
							content_refs: [doc._id]
						}));
					}
				});
				return Promise.all(wordIndexOps);
			});
	}

	function updateWordIndexSynonyms(wordIndexDocs) {
		if (!wordIndexDocs || !Array.isArray(wordIndexDocs)) return Promise.reject(false);
		return wordIndexDocs.forEach((wordIndexDoc) => {
			if (wordIndexDoc.content_refs.length > 1) {
				return getContentDocs(wordIndexDoc.content_refs)
					.then((wordIndexContentRefs) => {
						return applySynonymsToWordIndex(wordIndexContentRefs, wordIndexDoc);
					});
			}
		});
	}

	function applySynonymsToWordIndex(wordIndexContentRefs, wordIndexDoc) {
		var contentDocsLen = Math.min(wordIndexContentRefs.length, 100),
			contentDoc,
			wordIndexUpdates = [];
		for (var i = 0; i < contentDocsLen; i++) { // limit to 100 x 100 cross-checks for optimisation
			contentDoc = wordIndexContentRefs[i];
			for (var j = 0; j < contentDocsLen; j++) {
				if (i !== j) {
					var checking = wordIndexContentRefs[j],
						matches = commonStrMatch(contentDoc.answer, checking.answer);
					matches.forEach((match, i) => {
						if (wordIndexDoc.word === match) {
							return false;
						}
						if (!wordIndexDoc.synonyms) {
							wordIndexDoc.synonyms = [];
						}
						if (!wordIndexDoc.synonyms.containsWord(match)) {
							wordIndexDoc.synonyms[i] = {
								word: match,
								references: [contentDoc._id],
								count: 1
							};
						} else {
							if (!wordIndexDoc.synonyms[i].references.containsObjectId(contentDoc._id)) {
								wordIndexDoc.synonyms[i].references.push(contentDoc._id)
							}
							wordIndexDoc.synonyms[i].count += 1;
						}
					});
					wordIndexDoc.synonymCount = wordIndexDoc.synonyms.length;
					wordIndexUpdates.push(db.updateDocument(config.WORD_INDEX, wordIndexDoc));
					matches = null;
					checking = null;
				}
			}
		}
		return Promise.all(wordIndexUpdates);
	}

	function extractWordBag(doc) {
		var wordsFinal = [],
			text = doc.question + ' ' + doc.answer;
		utils.stringToWordArray(text).forEach((word) => {
			if (word && !wordsFinal.contains(word)) {
				wordsFinal.push(word);
			}
		});
		return wordsFinal;
	}

	function removeContentRefsFromWordIndex(contentId) {
		return Promise
			.resolve(db.update(config.WORD_INDEX, { content_refs: contentId }, { $inc: { count: -1 }}))
			.then(() => db.update(config.WORD_INDEX, { 'synonyms.references': contentId }, { $inc : { 'synonyms.$.count': -1 } }))
			.then(() => db.pull(config.WORD_INDEX, {}, { content_refs: contentId }))
			.then(() => db.pull(config.WORD_INDEX, { 'synonyms.references': contentId }, { 'synonyms.$.references': contentId }))
			.then(() => db.remove(config.WORD_INDEX, { count: 0 }, false))
			.then(() => db.pull(config.WORD_INDEX, {}, { synonyms: { count: 0 }}));
	}

	function getWordIndexDocs(words) {
		return db.find(config.WORD_INDEX, { word: { $in: words }});
	}

	function getContentDocs(idList) {
		return db.find(config.CONTENT, { _id: { $in: idList }});
	}

	function commonStrMatch(from, to) {
		var repeatedWordsList = [],
			singleUseWords = [];
		from = utils.stringToWordArray(from);
		to = utils.stringToWordArray(to);
		dupeCheck(from);
		dupeCheck(to);
		return repeatedWordsList;

		function dupeCheck(textList) {
			textList.forEach((word) => {
				if (!word) return;
				if (singleUseWords.contains(word)) {
					if (!repeatedWordsList.contains(word)) {
						repeatedWordsList.push(word);
					}
				} else {
					singleUseWords.push(word);
				}
			});
			return textList;
		}
	}
};