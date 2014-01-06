module.exports = {
	up: function(migration, DataTypes, done) {
		migration.createTable('Incrementals', {
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
		});

		migration.addIndex(
			'Roms',
			[ 'incrementalId' ],
			{
				indexName: 'Roms_FetchIncremental',
			}
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.dropTable('Incrementals');
		migration.removeIndex('Roms', 'Roms_FetchIncremental');

		done()
	}
}
