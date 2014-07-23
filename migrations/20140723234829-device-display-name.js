module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addColumn('Devices', 'displayName', {
				type: DataTypes.STRING(255),
		});

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.removeColumn('Devices', 'displayName');
		done();
	}
}
