module.exports = {

	up: function(migration, DataTypes, done) {
		migration.addColumn(
			'Incrementals',
			'isActive',
			{
				type: DataTypes.BOOLEAN,
				notNull: true,
			}
		);

		done();
	},

	down: function(migration, DataTypes, done) {
		migration.removeColumn('Incrementals', 'isActive');
		done();
	}
}
