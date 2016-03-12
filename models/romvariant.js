var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var RomVariant = sequelize.define('RomVariant', {
			name: {
				type: Sequelize.STRING(32),
				unique: true,
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			subdirectory: {
				type: Sequelize.STRING(255),
			},
			displayName: {
				type: Sequelize.STRING(255),
			},
	});

	return RomVariant;
}
