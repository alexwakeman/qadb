(function () {
	Array.prototype.contains = Array.prototype.contains || function (obj) {
			var i, l = this.length;
			for (i = 0; i < l; i++) {
				if (this[i] == obj) return true;
			}
			return false;
		};
	Array.prototype.containsWordObj = Array.prototype.containsWordObj || function (obj) {
			var i, l = this.length;
			for (i = 0; i < l; i++) {
				if (this[i].word === obj.word) return true;
			}
			return false;
		};
})();
module.exports = {};

