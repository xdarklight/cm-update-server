module.exports = {
	up: function(migration, DataTypes, done) {
		migration.sequelize.query(
			'INSERT INTO RomVariants (DeviceId, subdirectory) SELECT DISTINCT DeviceId, subdirectory FROM Roms'
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.sequelize.query(
			'DELETE FROM RomVariants'
		);

		done()
	}
}
