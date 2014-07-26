module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addColumn('Incrementals', 'fileSize', {
				type: DataTypes.BIGINT.UNSIGNED,
				isNull: true,
		});

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.removeColumn('Incrementals', 'fileSize');
		done();
	}
}
