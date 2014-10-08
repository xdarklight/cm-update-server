module.exports = {
	up: function(migration, DataTypes, done) {
		migration.removeColumn('Incrementals', 'subdirectory');
		migration.removeColumn('Roms', 'subdirectory');
		migration.removeColumn('Roms', 'DeviceId');

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.addColumn('Roms', 'DeviceId', {
				type: DataTypes.INTEGER,
				references: "Devices",
				referencesKey: "id",
		});

		migration.addColumn('Roms', 'subdirectory', {
				type: DataTypes.STRING(255),
				notEmpty: false,
		});

		migration.addColumn('Incrementals', 'subdirectory', {
				type: DataTypes.STRING(255),
				notEmpty: false,
		});

		done()
	}
}
