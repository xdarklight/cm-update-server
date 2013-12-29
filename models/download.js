var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Download = sequelize.define('Download', {
			timestamp: {
				type: Sequelize.DATE,
			},
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
