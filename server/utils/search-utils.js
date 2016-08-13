module.exports = function (modLib) {
	var db = modLib.db;
	var boundedStops = ["\\b\\d+\\b", "\\.", "\\,", "\\?", "\\!", "\\'", "\\,", "\\-", "\\:", "\\;", "\\ba\\b", "\\bable\\b", "\\babout\\b", "\\bacross\\b", "\\bafter\\b", "\\ball\\b", "\\balmost\\b", "\\balso\\b", "\\bam\\b", "\\bamong\\b", "\\ban\\b", "\\band\\b", "\\bany\\b", "\\bare\\b", "\\bas\\b", "\\bat\\b", "\\bbe\\b", "\\bbecause\\b", "\\bbeen\\b", "\\bbut\\b", "\\bby\\b", "\\bcan\\b", "\\bcannot\\b", "\\bcould\\b", "\\bdear\\b", "\\bdid\\b", "\\bdo\\b", "\\bdoes\\b", "\\beither\\b", "\\belse\\b", "\\bever\\b", "\\bevery\\b", "\\bfor\\b", "\\bfrom\\b", "\\bget\\b", "\\bgot\\b", "\\bhad\\b", "\\bhas\\b", "\\bhave\\b", "\\bhe\\b", "\\bher\\b", "\\bhers\\b", "\\bhim\\b", "\\bhis\\b", "\\bhow\\b", "\\bhowever\\b", "\\bi\\b", "\\bif\\b", "\\bin\\b", "\\binto\\b", "\\bis\\b", "\\bit\\b", "\\bits\\b", "\\bjust\\b", "\\bleast\\b", "\\blet\\b", "\\blike\\b", "\\blikely\\b", "\\bmay\\b", "\\bme\\b", "\\bmight\\b", "\\bmost\\b", "\\bmust\\b", "\\bmy\\b", "\\bneither\\b", "\\bno\\b", "\\bnor\\b", "\\bnot\\b", "\\bof\\b", "\\boff\\b", "\\boften\\b", "\\bon\\b", "\\bonly\\b", "\\bor\\b", "\\bother\\b", "\\bour\\b", "\\bown\\b", "\\brather\\b", "\\bsaid\\b", "\\bsay\\b", "\\bsays\\b", "\\bshe\\b", "\\bshould\\b", "\\bsince\\b", "\\bso\\b", "\\bsome\\b", "\\bthan\\b", "\\bthat\\b", "\\bthe\\b", "\\btheir\\b", "\\bthem\\b", "\\bthen\\b", "\\bthere\\b", "\\bthese\\b", "\\bthey\\b", "\\bthis\\b", "\\btis\\b", "\\bto\\b", "\\btoo\\b", "\\btwas\\b", "\\bus\\b", "\\bwants\\b", "\\bwas\\b", "\\bwe\\b", "\\bwere\\b", "\\bwhat\\b", "\\bwhen\\b", "\\bwhere\\b", "\\bwhich\\b", "\\bwhile\\b", "\\bwho\\b", "\\bwhom\\b", "\\bwhy\\b", "\\bwill\\b", "\\bwith\\b", "\\bwould\\b", "\\byet\\b", "\\byou\\b", "\\byour\\b"];
	var boundedStopsRegex = new RegExp(boundedStops.join('|'), 'g');
	var wordsOnlyRegex = new RegExp('[\W]+', 'g');
	return {
		performSearch: function (inputString) {
			var input,
				resultObj = {
					data: {
						qaResults: [],
						synonyms: []
					}
				};
			var wordIndexLookups = [];
			var synonymWordIndexLookups = [];
			var inputWordList = [];
			inputString = inputString.toLowerCase();
			inputString = inputString.replace(boundedStopsRegex, '');
			input = inputString.split(' ');
			input.forEach((word) => wordIndexLookups.push(db.asyncFindOneByObject('word_index', { word: word })));

			/*
				What is this Promise chain doing?

				1 - Lookup matches in the Mongo word_index collection for the give input, if none, return empty results
				2 - Each word_index entry potentially has a set of synonyms, so look these up in word_index too
				3 - Add all these word_index docs to inputWordList
				4 - Extract the content references in an order most useful to the user, i.e. with word unions, synonym unions, and sorted by word count etc.
				5 - Extract the actual content Question and Answer documents from the content collection
				6 - Each Q&A document contains a "wordbag" array of words used in the question - so look these up to in the word_index too
				7 - Add these wordbag matches into the final results
				8 - Finally attach the synonyms to the results object, for display to the user
			 */

			return Promise
				.all(wordIndexLookups)
				.then((wordIndexDocs) => {
					wordIndexDocs = wordIndexDocs.filter((entry) => entry); // ensure each entry is valid (exists)
					if (!wordIndexDocs || wordIndexDocs.length === 0) throw new Error('No records found');
					inputWordList.push(...wordIndexDocs);
					inputWordList.forEach((wordIndexDoc) => {
						if (!wordIndexDoc.synonyms) return false;
						Object.keys(wordIndexDoc.synonyms).forEach((key) => {
							var synonymObj = wordIndexDoc.synonyms[key];
							synonymWordIndexLookups.push(db.asyncFindOneByObject('word_index', { word: synonymObj.word }));
						});
					});
					return Promise.all(synonymWordIndexLookups)
				})
				.then((synonymDocs) => inputWordList.push(...synonymDocs))
				.then(() => inputWordList)
				.then(extractSortedContentRefs)
				.then(extractContent)
				.then((content) => content.forEach((qaEntry) => resultObj.data.qaResults.push(qaEntry)))
				.then(() => {
					var wordBagRequests = [];
					resultObj.data.qaResults.forEach((qa) => qa.wordbag.forEach(
						(word) => wordBagRequests.push(db.asyncFindOneByObject('word_index', { word: word })))
					);
					return Promise.all(wordBagRequests);
				})
				.then(extractSortedContentRefs)
				.then(extractContent)
				.then((wordBagContent) => {
					// need to ensure the word bag content is not already present in the results
					var contentEntries = [];
					resultObj.data.qaResults.forEach((entry) => {
						var entryId = entry._id.toString();
						contentEntries.push(entryId);
					});

					wordBagContent.forEach((wordbagQaEntry) => {
						! ~ contentEntries.indexOf(wordbagQaEntry._id.toString()) ? resultObj.data.qaResults.push(wordbagQaEntry) : null;
					})
				})
				.then(() => inputWordList)
				.then(extractSynonymList)
				.then((synonyms) => {
					synonyms = synonyms.filter((entry) => ! ~ input.indexOf(entry.word));
					resultObj.data.synonyms = synonyms;
					return resultObj;
				});
		},
		suggest: function(input) {
			input = input.replace(wordsOnlyRegex, ' ');
			return Promise.resolve(db.asyncFindAllByObject('content', { $regex: '^' + input + '.*', $options: 'i' }, 5));
		}
	};

	/**
	 * Sorts a set of content references from the word index, by checking for unions of content references
	 * within each word index entry, i.e. distinct and non-distinct entries, where non-distinct means a union was found.
	 * This content is a better result.
	 *
	 * Also checks for each word's synonym matches, and uses these references as unions also,
	 * but with reduced priority (exact unions of the user's search terms is ideal).
	 *
	 * If there is not many results, we can look up the synonym in the word_index and use it's content references as well.
	 * @param wordIndexDocs
	 * @returns {{results: Array}}
	 */
	function extractSortedContentRefs(wordIndexDocs) {
		var distinctEntries = [], nonDistinctEntries = [], filteredDistinct;
		wordIndexDocs.sort(sortByCount);
		wordIndexDocs.forEach((wordIndexDoc) => {
			wordIndexDoc.content_refs.forEach((contentRef) => {
				var idString = contentRef.toString();
				~ distinctEntries.indexOf(idString) ? ~ nonDistinctEntries.indexOf(idString) ?
					distinctEntries.push(idString) : nonDistinctEntries.push(idString) : distinctEntries.push(idString);
			});
		});
		wordIndexDocs.forEach((wordIndexDoc) => {
			if (wordIndexDoc.synonyms) {
				Object.keys(wordIndexDoc.synonyms).forEach((key) => {
					var synonymObj = wordIndexDoc.synonyms[key];
					var idString = synonymObj.references[0].toString();
					// treat synonym cross-references as unions, i.e. high priority matches
					~ distinctEntries.indexOf(idString) ? ~ nonDistinctEntries.indexOf(idString) ?
						distinctEntries.push(idString) : nonDistinctEntries.push(idString) : distinctEntries.push(idString);
				});
			}
		});

		filteredDistinct = distinctEntries.filter((entry) => {
			return ! ~ nonDistinctEntries.indexOf(entry); // remove duplicates
		});
		nonDistinctEntries.push(...filteredDistinct);
		return { results: nonDistinctEntries };
	}

	function extractSynonymList(wordIndexDocs) {
		var synonymList = [];
		wordIndexDocs.forEach((wordIndexDoc) => {
			if (wordIndexDoc.synonyms) {
				Object.keys(wordIndexDoc.synonyms).forEach((key) => {
					var synonymObj = wordIndexDoc.synonyms[key];
					var entry = { word: synonymObj.word, count: synonymObj.count };
					! ~ synonymList.indexOf(entry) ? synonymList.push(entry) : null;
				});
				synonymList.sort(sortByCount);
			}
		});

		return synonymList;
	}

	function extractContent(sortedContentRefs) {
		var contentLookups = [];
		sortedContentRefs.results.forEach((matchRef) => contentLookups.push(db.asyncFindOneByObject('content', { _id: matchRef })));
		return Promise.all(contentLookups);
	}

	function sortByCount(a, b) { return a.count < b.count ? 1 : a.count > b.count ? -1 : 0 }
};