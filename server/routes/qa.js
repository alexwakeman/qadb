
module.exports = function(modLib) {
	if (!modLib) throw new Error('Module Library is missing.');
	modLib.router.route('/qa')
		.post(modLib.authChecker, (req, res) => {
			var doc = req.body;
			modLib.cmsUtils.mergeNew(doc)
				.then((id) => res.send(id), (error) => res.status(500).send(error.message));
		})
		.put(modLib.authChecker, (req, res) => {
			var doc = req.body;
			modLib.cmsUtils.mergeUpdate(doc)
				.then((id) => res.send(id), (error) => res.status(500).send(error.message));
		});
	modLib.router.route('/qa/page/:page')
		.get((req, res) => {
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
		.delete(modLib.authChecker, (req, res) => {
			var id = req.params.id;
			modLib.cmsUtils.remove(id)
				.then(() => res.send(id), (error) => res.status(500).send(error.message))
		});
	return modLib.router;
};
