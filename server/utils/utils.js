module.exports = function () {
	Array.prototype.contains = Array.prototype.contains || function (obj) {
			var i, l = this.length;
			for (i = 0; i < l; i++) {
				if (this[i] == obj) return true;
			}
			return false;
		};
	Array.prototype.containsObjectId = Array.prototype.containsObjectId || function (objIdInstance) {
			var i, l = this.length;
			for (i = 0; i < l; i++) {
				if (this[i].equals(objIdInstance)) return true;
			}
			return false;
		};
	Array.prototype.containsWord = Array.prototype.containsWord || function (word) {
			var i, l = this.length;
			for (i = 0; i < l; i++) {
				if (this[i].word === word) return true;
			}
			return false;
		};
	Array.prototype.hasEntry = Array.prototype.hasEntry || function (item) {
			return this.indexOf(item) !== -1;
		};

	// stops include all English pro-nouns, 100 common verbs (+ conjugation), digits, single letters, other common stop words
	var stops = ['\\w{1}', '\\d+', 'having', 'whose', 'whomever', 'whoever', 'whichever', 'whatever', 'those', 'themselves', 'theirs', 'something', 'someone', 'somebody', 'several', 'ourselves', 'ours', 'nothing', 'nobody', 'none', 'one', 'myself', 'much', 'more', 'mine', 'many', 'itself', 'himself', 'herself', 'few', 'everything', 'everyone', 'everybody', 'each', 'both', 'anybody', 'another', 'anyone', 'anything', 'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'others', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'],
		verbs = ['be', 'were', 'been', 'have', 'had', 'do', 'did', 'done', 'say', 'said', 'go', 'went', 'gone', 'get', 'got', 'make', 'made', 'know', 'knew', 'known', 'think', 'thought', 'take', 'took', 'taken', 'see', 'saw', 'seen', 'came', 'come', 'want', 'wanted', 'use', 'used', 'find', 'found', 'give', 'gave', 'given', 'tell', 'told', 'work', 'worked', 'call', 'called', 'try', 'tried', 'ask', 'asked', 'need', 'needed', 'feel', 'felt', 'became', 'become', 'leave', 'left', 'put', 'mean', 'meant', 'keep', 'kept', 'let', 'begin', 'began', 'begun', 'seem', 'seemed', 'help', 'helped', 'show', 'showed', 'shown', 'hear', 'heard', 'play', 'played', 'ran', 'run', 'move', 'moved', 'live', 'lived', 'believe', 'believed', 'bring', 'brought', 'happen', 'happened', 'write', 'wrote', 'written', 'sit', 'sat', 'stand', 'stood', 'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued', 'set', 'learn', 'learnt', 'learned', 'change', 'changed', 'lead', 'led', 'understand', 'understood', 'watch', 'watched', 'follow', 'followed', 'stop', 'stopped', 'create', 'created', 'speak', 'spoke', 'spoken', 'read', 'spend', 'spent', 'grow', 'grew', 'grown', 'open', 'opened', 'walk', 'walked', 'win', 'won', 'teach', 'taught', 'offer', 'offered', 'remember', 'remembered', 'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'serve', 'served', 'die', 'died', 'send', 'sent', 'build', 'built', 'stay', 'stayed', 'fall', 'fell', 'fallen', 'cut', 'reach', 'reached', 'kill', 'killed', 'raise', 'raised', 'pass', 'passed', 'sell', 'sold', 'decide', 'decided', 'return', 'returned', 'explain', 'explained', 'hope', 'hoped', 'develop', 'developed', 'carry', 'carried', 'break', 'broke', 'broken', 'receive', 'received', 'agree', 'agreed', 'support', 'supported', 'hit', 'produce', 'produced', 'eat', 'ate', 'eaten', 'cover', 'covered', 'catch', 'caught', 'draw', 'drew', 'drawn', 'choose', 'chose', 'chosen'],
		fullStops = stops.concat(verbs);

	var utils = {
		boundedStopsRegex: new RegExp('\\b' + fullStops.join('\\b|\\b') + '\\b', 'g'),
		wordsOnlyRegex: new RegExp('[^\\w\\s]+', 'g'),
		multiSpace: new RegExp('\\s{2,}', 'g'),
		stringToWordArray: (str) => {
			try {
				return str.toLowerCase()
					.replace(utils.wordsOnlyRegex, ' ')
					.replace(utils.boundedStopsRegex, '')
					.replace(utils.multiSpace, ' ')
					.split(' ');
			} catch (ex) {
				return [];
			}
		}
	};
	return utils;
};


