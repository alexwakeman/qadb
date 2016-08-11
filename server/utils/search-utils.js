module.exports = function (modLib) {
	var db = modLib.db;
	var boundedStops = ["\\b\\d+\\b", "\\.", "\\,", "\\?", "\\!", "\\'", "\\,", "\\-", "\\:", "\\;", "\\ba\\b", "\\bable\\b", "\\babout\\b", "\\bacross\\b", "\\bafter\\b", "\\ball\\b", "\\balmost\\b", "\\balso\\b", "\\bam\\b", "\\bamong\\b", "\\ban\\b", "\\band\\b", "\\bany\\b", "\\bare\\b", "\\bas\\b", "\\bat\\b", "\\bbe\\b", "\\bbecause\\b", "\\bbeen\\b", "\\bbut\\b", "\\bby\\b", "\\bcan\\b", "\\bcannot\\b", "\\bcould\\b", "\\bdear\\b", "\\bdid\\b", "\\bdo\\b", "\\bdoes\\b", "\\beither\\b", "\\belse\\b", "\\bever\\b", "\\bevery\\b", "\\bfor\\b", "\\bfrom\\b", "\\bget\\b", "\\bgot\\b", "\\bhad\\b", "\\bhas\\b", "\\bhave\\b", "\\bhe\\b", "\\bher\\b", "\\bhers\\b", "\\bhim\\b", "\\bhis\\b", "\\bhow\\b", "\\bhowever\\b", "\\bi\\b", "\\bif\\b", "\\bin\\b", "\\binto\\b", "\\bis\\b", "\\bit\\b", "\\bits\\b", "\\bjust\\b", "\\bleast\\b", "\\blet\\b", "\\blike\\b", "\\blikely\\b", "\\bmay\\b", "\\bme\\b", "\\bmight\\b", "\\bmost\\b", "\\bmust\\b", "\\bmy\\b", "\\bneither\\b", "\\bno\\b", "\\bnor\\b", "\\bnot\\b", "\\bof\\b", "\\boff\\b", "\\boften\\b", "\\bon\\b", "\\bonly\\b", "\\bor\\b", "\\bother\\b", "\\bour\\b", "\\bown\\b", "\\brather\\b", "\\bsaid\\b", "\\bsay\\b", "\\bsays\\b", "\\bshe\\b", "\\bshould\\b", "\\bsince\\b", "\\bso\\b", "\\bsome\\b", "\\bthan\\b", "\\bthat\\b", "\\bthe\\b", "\\btheir\\b", "\\bthem\\b", "\\bthen\\b", "\\bthere\\b", "\\bthese\\b", "\\bthey\\b", "\\bthis\\b", "\\btis\\b", "\\bto\\b", "\\btoo\\b", "\\btwas\\b", "\\bus\\b", "\\bwants\\b", "\\bwas\\b", "\\bwe\\b", "\\bwere\\b", "\\bwhat\\b", "\\bwhen\\b", "\\bwhere\\b", "\\bwhich\\b", "\\bwhile\\b", "\\bwho\\b", "\\bwhom\\b", "\\bwhy\\b", "\\bwill\\b", "\\bwith\\b", "\\bwould\\b", "\\byet\\b", "\\byou\\b", "\\byour\\b"];
	var boundedStopsRegex = new RegExp(boundedStops.join('|'), 'g');

	return {
		performSearch: function (inputString) {
			// split words, remove stops
			// extract any matches from word_index
			// fetch list of Q&A references
			// look for unions amongst word matches
			// check synonyms - look for unions here too
			// rank according to word count (and likes?)
			var input,
				wordIndexLookups = [],
				contentLookups = [],
				resultObj = {
					data: {
						qaResults: [],
						synonyms: []
					}
				};
			inputString = inputString.toLowerCase();
			inputString = inputString.replace(boundedStopsRegex, '');
			input = inputString.split(' ');
			input.forEach((word) => wordIndexLookups.push(db.asyncFindOneByObject('word_index', { word: word })));

			return Promise
				.all(wordIndexLookups)
				.then(extractSortedContentRefs)
				.then((sortedContentRefs) => {
					sortedContentRefs.results.forEach((matchRef) => contentLookups.push(db.asyncFindOneByObject('content', { _id: matchRef })));
					resultObj.data.synonyms = sortedContentRefs.synonyms;
					return Promise.all(contentLookups);
				})
				.then((qaResults) => {
					qaResults.forEach((qaEntry) => {
						resultObj.data.qaResults.push(qaEntry)
					});
					return resultObj;
				});
		}
	};

	/**
	 * Sorts a set of content references from the word index, by checking for unions of content references
	 * within each word index entry. es distinct and non-distinct entries, where non-distinct means a union was found.
	 * This content is a better result. Also checks for each word's synonym matches, and uses these references as unions also.
	 *
	 * If there is not many results, we can look up the synonym in the word_index and use it's content references as well.
	 * @param wordIndexDocs
	 * @returns {{results: Array, synonyms: Array}}
	 */
	function extractSortedContentRefs(wordIndexDocs) {
		var distinctEntries = [], nonDistinctEntries = [], synonymList = [], filteredDistinct;
		wordIndexDocs.sort(sortByCount);
		wordIndexDocs.forEach((wordIndexDoc) => {
			wordIndexDoc.content_refs.forEach((contentRef) => {
				var idString = contentRef.toString();
				!~ distinctEntries.indexOf(idString) ? distinctEntries.push(idString) : nonDistinctEntries.push(idString);
			});
		});

		wordIndexDocs.forEach((wordIndexDoc) => {
			if (wordIndexDoc.synonyms) {
				Object.keys(wordIndexDoc.synonyms).forEach((key) => {
					var synonymObj = wordIndexDoc.synonyms[key];
					var reference = synonymObj.references[0].toString();
					// treat synonym cross-references as unions, i.e. high priority matches
					~ distinctEntries.indexOf(reference) ? nonDistinctEntries.push(reference) : null;
					synonymList.push({synonym: synonymObj.word, count: synonymObj.count});
				});
				synonymList.sort(sortByCount);
			}
		});

		filteredDistinct = distinctEntries.filter((entry) => {
			return ! ~ nonDistinctEntries.indexOf(entry); // remove duplicates
		});
		nonDistinctEntries.push(...filteredDistinct);
		return { results: nonDistinctEntries, synonyms: synonymList };
	}

	function sortByCount(a, b) { return a.count < b.count ? -1 : a.count > b.count ? 1 : 0 }
};