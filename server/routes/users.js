var cryptPassword = require('../utils/crypto-utils').cryptPassword;

module.exports = function (modLib) {
	if (!modLib) throw new Error('Module Library is missing.');
	modLib.router.route('/users/current')
		.get(modLib.authChecker, (req, res) => res.json({data: req.session.user}));

	modLib.router.route('/users/logout')
		.get(modLib.authChecker, (req, res) => {
			req.session.destroy((error) => {
				if (error) {
					res.status(200).send('Problem logging user out.');
				}
				res.status(200).send('Logged out');
			});
		});

	modLib.router.route('/users')
		.get(modLib.authChecker, (req, res) => {
			var id = req.query.id;
			if (id) {
				modLib.db.find('users', {_id: id})
					.then((data) => {
						delete data.pw;
						res.json({data: data});
					}, () => res.status(404).send('User not found.'));
			}
			else {
				modLib.db.findAll('users')
					.then((data) => {
						if (data && Array.isArray(data)) {
							data.forEach((entry) => {
								delete entry.pw;
							});
						}
						res.json({data: data});
					}, (error) => res.status(500).send(error.message));
			}
		})
		.post(modLib.authChecker, (req, res) => {
			var input = req.body;
			cryptPassword(input.password, (error, pw) => {
				if (error) {
					res.status(500).send(error.message);
					return;
				}
				input.pw = pw;
				delete input.password; // must delete plain text version of password
				delete input._id; // remove the ID part (if present) as Mongo creates this
				modLib.db.addEntry('users', input)
					.then(() => res.status(200).send(''), (error) => res.status(500).send(error.message));
			});
		})
		.put(modLib.authChecker, function (req, res) {
			var input = req.body;
			var id = req.query.id;
			cryptPassword(input.password, function (error, pw) {
				if (error) {
					res.status(500).send(error.message);
					return;
				}
				delete input.password; // must delete plain text version of password
				input.pw = pw;
				modLib.db.updateEntry('users', id, input)
					.then(() => res.status(200).send(''), (error) => res.status(500).send(error.message));
			});
		})
		.delete(modLib.authChecker, function (req, res) {
			var id = req.query.id;
			modLib.db.removeEntry('users', id)
				.then(() => res.status(200).send(''), (error) => res.status(500).send(error.message));
		});
	return modLib.router;
};

