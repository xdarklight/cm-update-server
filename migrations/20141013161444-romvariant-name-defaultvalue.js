module.exports = {
	up: function(migration, DataTypes, done) {
		migration.sequelize.query('UPDATE RomVariants SET name = id');
		done()
	},
	down: function(migration, DataTypes, done) {
		migration.sequelize.query('UPDATE RomVariants SET name = NULL');
		done()
	}
}
