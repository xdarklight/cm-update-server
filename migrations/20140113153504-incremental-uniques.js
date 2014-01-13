module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addIndex(
			'Incrementals',
			[ 'sourceRomId', 'targetRomId' ],
			{
				indexName: 'Incrementals_UniqueRomPair',
				indicesType: 'UNIQUE',
			}
		);

		migration.addIndex(
			'Incrementals',
			[ 'subdirectory', 'filename' ],
			{
				indexName: 'Incrementals_UniqueFilePerDirectory',
				indicesType: 'UNIQUE',
			}
		);

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.removeIndex('Incrementals', 'Incrementals_UniqueRomPair');
		migration.removeIndex('Incrementals', 'Incrementals_UniqueFilePerDirectory');
		done();
	}
}
