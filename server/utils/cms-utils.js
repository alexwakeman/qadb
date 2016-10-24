/*
 See helpers.js for the Array.prototype augmentations used here
 */
module.exports = function(modLib) {
	if (!modLib) throw new Error('Module Library is missing.');

	var db = modLib.db,
		config = modLib.config,
		// stops include all English pro-nouns, 100 common verbs (+ conjugation), digits, single letters, other common stop words
		stops = ['\\w{1}', '\\d+', 'having', 'whose', 'whomever', 'whoever', 'whichever', 'whatever', 'those', 'themselves', 'theirs', 'something', 'someone', 'somebody', 'several', 'ourselves', 'ours', 'nothing', 'nobody', 'none', 'one', 'myself', 'much', 'more', 'mine', 'many', 'itself', 'himself', 'herself', 'few', 'everything', 'everyone', 'everybody', 'each', 'both', 'anybody', 'another',  'anyone', 'anything',  'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'others', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'],
		verbs = ['be', 'were', 'been', 'have', 'had', 'do', 'did', 'done', 'say', 'said', 'go', 'went', 'gone', 'get', 'got', 'make', 'made', 'know', 'knew', 'known', 'think', 'thought', 'take', 'took', 'taken', 'see', 'saw', 'seen', 'came', 'come', 'want', 'wanted', 'use', 'used', 'find', 'found', 'give', 'gave', 'given', 'tell', 'told', 'work', 'worked', 'call', 'called', 'try', 'tried', 'ask', 'asked', 'need', 'needed', 'feel', 'felt', 'became', 'become', 'leave', 'left', 'put', 'mean', 'meant', 'keep', 'kept', 'let', 'begin', 'began', 'begun', 'seem', 'seemed', 'help', 'helped', 'show', 'showed', 'shown', 'hear', 'heard', 'play', 'played', 'ran', 'run', 'move', 'moved', 'live', 'lived', 'believe', 'believed', 'bring', 'brought', 'happen', 'happened', 'write', 'wrote', 'written', 'sit', 'sat', 'stand', 'stood', 'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued', 'set', 'learn', 'learnt', 'learned', 'change', 'changed', 'lead', 'led', 'understand', 'understood', 'watch', 'watched', 'follow', 'followed', 'stop', 'stopped', 'create', 'created', 'speak', 'spoke', 'spoken', 'read', 'spend', 'spent', 'grow', 'grew', 'grown', 'open', 'opened', 'walk', 'walked', 'win', 'won', 'teach', 'taught', 'offer', 'offered', 'remember', 'remembered', 'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'serve', 'served', 'die', 'died', 'send', 'sent', 'build', 'built', 'stay', 'stayed', 'fall', 'fell', 'fallen', 'cut', 'reach', 'reached', 'kill', 'killed', 'raise', 'raised', 'pass', 'passed', 'sell', 'sold', 'decide', 'decided', 'return', 'returned', 'explain', 'explained', 'hope', 'hoped', 'develop', 'developed', 'carry', 'carried', 'break', 'broke', 'broken', 'receive', 'received', 'agree', 'agreed', 'support', 'supported', 'hit', 'produce', 'produced', 'eat', 'ate', 'eaten', 'cover', 'covered', 'catch', 'caught', 'draw', 'drew', 'drawn', 'choose', 'chose', 'chosen'],
		fullStops = stops.concat(verbs),
		boundedStopsRegex = new RegExp('\\b' + fullStops.join('\\b|\\b') + '\\b', 'g'),
		wordsOnlyRegex = new RegExp('[^\\w\\s]+', 'g'),
		multiSpace = new RegExp('\\s{2,}', 'g');

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
			.then(() => {
				return applyToWordIndex(contentData)
			})
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
							if (!wordIndexDoc.synonyms[i].references.contains(contentDoc._id)) {
								wordIndexDoc.synonyms[i].references.push(contentDoc._id)
							}
							wordIndexDoc.synonyms[i].count += 1;
						}
					});
					wordIndexUpdates.push(db.updateDocument(config.WORD_INDEX, wordIndexDoc));
					matches = null;
					checking = null;
				}
			}
		}
		return Promise.all(wordIndexUpdates);
	}

	function extractWordBag(doc) {
		var wordsFinal = [];
		var text = doc.question + ' ' + doc.answer;
		text = text.toLowerCase();
		text = text.replace(wordsOnlyRegex, ' ');
		text = text.replace(boundedStopsRegex, '');
		text = text.replace(multiSpace, ' ');
		text.split(' ').forEach((word) => {
			if (!wordsFinal.contains(word) && word) {
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
		var wordIndexLookups = [];
		words.forEach((word) => wordIndexLookups.push(db.find(config.WORD_INDEX, { word: word }, 1)));
		return Promise.all(wordIndexLookups);
	}

	function getContentDocs(idList) {
		var contentLookups = [];
		idList.forEach((id) => contentLookups.push(db.find(config.CONTENT, { _id: id }, 1)));
		return Promise.all(contentLookups)
	}

	function commonStrMatch(from, to) {
		var repeatedWordsList = [],
			singleUseWords = [];
		from = from.toLowerCase();
		from = from.replace(wordsOnlyRegex, ' ');
		from = from.replace(boundedStopsRegex, '');
		from = from.replace(multiSpace, ' ');
		to = to.toLowerCase();
		to = to.replace(wordsOnlyRegex, ' ');
		to = to.replace(boundedStopsRegex, '');
		to = to.replace(multiSpace, ' ');
		from = from.split(' ');
		to = to.split(' ');
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
		}
	}
};