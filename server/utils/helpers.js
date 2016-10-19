(function () {
	Array.prototype.contains = Array.prototype.contains || function (obj) {
			var i, l = this.length;
			for (i = 0; i < l; i++) {
				if (this[i] == obj) return true;
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
})();
module.exports = {};

