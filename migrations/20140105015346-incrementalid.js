module.exports = {

	up: function(migration, DataTypes, done) {
		migration.addColumn(
			'Roms',
			'incrementalId',
			{
				type: DataTypes.STRING(32),
				isNull: true,
			}
		);

		migration.addIndex(
			'Roms',
			[ 'incrementalId' ],
			{
				indexName: 'Roms_UniqueIncrementalId',
				indicesType: 'UNIQUE',
			}
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.removeIndex('Roms', 'Roms_UniqueIncrementalId');
		migration.removeColumn('Roms', 'incrementalId');

		done();
	}
}
