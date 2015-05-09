module.exports = {
	up: function(migration, DataTypes, done) {
		migration.sequelize.query(
			'UPDATE Incrementals SET RomVariantId = (SELECT rv.id FROM RomVariants rv WHERE rv.DeviceId = (SELECT r.DeviceId FROM Roms r WHERE r.id = Incrementals.sourceRomId) AND (rv.subdirectory = Incrementals.subdirectory OR (Incrementals.subdirectory IS NULL AND rv.subdirectory IS NULL)))'
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.sequelize.query(
			'UPDATE Incrementals SET subdirectory = (SELECT rv.subdirectory FROM RomVariants rv WHERE rv.id = Incrementals.RomVariantId)'
		);

		done()
	}
}
