module.exports = {
	up: function(migration, DataTypes, done) {
		migration.addColumn('Downloads', 'IncrementalId', {
				type: DataTypes.INTEGER,
				references: "Incrementals",
				referencesKey: "id",
		});

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.removeColumn('Downloads', 'IncrementalId');
		done();
	}
}
