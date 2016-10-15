
module.exports = function(modLib) {
	if (!modLib) throw new Error('Module Library is missing.');
	modLib.router.route('/qa')
		.get((req, res) => {
			var id = req.query.input;
			modLib.db.find('content', {_id: id}, 1)
				.then((results) => res.json({ data: results }),
					() => res.send('Unable to fetch document.'));
		})
		.put(modLib.authChecker, (req, res) => {
			var id = req.query.id,
				doc = req.body;
			modLib.cmsUtils.mergeUpdate(doc, id)
				.then(() => res.send(''), (error) => res.status(500).send(error.message));
		})
		.post(modLib.authChecker, (req, res) => {
			var doc = req.body;
			modLib.cmsUtils.mergeNew(doc)
				.then(() => res.send(''), (error) => res.status(500).send(error.message));
		})
		.delete(modLib.authChecker, (req, res) => {
			var id = req.query.input;

		});
	return modLib.router;
};
