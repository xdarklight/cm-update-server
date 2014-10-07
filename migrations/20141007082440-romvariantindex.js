module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addIndex(
			'RomVariants',
			[ 'subdirectory', 'DeviceId'],
			{
				indexName: 'RomVariants_UniqueSubdirectoryPerDevice',
				indicesType: 'UNIQUE',
			}
		);

		done()
	},

	down: function(migration, DataTypes, done) {
		migration.removeIndex('RomVariants', 'RomVariants_UniqueSubdirectoryPerDevice');

		done()
	}
}
