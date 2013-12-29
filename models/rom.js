var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Rom = sequelize.define('Rom', {
			timestamp: {
				type: Sequelize.DATE,
				isNull: false,
			},
			md5sum: {
				type: Sequelize.STRING(32),
				notEmpty: true,
			},
			filename: {
				type: Sequelize.STRING(255),
				notEmpty: true,
			},
			updateChannel: {
				type: Sequelize.ENUM,
				values: [ 'stable', 'snapshot', 'RC', 'nightly' ],
				isNull: false,
			},
			changelog: {
				type: Sequelize.TEXT,
				notEmpty: false,
			},
			apiLevel: {
				type: Sequelize.INTEGER,
				isNull: false,
				min: 1,
			},
			subdirectory: {
				type: Sequelize.STRING(255),
				notEmpty: false,
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				isNull: false,
			},
	}, {
		validate: {
			uniqueEnabledFilenamePerSubdirectory : function() {
				var filterParameters = {
					DeviceId: this.DeviceId,
					filename: this.filename,
					subdirectory: this.subdirectory,
					isActive: true
				};

				// Find all existing active roms for this filename in the given subdirectory.
				Rom.count({
					where: filterParameters,
				}).success(function(totalExisting) {
					if (totalExisting > 1) {
						throw new Error('There are already ' + totalExisting + ' existing ROM for : ' + JSON.stringify(filterParameters));
					}
				});
			}
		}
	});

	return Rom;
}
