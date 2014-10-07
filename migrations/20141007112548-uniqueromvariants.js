module.exports = {
	up: function(migration, DataTypes, done) {
		migration.removeIndex('Incrementals', 'Incrementals_UniqueFilePerDirectory');

		migration.addIndex(
			'Incrementals',
			[ 'RomVariantId', 'filename' ],
			{
				indexName: 'Incrementals_UniqueFilePerRomVariant',
				indicesType: 'UNIQUE',
			}
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.removeIndex('Incrementals', 'Incrementals_UniqueFilePerRomVariant');

		migration.addIndex(
			'Incrementals',
			[ 'subdirectory', 'filename' ],
			{
				indexName: 'Incrementals_UniqueFilePerDirectory',
				indicesType: 'UNIQUE',
			}
		);

		done()
	}
}
