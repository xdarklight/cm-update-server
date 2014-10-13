module.exports = {

	up: function(migration, DataTypes, done) {
		migration.addColumn(
			'RomVariants',
			'name',
			{
				type: DataTypes.STRING(32),
				isNull: false,
			}
		);

		migration.addIndex(
			'RomVariants',
			[ 'name' ],
			{
				indexName: 'RomVariants_UniqueName',
				indicesType: 'UNIQUE',
			}
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.removeIndex('RomVariants', 'RomVariants_UniqueName');
		migration.removeColumn('RomVariants', 'name');

		done();
	}
}
