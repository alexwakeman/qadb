module.exports = function (modLib) {
	var db = modLib.db;
	var boundedStops = ["\\b\\d+\\b", "\\ba\\b", "\\bable\\b", "\\babout\\b", "\\bacross\\b", "\\bafter\\b", "\\ball\\b", "\\balmost\\b", "\\balso\\b", "\\bam\\b", "\\bamong\\b", "\\ban\\b", "\\band\\b", "\\bany\\b", "\\bare\\b", "\\bas\\b", "\\bat\\b", "\\bbe\\b", "\\bbecause\\b", "\\bbeen\\b", "\\bbut\\b", "\\bby\\b", "\\bcan\\b", "\\bcannot\\b", "\\bcould\\b", "\\bdear\\b", "\\bdid\\b", "\\bdo\\b", "\\bdoes\\b", "\\beither\\b", "\\belse\\b", "\\bever\\b", "\\bevery\\b", "\\bfor\\b", "\\bfrom\\b", "\\bget\\b", "\\bgot\\b", "\\bhad\\b", "\\bhas\\b", "\\bhave\\b", "\\bhe\\b", "\\bher\\b", "\\bhers\\b", "\\bhim\\b", "\\bhis\\b", "\\bhow\\b", "\\bhowever\\b", "\\bi\\b", "\\bif\\b", "\\bin\\b", "\\binto\\b", "\\bis\\b", "\\bit\\b", "\\bits\\b", "\\bjust\\b", "\\bleast\\b", "\\blet\\b", "\\blike\\b", "\\blikely\\b", "\\bmay\\b", "\\bme\\b", "\\bmight\\b", "\\bmost\\b", "\\bmust\\b", "\\bmy\\b", "\\bneither\\b", "\\bno\\b", "\\bnor\\b", "\\bnot\\b", "\\bof\\b", "\\boff\\b", "\\boften\\b", "\\bon\\b", "\\bonly\\b", "\\bor\\b", "\\bother\\b", "\\bour\\b", "\\bown\\b", "\\brather\\b", "\\bsaid\\b", "\\bsay\\b", "\\bsays\\b", "\\bshe\\b", "\\bshould\\b", "\\bsince\\b", "\\bso\\b", "\\bsome\\b", "\\bthan\\b", "\\bthat\\b", "\\bthe\\b", "\\btheir\\b", "\\bthem\\b", "\\bthen\\b", "\\bthere\\b", "\\bthese\\b", "\\bthey\\b", "\\bthis\\b", "\\btis\\b", "\\bto\\b", "\\btoo\\b", "\\btwas\\b", "\\bus\\b", "\\bwants\\b", "\\bwas\\b", "\\bwe\\b", "\\bwere\\b", "\\bwhat\\b", "\\bwhen\\b", "\\bwhere\\b", "\\bwhich\\b", "\\bwhile\\b", "\\bwho\\b", "\\bwhom\\b", "\\bwhy\\b", "\\bwill\\b", "\\bwith\\b", "\\bwould\\b", "\\byet\\b", "\\byou\\b", "\\byour\\b"];
	var boundedStopsRegex = new RegExp(boundedStops.join('|'), 'g');
	var wordsOnlyRegex = new RegExp('[^\\w\\s\\d]+', 'g'); // words, digits and whitespace only
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
			var synonyms = [];
			var inputWordIndexMatches = [];

			inputString = inputString.toLowerCase();
			inputString = inputString.replace(boundedStopsRegex, ''); // remove unnecessary words (stop words)
			inputString = inputString.replace(wordsOnlyRegex, ''); // remove all non-alpha chars
			input = inputString.split(' ');
			input.forEach((word) => wordIndexLookups.push(db.asyncFindOneByObject('word_index_copy', {word: word})));
			return Promise
				.all(wordIndexLookups)
				.then((wordIndexDocs) => {
					inputWordIndexMatches = wordIndexDocs.filter((entry) => entry); // ensure each entry is valid (exists)
					if (inputWordIndexMatches.length === 0) throw new Error('No records found');
					return inputWordIndexMatches;
				})
				.then(extractSortedContentRefs)
				.then(extractContent)
				.then((content) => content.forEach((qaEntry) => resultObj.data.qaResults.push(qaEntry)))
				.then(() => {
					inputWordIndexMatches.forEach((wordIndexDoc) => {
						if (!wordIndexDoc.synonyms) return false;
						Object.keys(wordIndexDoc.synonyms).forEach((key) => {
							var synonymObj;
							if (!~input.indexOf(key)) { // ensure the entry is not an input word
								synonymObj = wordIndexDoc.synonyms[key];
								synonyms.push(synonymObj);
							}
						});
					});
					if (synonyms.length) {
						synonyms.sort(sortByCount);
						resultObj.data.synonyms = synonyms;
					}
					if (resultObj.data.qaResults.length < 10 && synonyms.length) { // if lacking results, and have synonyms
						synonyms = synonyms.slice(0, Math.max(1, Math.min(5, Math.abs(synonyms.length / 2)))); // only take first half of sorted synonyms - don't want too many
						synonyms.forEach((synonym) => synonymWordIndexLookups.push(db.asyncFindOneByObject('word_index_copy', { word: synonym.word } )));
						return Promise.all(synonymWordIndexLookups);
					}
				})
				.then((synonymMatches) => synonymMatches ? synonymMatches.filter((match) => match) : [])
				.then(extractSortedContentRefs)
				.then(extractContent)
				.then((content) => {
					content.forEach((qaEntry) => resultObj.data.qaResults.push(qaEntry));
					return resultObj;
				});
		},

		suggest: function (input) {
			input = input.replace(wordsOnlyRegex, '');
			return Promise.resolve(db.asyncFindAllByObject('content', { 'question': { $regex: '^' + input + '.*', $options: 'i' } }, 5))
				.then((results) => {
					return {
						data: results
					}
				});
		}
	};

	/**
	 *
	 * Pure unions across each actual searched words are processed first. Then each of their synonym entries.
	 * This is to ensure pure unions are at the top of the stack.
	 *
	 * @param wordIndexDocs
	 * @returns {{results: Array}|Array}
	 */
	function extractSortedContentRefs(wordIndexDocs) {
		var distinctEntries = [], nonDistinctEntries = [], filteredDistinct;
		if (!wordIndexDocs || wordIndexDocs.length === 0) {
			return [];
		}
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
			return !~nonDistinctEntries.indexOf(entry); // remove duplicates
		});
		nonDistinctEntries = nonDistinctEntries.concat(filteredDistinct);
		return { results: nonDistinctEntries };
	}

	function extractContent(sortedContentRefs) {
		var contentLookups = [];
		if (!sortedContentRefs || sortedContentRefs.length === 0) {
			return contentLookups;
		}
		sortedContentRefs.results.forEach((matchRef) => {
			contentLookups.push(db.asyncFindOneByObject('content', {_id: matchRef}))
		});
		return Promise.all(contentLookups);
	}

	function sortByCount(a, b) {
		a.count = parseInt(a.count);
		b.count = parseInt(b.count);
		return a.count < b.count ? 1 : a.count > b.count ? -1 : 0
	}
};