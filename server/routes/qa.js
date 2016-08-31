
module.exports = function(modLib) {
	modLib.router.route('/qa')
		.get(function (req, res) {
			var id = req.query.input;
			modLib.db.asyncFindOneByObject('content', {_id: id})
				.then((results) => {
					res.json({data: results });
				}, () => {
					res.send('');
				});
		});
	return modLib.router;
};
