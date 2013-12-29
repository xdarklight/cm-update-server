var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Download = sequelize.define('Download', {
			timestamp: {
				type: Sequelize.DATE,
			},
	});

	return Download;
}
