var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var RomVariant = sequelize.define('RomVariant', {
			subdirectory: {
				type: Sequelize.STRING(255),
				notEmpty: false,
			},
			displayName: {
				type: Sequelize.STRING(255),
			},
	});

	return RomVariant;
}
