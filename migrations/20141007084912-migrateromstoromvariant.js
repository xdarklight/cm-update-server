module.exports = {
	up: function(migration, DataTypes, done) {
		migration.sequelize.query(
			'UPDATE Roms SET RomVariantId = (SELECT rv.id FROM RomVariants rv WHERE rv.DeviceId = Roms.DeviceId AND (rv.subdirectory = Roms.subdirectory OR (Roms.subdirectory IS NULL AND rv.subdirectory IS NULL)))'
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.sequelize.query(
			'UPDATE Roms SET subdirectory = (SELECT rv.subdirectory FROM RomVariants rv WHERE rv.id = Roms.RomVariantId), DeviceId = (SELECT rv.DeviceId FROM RomVariants rv WHERE rv.id = Roms.RomVariantId)'
		);

		done()
	}
}
