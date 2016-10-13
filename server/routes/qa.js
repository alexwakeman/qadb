
module.exports = function(modLib) {
	modLib.router.route('/qa')
		.get(function (req, res) {
			var id = req.query.input;
			modLib.db.asyncFind('content', {_id: id}, 1)
				.then((results) => {
					res.json({ data: results });
				}, () => {
					res.send('');
				});
		})
		.put(function (req, res) {
			var id = req.query.input,
				doc = req.body.doc;
			modLib.db.asyncUpdateEntry('content', id, doc)
				.then((id) => {
					res.json({ data: id });
				}, () => {
					res.send('');
				});
		})
		.post(function (req, res) {
			var doc = req.body.doc;
			modLib.db.asyncUpdateEntry('content', id, doc)
				.then((id) => {
					res.json({ data: id });
				}, () => {
					res.send('');
				});
		})
		.delete(function (req, res) {

		});
	return modLib.router;
};
