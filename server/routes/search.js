
module.exports = function(modLib) {
	if (!modLib) throw new Error('Module Library is missing.');
	modLib.router.route('/suggest/:input')
		.get((req, res) => {
			var query = req.params.input;
			modLib.searchUtils.suggest(query)
				.then((results) => res.json(results), () => res.json({}));
		});
	modLib.router.route('/search/:input/:page')
		.get((req, res) => {
			var query = req.params.input,
				page = parseInt(req.params.page);
			modLib.searchUtils.performSearch(query, page)
				.then((results) => res.json(results), () => res.send({ data: { qaResults: [] }}));
		});
	return modLib.router;
};
