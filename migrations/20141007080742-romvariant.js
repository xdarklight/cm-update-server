module.exports = {
	up: function(migration, DataTypes, done) {
		migration.createTable('RomVariants', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			subdirectory: {
				type: DataTypes.STRING(255),
				notEmpty: false,
			},
			DeviceId: {
				type: DataTypes.INTEGER,
				references: "Devices",
				referencesKey: "id",
			},
			displayName: {
				type: DataTypes.STRING(255),
			},
			createdAt: {
				type: DataTypes.DATE,
			},
			updatedAt: {
				type: DataTypes.DATE,
			},
		});

		migration.addColumn('Roms', 'RomVariantId', {
				type: DataTypes.INTEGER,
				references: "RomVariants",
				referencesKey: "id",
		});

		migration.addColumn('Incrementals', 'RomVariantId', {
				type: DataTypes.INTEGER,
				references: "RomVariants",
				referencesKey: "id",
		});

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.removeColumn('Roms', 'RomVariantId');
		migration.removeColumn('Incrementals', 'RomVariantId');
		migration.dropTable('RomVariants');

		done()
	}
}
