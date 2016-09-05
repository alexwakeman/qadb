module.exports = function (modLib) {
	var db = modLib.db;
	var boundedStops = ["\\b\\d+\\b", "\\ba\\b", "\\bable\\b", "\\babout\\b", "\\bacross\\b", "\\bafter\\b", "\\ball\\b", "\\balmost\\b", "\\balso\\b", "\\bam\\b", "\\bamong\\b", "\\ban\\b", "\\band\\b", "\\bany\\b", "\\bare\\b", "\\bas\\b", "\\bat\\b", "\\bbe\\b", "\\bbecause\\b", "\\bbeen\\b", "\\bbut\\b", "\\bby\\b", "\\bcan\\b", "\\bcannot\\b", "\\bcould\\b", "\\bdear\\b", "\\bdid\\b", "\\bdo\\b", "\\bdoes\\b", "\\beither\\b", "\\belse\\b", "\\bever\\b", "\\bevery\\b", "\\bfor\\b", "\\bfrom\\b", "\\bget\\b", "\\bgot\\b", "\\bhad\\b", "\\bhas\\b", "\\bhave\\b", "\\bhe\\b", "\\bher\\b", "\\bhers\\b", "\\bhim\\b", "\\bhis\\b", "\\bhow\\b", "\\bhowever\\b", "\\bi\\b", "\\bif\\b", "\\bin\\b", "\\binto\\b", "\\bis\\b", "\\bit\\b", "\\bits\\b", "\\bjust\\b", "\\bleast\\b", "\\blet\\b", "\\blike\\b", "\\blikely\\b", "\\bmay\\b", "\\bme\\b", "\\bmight\\b", "\\bmost\\b", "\\bmust\\b", "\\bmy\\b", "\\bneither\\b", "\\bno\\b", "\\bnor\\b", "\\bnot\\b", "\\bof\\b", "\\boff\\b", "\\boften\\b", "\\bon\\b", "\\bonly\\b", "\\bor\\b", "\\bother\\b", "\\bour\\b", "\\bown\\b", "\\brather\\b", "\\bsaid\\b", "\\bsay\\b", "\\bsays\\b", "\\bshe\\b", "\\bshould\\b", "\\bsince\\b", "\\bso\\b", "\\bsome\\b", "\\bthan\\b", "\\bthat\\b", "\\bthe\\b", "\\btheir\\b", "\\bthem\\b", "\\bthen\\b", "\\bthere\\b", "\\bthese\\b", "\\bthey\\b", "\\bthis\\b", "\\btis\\b", "\\bto\\b", "\\btoo\\b", "\\btwas\\b", "\\bus\\b", "\\bwants\\b", "\\bwas\\b", "\\bwe\\b", "\\bwere\\b", "\\bwhat\\b", "\\bwhen\\b", "\\bwhere\\b", "\\bwhich\\b", "\\bwhile\\b", "\\bwho\\b", "\\bwhom\\b", "\\bwhy\\b", "\\bwill\\b", "\\bwith\\b", "\\bwould\\b", "\\byet\\b", "\\byou\\b", "\\byour\\b"];
	var boundedStopsRegex = new RegExp(boundedStops.join('|'), 'g');
	var wordsOnlyRegex = new RegExp('[^\\w\\s\\d]+', 'g'); // find all non-words, non-digits and non-whitespace
	const synonymSearchThreshold = 4; // if less than synonymSearchThreshold results from direct matches from input, use synonym lookup
	const maxSynonymLookupResults = 50; // limit of synonym word referenced content
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

			if (!inputString || typeof inputString !== 'string') return Promise.resolve(resultObj);

			inputString = inputString.toLowerCase();
			inputString = inputString.replace(boundedStopsRegex, ''); // remove unnecessary words (stop words)
			inputString = inputString.replace(wordsOnlyRegex, ''); // remove all non-alpha chars

			if (!inputString) return Promise.resolve(resultObj);

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
							if (!itemInArray(key, input)) { // ensure the entry is not an input word
								synonymObj = wordIndexDoc.synonyms[key];
								synonyms.push(synonymObj);
							}
						});
					});
					if (synonyms.length) {
						synonyms.sort(sortByCount);
						resultObj.data.synonyms = synonyms;
					}
					/*
						** Important! **
						We only perform synonym word look-ups if results from user's actual input are lacking
					 */
					if (resultObj.data.qaResults.length < synonymSearchThreshold && synonyms.length) { // if lacking results, and have synonyms
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
			if (!input) return Promise.resolve({data: []});
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
	 * A factory function that limits the content refs for each word lookup if that word is from the synonyms list.
	 *
	 * Pure unions across each actual searched word are processed first. Then each of their synonym entries union.
	 *
	 * Unions (cross referenced content_refs) are marked as non-distinct, i.e. the entry appears more than once while cross-referencing.
	 *
	 * Distinction must be drawn between synonym cross-referencing and synonym look-ups. If the results from the user's input are low
	 * then synonym words are looked up independently of the user's input words. This tends to add a large bulk of results so, should be
	 * limited.
	 *
	 */
	function extractSortedContentRefs(wordIndexDocs) {
		var distinctEntries = [],
			nonDistinctEntries = [],
			filteredDistinct;
		if (!wordIndexDocs || wordIndexDocs.length === 0) {
			return [];
		}
		wordIndexDocs.sort(sortByCount);
		wordIndexDocs.forEach((wordIndexDoc) => {
			var len = wordIndexDoc.content_refs.length,
				cycles = Math.min(len, maxSynonymLookupResults);
			for (var i = 0; i < cycles; i++) {
				var contentRef = wordIndexDoc.content_refs[i],
					idString = contentRef.toString();
				itemInArray(idString, distinctEntries) ? itemInArray(idString, nonDistinctEntries) ?
					distinctEntries.push(idString) : nonDistinctEntries.push(idString) : distinctEntries.push(idString);
			}
		});

		filteredDistinct = distinctEntries.filter((entry) => {
			return ! itemInArray(entry, nonDistinctEntries); // remove duplicates
		});

		nonDistinctEntries = nonDistinctEntries.concat(filteredDistinct);
		return { results: nonDistinctEntries };
	}

	function itemInArray(item, array) {
		return array.indexOf(item) > -1; // cast to boolean
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