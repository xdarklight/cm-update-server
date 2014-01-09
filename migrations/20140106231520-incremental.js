module.exports = {
	up: function(migration, DataTypes, done) {
		migration.createTable('Incrementals', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			timestamp: {
				type: DataTypes.DATE,
				notNull: true,
			},
			filename: {
				type: DataTypes.STRING(255),
				notEmpty: true,
			},
			md5sum: {
				type: DataTypes.STRING(32),
				notEmpty: true,
			},
			subdirectory: {
				type: DataTypes.STRING(255),
				notEmpty: false,
			},
			sourceRomId: {
				type: DataTypes.INTEGER,
				references: "Roms",
				referencesKey: "id",
			},
			targetRomId: {
				type: DataTypes.INTEGER,
				references: "Roms",
				referencesKey: "id",
			},
			createdAt: {
				type: DataTypes.DATE,
			},
			updatedAt: {
				type: DataTypes.DATE,
			},
		});

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.dropTable('Incrementals');

		done()
	}
}
