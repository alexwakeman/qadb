
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
			var id = req.query.input,
				doc = req.body.doc;
			modLib.db.updateEntry('content', id, doc)
				.then((id) => res.json({ data: id }),
					() => res.send('Could not update document.'));
		})
		.post(modLib.authChecker, (req, res) => {
			var doc = req.body.doc;
			modLib.db.addEntry('content', doc)
				.then((id) => res.json({ data: id }),
					() => res.send('Could not add new document.'));
		})
		.delete(modLib.authChecker, (req, res) => {
			var id = req.query.input;
			modLib.db.removeEntry('content', id)
				.then((results) => res.json({ data: results }),
					() => res.send('Unable to delete document.'));
		});
	return modLib.router;
};
