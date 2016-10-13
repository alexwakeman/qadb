
// TODO: 1) merge new input with database data
// TODO: 2) update existing data with new data

module.exports = function(modLib) {
	if (!modLib) throw new Error('Module Library is missing.');

	var db = modLib.db;
	var config = modLib.config;
	return {
		mergeNew: (contentData) => {
			if (!contentData || (!contentData.hasOwnProperty('answer') || !contentData.hasOwnProperty('question'))) return false;
			contentData.word_bag = extractWordBag(contentData);
			contentData.likes = 0;
			contentData.dislikes = 0;
			db.addEntry(config.CONTENT, contentData)
				.then((doc) => {
					// now have an ID for this content

				});
		}
	};

	function extractWordBag(doc) {
		var wordsFinal = [];
		var stops = ['\\w{1}', '\\d+', 'having', 'whose', 'whomever', 'whoever', 'whichever', 'whatever', 'those', 'themselves', 'theirs', 'something', 'someone', 'somebody', 'several', 'ourselves', 'ours', 'nothing', 'nobody', 'none', 'one', 'myself', 'much', 'more', 'mine', 'many', 'itself', 'himself', 'herself', 'few', 'everything', 'everyone', 'everybody', 'each', 'both', 'anybody', 'another',  'anyone', 'anything',  'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'others', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'];
		var verbs = ['be', 'were', 'been', 'have', 'had', 'do', 'did', 'done', 'say', 'said', 'go', 'went', 'gone', 'get', 'got', 'make', 'made', 'know', 'knew', 'known', 'think', 'thought', 'take', 'took', 'taken', 'see', 'saw', 'seen', 'came', 'come', 'want', 'wanted', 'use', 'used', 'find', 'found', 'give', 'gave', 'given', 'tell', 'told', 'work', 'worked', 'call', 'called', 'try', 'tried', 'ask', 'asked', 'need', 'needed', 'feel', 'felt', 'became', 'become', 'leave', 'put', 'mean', 'meant', 'keep', 'kept', 'let', 'begin', 'began', 'begun', 'seem', 'seemed', 'help', 'helped', 'show', 'showed', 'shown', 'hear', 'heard', 'play', 'played', 'ran', 'run', 'move', 'moved', 'live', 'lived', 'believe', 'believed', 'bring', 'brought', 'happen', 'happened', 'write', 'wrote', 'written', 'sit', 'sat', 'stand', 'stood', 'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued', 'set', 'learn', 'learnt', 'learned', 'change', 'changed', 'lead', 'led', 'understand', 'understood', 'watch', 'watched', 'follow', 'followed', 'stop', 'stopped', 'create', 'created', 'speak', 'spoke', 'spoken', 'read', 'spend', 'spent', 'grow', 'grew', 'grown', 'open', 'opened', 'walk', 'walked', 'win', 'won', 'teach', 'taught', 'offer', 'offered', 'remember', 'remembered', 'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'serve', 'served', 'die', 'died', 'send', 'sent', 'build', 'built', 'stay', 'stayed', 'fall', 'fell', 'fallen', 'cut', 'reach', 'reached', 'kill', 'killed', 'raise', 'raised', 'pass', 'passed', 'sell', 'sold', 'decide', 'decided', 'return', 'returned', 'explain', 'explained', 'hope', 'hoped', 'develop', 'developed', 'carry', 'carried', 'break', 'broke', 'broken', 'receive', 'received', 'agree', 'agreed', 'support', 'supported', 'hit', 'produce', 'produced', 'eat', 'ate', 'eaten', 'cover', 'covered', 'catch', 'caught', 'draw', 'drew', 'drawn', 'choose', 'chose', 'chosen'];
		var fullStops = stops.concat(verbs);
		var boundedStopsRegex = new RegExp('\\b' + fullStops.join('\\b|\\b') + '\\b', 'g');
		var wordsOnlyRegex = new RegExp('[^\\w\\s]+', 'g');
		var multiSpace = new RegExp('\\s{2,}', 'g');
		var text = doc.question + ' ' + doc.answer;

		text = text.toLowerCase();
		text = text.replace(wordsOnlyRegex, ' ');
		text = text.replace(boundedStopsRegex, '');
		text = text.replace(multiSpace, ' ');
		text.split(' ').forEach(function(word) {
			if (wordsFinal.indexOf(word) === -1 && word) {
				wordsFinal.push(word);
			}
		});
		return wordsFinal;
	}

	function applyToWordIndex(doc) {
		doc.word_bag.forEach(function(word) {
			db.find(config.WORD_INDEX, {word: word}, 1)
				.then((wordIndexDoc) => {
					if (wordIndexDoc) {
						wordIndexDoc.count = wordIndexDoc.count + 1;
						if (wordIndexDoc.content_refs.indexOf(doc._id) === -1) {
							wordIndexDoc.content_refs.push(doc._id);
						}
						return db.updateEntry(config.WORD_INDEX, wordIndexDoc._id.toString(), wordIndexDoc);
					} else {
						return db.addEntry(config.WORD_INDEX, {
							word: word,
							count: 1,
							content_refs: [
								doc._id
							]
						});
					}
				});

		});
	}
};