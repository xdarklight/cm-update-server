module.exports = {

	up: function(migration, DataTypes, done) {
		migration.addColumn(
			'Roms',
			'targetFilesZipName',
			{
				type: DataTypes.STRING(32),
				isNull: true,
			}
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.removeColumn('Roms', 'targetFilesZipName')
		done()
	}
}
