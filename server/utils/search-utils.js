/*
	See helpers.js for the Array.prototype augmentations used here
 */

module.exports = function (modLib) {
	if (!modLib) throw new Error('Module library is missing.');
	var db = modLib.db,
		config = modLib.config,
		utils = modLib.utils;
	const synonymSearchThreshold = 8; // if less than synonymSearchThreshold results from direct matches from input, use synonym lookup
	const maxSynonymLookupResults = 10; // limit of synonym word referenced content
	const maxSynonymResults = 12;
	const resultsPerPage = 10;

	return {
		performSearch: function (inputString, page) {
			var searchTerms,
				resultObj = {
					data: {
						qaResults: [],
						totalPages: 0,
						synonyms: []
					}
				},
				synonymWordIndexLookups = [],
				synonyms = [],
				inputWordIndexMatches = [];

			if (!inputString || typeof inputString !== 'string') return Promise.resolve(resultObj);

			searchTerms = utils.stringToWordArray(inputString);

			return Promise
				.resolve(db.find(config.WORD_INDEX, { word: { $in: searchTerms }}, false, { synonymCount: -1, count: -1 }))
				.then((wordIndexDocs) => {
					if (wordIndexDocs.length === 0) throw new Error('No records found'); // exits Promise chain
					inputWordIndexMatches = wordIndexDocs.filter((entry) => entry); // ensure each entry is valid (exists)
					return inputWordIndexMatches;
				})
				.then(extractSortedContentRefs)
				.then(extractContent)
				.then((content) => content.forEach((qaEntry) => resultObj.data.qaResults.push(qaEntry)))
				.then(() => {
					inputWordIndexMatches.forEach((wordIndexDoc) => {
						if (!wordIndexDoc.synonyms || wordIndexDoc.synonyms.length === 0) return false;
						wordIndexDoc.synonyms.forEach((synonym, i) => {
							var synonymObj;
							if (!searchTerms.hasEntry(synonym.word)) { // ensure the entry is not a searchTerms word
								synonymObj = wordIndexDoc.synonyms[i];
								synonyms.push(synonymObj);
							}
						});
					});

					if (synonyms.length > 0) {
						var noDupeSynonyms = [];
						synonyms.forEach((entry) => noDupeSynonyms.containsWord(entry.word) ? null : noDupeSynonyms.push(entry));
						if (noDupeSynonyms.length > maxSynonymResults) {
							noDupeSynonyms = noDupeSynonyms.slice(0, maxSynonymResults);
						}
						resultObj.data.synonyms = noDupeSynonyms;
					}
					/*
						Only perform synonym word look-ups if results from user's actual input are lacking
					 */
					if (resultObj.data.qaResults.length < synonymSearchThreshold && synonyms.length > 0) {
						synonyms.forEach((synonym) => synonymWordIndexLookups.push(synonym.word));
						return db.find(config.WORD_INDEX, { word: { $in: synonymWordIndexLookups }}, false, {count: -1});
					}
				})
				.then((synonymMatches) => synonymMatches ? synonymMatches.filter((match) => match) : [])
				.then(extractSortedContentRefs)
				.then(extractContent)
				.then((content) => {
					content.forEach((qaEntry, index) => index <= maxSynonymLookupResults ? resultObj.data.qaResults.push(qaEntry) : null);
					resultObj.data.totalPages = getTotalPageCount(resultObj.data.qaResults);
					resultObj.data.qaResults = slicePage(page, resultObj.data.qaResults);
					return resultObj;
				});
		},

		suggest: function (input) {
			if (!input) return Promise.resolve({data: []});
			input = input.replace(utils.wordsOnlyRegex, '');
			return db.find(config.CONTENT, { 'question': { $regex: '^' + input + '.*', $options: 'i' } }, 5)
				.then((results) => {
					return {
						data: results
					}
				});
		}
	};

	/**
	 *
	 * Compiles one array of content IDs that exist across multiple word_index documents,
	 * and one list of content IDs that exist in only one word_index document.
	 *
	 * Content IDs existing across word_index documents are unions of that ID, and are therefore higher priority
	 * than single matches.
	 *
	 */
	function extractSortedContentRefs(wordIndexDocs) {
		var singleEntries = [],
			multipleEntries = [];

		if (!wordIndexDocs || wordIndexDocs.length === 0) {
			return [];
		}
		wordIndexDocs.forEach((wordIndexDoc) => {
			var len = wordIndexDoc.content_refs.length,
				contentRef;
			for (var i = 0; i < len; i++) {
				contentRef = wordIndexDoc.content_refs[i];
				if (singleEntries.containsObjectId(contentRef)) {
					if (!multipleEntries.containsObjectId(contentRef)) {
						multipleEntries.push(contentRef);
					}
				} else {
					singleEntries.push(contentRef);
				}
			}
		});

		// just attach the singly matched entries on to the end of the union results
		multipleEntries = multipleEntries.concat(singleEntries);
		return { results: multipleEntries };
	}

	function extractContent(sortedContentRefs) {
		var contentLookups = [];
		if (!sortedContentRefs || sortedContentRefs.length === 0) {
			return contentLookups;
		}
		sortedContentRefs.results.forEach((matchRef) => {
			contentLookups.push(db.find(config.CONTENT, { _id: matchRef }, 1))
		});
		return Promise.all(contentLookups);
	}

	function slicePage(page, content) {
		var startIndex, endIndex, maxIndex;
		if (page && typeof page === 'number' && page > 0) {
			maxIndex = content.length - 1;
			startIndex = (page - 1) * resultsPerPage;
			startIndex = startIndex >= maxIndex ? startIndex - resultsPerPage : startIndex;
			endIndex = startIndex + resultsPerPage;
			endIndex = endIndex > content.length - 1 ? content.length - 1 : endIndex;
			content = content.slice(startIndex, endIndex);
		}
		return content;
	}

	function getTotalPageCount(content) {
		return Math.ceil(content.length / resultsPerPage);
	}
};