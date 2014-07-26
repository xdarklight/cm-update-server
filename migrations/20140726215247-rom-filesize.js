module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addColumn('Roms', 'fileSize', {
				type: DataTypes.BIGINT.UNSIGNED,
				isNull: true,
		});

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.removeColumn('Roms', 'fileSize');
		done();
	}
}
