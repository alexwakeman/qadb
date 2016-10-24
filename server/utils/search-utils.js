/*
	See helpers.js for the Array.prototype augmentations used here
 */

module.exports = function (modLib) {
	if (!modLib) throw new Error('Module library is missing.');
	var db = modLib.db,
		config = modLib.config,
		stops = ['\\w{1}', '\\d+', 'having', 'whose', 'whomever', 'whoever', 'whichever', 'whatever', 'those', 'themselves', 'theirs', 'something', 'someone', 'somebody', 'several', 'ourselves', 'ours', 'nothing', 'nobody', 'none', 'one', 'myself', 'much', 'more', 'mine', 'many', 'itself', 'himself', 'herself', 'few', 'everything', 'everyone', 'everybody', 'each', 'both', 'anybody', 'another',  'anyone', 'anything',  'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'others', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'],
		verbs = ['be', 'were', 'been', 'have', 'had', 'do', 'did', 'done', 'say', 'said', 'go', 'went', 'gone', 'get', 'got', 'make', 'made', 'know', 'knew', 'known', 'think', 'thought', 'take', 'took', 'taken', 'see', 'saw', 'seen', 'came', 'come', 'want', 'wanted', 'use', 'used', 'find', 'found', 'give', 'gave', 'given', 'tell', 'told', 'work', 'worked', 'call', 'called', 'try', 'tried', 'ask', 'asked', 'need', 'needed', 'feel', 'felt', 'became', 'become', 'leave', 'put', 'mean', 'meant', 'keep', 'kept', 'let', 'begin', 'began', 'begun', 'seem', 'seemed', 'help', 'helped', 'show', 'showed', 'shown', 'hear', 'heard', 'play', 'played', 'ran', 'run', 'move', 'moved', 'live', 'lived', 'believe', 'believed', 'bring', 'brought', 'happen', 'happened', 'write', 'wrote', 'written', 'sit', 'sat', 'stand', 'stood', 'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued', 'set', 'learn', 'learnt', 'learned', 'change', 'changed', 'lead', 'led', 'understand', 'understood', 'watch', 'watched', 'follow', 'followed', 'stop', 'stopped', 'create', 'created', 'speak', 'spoke', 'spoken', 'read', 'spend', 'spent', 'grow', 'grew', 'grown', 'open', 'opened', 'walk', 'walked', 'win', 'won', 'teach', 'taught', 'offer', 'offered', 'remember', 'remembered', 'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'serve', 'served', 'die', 'died', 'send', 'sent', 'build', 'built', 'stay', 'stayed', 'fall', 'fell', 'fallen', 'cut', 'reach', 'reached', 'kill', 'killed', 'raise', 'raised', 'pass', 'passed', 'sell', 'sold', 'decide', 'decided', 'return', 'returned', 'explain', 'explained', 'hope', 'hoped', 'develop', 'developed', 'carry', 'carried', 'break', 'broke', 'broken', 'receive', 'received', 'agree', 'agreed', 'support', 'supported', 'hit', 'produce', 'produced', 'eat', 'ate', 'eaten', 'cover', 'covered', 'catch', 'caught', 'draw', 'drew', 'drawn', 'choose', 'chose', 'chosen'],
		fullStops = stops.concat(verbs),
		boundedStopsRegex = new RegExp('\\b' + fullStops.join('\\b|\\b') + '\\b', 'g'),
		wordsOnlyRegex = new RegExp('[^\\w\\s]+', 'g'),
		multiSpace = new RegExp('\\s{2,}', 'g');
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
						synonyms: []
					}
				},
				synonymWordIndexLookups = [],
				synonyms = [],
				inputWordIndexMatches = [];

			if (!inputString || typeof inputString !== 'string') return Promise.resolve(resultObj);

			inputString = inputString.toLowerCase();
			inputString = inputString.replace(boundedStopsRegex, ''); // remove unnecessary words (stop words)
			inputString = inputString.replace(wordsOnlyRegex, ''); // remove all non-alpha chars
			inputString = inputString.replace(multiSpace, ' '); // replace multi-spaces with one space

			if (!inputString) return Promise.resolve(resultObj);

			searchTerms = inputString.split(' ');

			return Promise
				.resolve(db.find(config.WORD_INDEX, { word: { $in: searchTerms }}, false, { count: -1}))
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
						// synonyms.sort(sortByCount);
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
					resultObj.data.qaResults = slicePage(page, resultObj.data.qaResults);
					return resultObj;
				});
		},

		suggest: function (input) {
			if (!input) return Promise.resolve({data: []});
			input = input.replace(wordsOnlyRegex, '');
			return Promise.resolve(db.find(config.CONTENT, { 'question': { $regex: '^' + input + '.*', $options: 'i' } }, 5))
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
		//wordIndexDocs.sort(sortByCount);
		wordIndexDocs.forEach((wordIndexDoc) => {
			var len = wordIndexDoc.content_refs.length,
				contentRef;
			for (var i = 0; i < len; i++) {
				contentRef = wordIndexDoc.content_refs[i];
				if (singleEntries.contains(contentRef)) {
					if (!multipleEntries.contains(contentRef)) {
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
		if (!sortedContentRefs || sortedContentRefs.length === 0) {
			return Promise.resolve([]);
		}
		return db.find(config.CONTENT, { _id: { $in: sortedContentRefs.results } }, false);
	}

	function slicePage(page, content) {
		var startIndex, endIndex, maxIndex;
		if (page && typeof page === 'number' && page > 0) {
			// do the pagination in the app logic instead of using MongoD, as it is more efficient
			// see https://docs.mongodb.com/manual/reference/method/cursor.skip/
			maxIndex = content.length - 1;
			startIndex = (page - 1) * resultsPerPage;
			startIndex = startIndex >= maxIndex ? startIndex - resultsPerPage : startIndex;
			endIndex = startIndex + resultsPerPage;
			endIndex = endIndex > content.length - 1 ? content.length - 1 : endIndex;
			content = content.slice(startIndex, endIndex);
		}
		return content;
	}

	// function sortByCount(a, b) {
	// 	a.count = parseInt(a.count);
	// 	b.count = parseInt(b.count);
	// 	return a.count < b.count ? 1 : a.count > b.count ? -1 : 0
	// }
};