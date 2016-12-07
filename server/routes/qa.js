
module.exports = function(modLib) {
	if (!modLib) throw new Error('Module Library is missing.');
	var authCheck = modLib.authChecker;
	modLib.router.route('/qa')
		.post(authCheck, (req, res) => {
			var doc = req.body;
			modLib.cmsUtils.mergeNew(doc)
				.then((id) => res.send(id), (error) => res.status(500).send(error.message));
		})
		.put(authCheck, (req, res) => {
			var doc = req.body;
			modLib.cmsUtils.mergeUpdate(doc)
				.then((id) => res.send(id), (error) => res.status(500).send(error.message));
		});
	modLib.router.route('/qa/page/:page')
		.get(authCheck, (req, res) => {
			var page = req.params.page;
			modLib.db.find('content', {}, 10, false, page)
				.then((results) => res.json({ data: results }), () => res.send('Unable to fetch document.'));
		});
	modLib.router.route('/qa/:id')
		.get((req, res) => {
			var id = req.params.id;
			modLib.db.find('content', {_id: id}, 1)
				.then((results) => res.json({ data: results }), () => res.send('Unable to fetch document.'));
		})
		.delete(authCheck, (req, res) => {
			var id = req.params.id;
			modLib.cmsUtils.remove(id)
				.then(() => res.send(id), (error) => res.status(500).send(error.message))
		});
	return modLib.router;
};
