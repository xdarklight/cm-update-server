module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addColumn('Downloads', 'userAgent', {
				type: DataTypes.TEXT,
				isNull: true,
		});

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.removeColumn('Downloads', 'userAgent');
		done();
	}
}
