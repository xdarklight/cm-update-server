module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addIndex(
			'Devices',
			[ 'name' ],
			{
				indexName: 'Devices_UniqueName',
				indicesType: 'UNIQUE',
			}
		);

		migration.addIndex(
			'Roms',
			[ 'DeviceId', 'isActive', 'updateChannel' ],
			{
				indexName: 'Roms_FetchUpdateListIndex',
			}
		);

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.removeIndex('Devices', 'Devices_UniqueName');
		migration.removeIndex('Roms', 'Roms_FetchUpdateListIndex');
		done();
	}
}
