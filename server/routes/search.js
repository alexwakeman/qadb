
module.exports = function(modLib) {
	modLib.router.route('/suggest')
		.get(function (req, res) {
			var query = req.query.input;
			modLib.searchUtils.suggest(query)
				.then((results) => {
					res.json(results);
				}, () => {
					res.json({});
				});
		});
	modLib.router.route('/search')
		.get(function (req, res) {
			var query = req.query.input;
			modLib.searchUtils.performSearch(query)
				.then((results) => {
					res.json(results);
				}, () => {
					res.send({data: {
						qaResults: []
					}});
				});
		});
	return modLib.router;
};
