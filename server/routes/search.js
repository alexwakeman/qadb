
module.exports = function(modLib) {
	modLib.router.route('/suggest')
		.get(modLib.authChecker, function (req, res) {
			var query = req.query.input;
			modLib.searchUtils.suggest(query)
				.then((results) => {
					res.json(results);
				}, () => {
					res.send('');
				});
		});
	modLib.router.route('/search')
		.get(modLib.authChecker, function (req, res) {
			var query = req.query.input;
			modLib.searchUtils.performSearch(query)
				.then((results) => {
					res.json(results);
				}, () => {
					res.send('');
				});
		});
	return modLib.router;
};
