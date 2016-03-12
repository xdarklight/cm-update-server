var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Incremental = sequelize.define('Incremental', {
			timestamp: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			filename: {
				type: Sequelize.STRING(255),
				validate: {
					notEmpty: true,
				},
			},
			md5sum: {
				type: Sequelize.STRING(32),
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			fileSize: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: true,
			},
	}, {
		validate: {
			romIdsValid : function() {
				if (!this.sourceRomId || this.sourceRomId < 0) {
					throw new Error('sourceRomId is a mandatory field! ' + JSON.stringify(this));
				}

				if (!this.targetRomId || this.targetRomId < 0) {
					throw new Error('targetRomId is a mandatory field! ' + JSON.stringify(this));
				}
			},
		}
	});

	return Incremental;
}
