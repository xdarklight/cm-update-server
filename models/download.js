var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Download = sequelize.define('Download', {
		// No special fields needed, sequelize automatically adds a "createdAt" field.
	}, {
		validate: {
			romIdValid : function() {
				if (!this.RomId || this.RomId < 0) {
					throw new Error('RomId is a mandatory field!');
				}
			},
		}
	});

	return Download;
}
