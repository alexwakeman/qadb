module.exports = function (modLib) {
	var db = modLib.db;
	var boundedStops = ["\\d+", "\\.", "\\,", "\\?", "\\!", "\\'", "\\,", "\\-", "\\:", "\\;", "\\ba\\b", "\\bable\\b", "\\babout\\b", "\\bacross\\b", "\\bafter\\b", "\\ball\\b", "\\balmost\\b", "\\balso\\b", "\\bam\\b", "\\bamong\\b", "\\ban\\b", "\\band\\b", "\\bany\\b", "\\bare\\b", "\\bas\\b", "\\bat\\b", "\\bbe\\b", "\\bbecause\\b", "\\bbeen\\b", "\\bbut\\b", "\\bby\\b", "\\bcan\\b", "\\bcannot\\b", "\\bcould\\b", "\\bdear\\b", "\\bdid\\b", "\\bdo\\b", "\\bdoes\\b", "\\beither\\b", "\\belse\\b", "\\bever\\b", "\\bevery\\b", "\\bfor\\b", "\\bfrom\\b", "\\bget\\b", "\\bgot\\b", "\\bhad\\b", "\\bhas\\b", "\\bhave\\b", "\\bhe\\b", "\\bher\\b", "\\bhers\\b", "\\bhim\\b", "\\bhis\\b", "\\bhow\\b", "\\bhowever\\b", "\\bi\\b", "\\bif\\b", "\\bin\\b", "\\binto\\b", "\\bis\\b", "\\bit\\b", "\\bits\\b", "\\bjust\\b", "\\bleast\\b", "\\blet\\b", "\\blike\\b", "\\blikely\\b", "\\bmay\\b", "\\bme\\b", "\\bmight\\b", "\\bmost\\b", "\\bmust\\b", "\\bmy\\b", "\\bneither\\b", "\\bno\\b", "\\bnor\\b", "\\bnot\\b", "\\bof\\b", "\\boff\\b", "\\boften\\b", "\\bon\\b", "\\bonly\\b", "\\bor\\b", "\\bother\\b", "\\bour\\b", "\\bown\\b", "\\brather\\b", "\\bsaid\\b", "\\bsay\\b", "\\bsays\\b", "\\bshe\\b", "\\bshould\\b", "\\bsince\\b", "\\bso\\b", "\\bsome\\b", "\\bthan\\b", "\\bthat\\b", "\\bthe\\b", "\\btheir\\b", "\\bthem\\b", "\\bthen\\b", "\\bthere\\b", "\\bthese\\b", "\\bthey\\b", "\\bthis\\b", "\\btis\\b", "\\bto\\b", "\\btoo\\b", "\\btwas\\b", "\\bus\\b", "\\bwants\\b", "\\bwas\\b", "\\bwe\\b", "\\bwere\\b", "\\bwhat\\b", "\\bwhen\\b", "\\bwhere\\b", "\\bwhich\\b", "\\bwhile\\b", "\\bwho\\b", "\\bwhom\\b", "\\bwhy\\b", "\\bwill\\b", "\\bwith\\b", "\\bwould\\b", "\\byet\\b", "\\byou\\b", "\\byour\\b"];
	var boundedStopsRegex = new RegExp(boundedStops.join('|'), 'g');

	return {
		performSearch: function (inputString) {
			// split words, remove stops
			// extract any matches from word_index
			// fetch list of Q&A references
			// look for unions amongst word matches
			// check synonyms - look for unions here too
			// rank according to word count (and likes?)
			var input;
			inputString = inputString.toLowerCase();
			inputString = inputString.replace(boundedStopsRegex, '');
			input = inputString.split(' ');

			return new Promise((resolve, reject) => {
				var wordIndexLookups = [], priorityLookups = [], singleWordLookups = [];
				var sortedEntries;
				input.forEach((word) => wordIndexLookups.push(db.asyncFindOneByObject('word_index', { word: word })));
				Promise
					.all(wordIndexLookups)
					.then((wordIndexDocs) => sortedEntries = sortResults(wordIndexDocs))
					.then(() => {
						sortedEntries.priorityMatches.forEach((matchRef) => priorityLookups.push(db.asyncFindOneByObject('content', { _id: matchRef })));
						return Promise.all(priorityLookups);
					})
					.then((priorityQAResults) => {

					});
			})
		}
	};

	function sortResults(wordIndexDocs) {
		var distinctEntries = [], nonDistinctEntries = [], synonymList = [];
		// sort the word index list according to count of occurrences across the data set
		wordIndexDocs.sort(sortByCount);
		wordIndexDocs.forEach((wordIndexDoc) => {
			wordIndexDoc.conten_refs.forEach((contentRef) => {
				~ distinctEntries.indexOf(contentRef) ? distinctEntries.push(contentRef) : nonDistinctEntries.push(contentRef);
			});
			if (wordIndexDoc.synonyms) {
				Object.keys(wordIndexDoc.synonyms).forEach((key) => {
					var synonymObj = wordIndexDoc.synonyms[key];
					var reference = synonymObj.references[0];
					~ distinctEntries.indexOf(reference) ? distinctEntries.push(reference) : null;
					synonymList.push({synonym: synonymObj.word, count: synonymObj.count});
				});
				synonymList.sort(sortByCount);
			}
		});

		return { priorityMatches: nonDistinctEntries, singleWordMatches: distinctEntries, synonymList: synonymList };
	}

	function sortByCount(a, b) => { return a.count < b.count ? -1 : a.count > b.count ? 1 : 0 }
};