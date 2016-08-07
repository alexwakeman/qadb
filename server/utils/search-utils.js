module.exports = function(modLib) {
	var db = modLib.db;

	return {
		performSearch: function(inputString) {
			// split words, remove stops
			// extract any matches from word_index
			// fetch list of Q&A references
			// look for unions amongst word matches
			// check synonyms - look for unions here too
			// rank according to word count (and likes?)
		}
	}
};