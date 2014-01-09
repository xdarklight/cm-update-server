var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Rom = sequelize.define('Rom', {
			timestamp: {
				type: Sequelize.DATE,
				notNull: true,
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
				values: [ 'stable', 'snapshot', 'RC', 'nightly', 'experimental' ],
				notNull: true,
			},
			changelog: {
				type: Sequelize.TEXT,
				notEmpty: false,
			},
			apiLevel: {
				type: Sequelize.INTEGER.UNSIGNED,
				notNull: true,
				min: 1,
			},
			subdirectory: {
				type: Sequelize.STRING(255),
				notEmpty: false,
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				notNull: true,
			},
			incrementalId: {
				type: Sequelize.STRING(32),
				isNull: true,
			},
			targetFilesZipName: {
				type: DataTypes.STRING(32),
				isNull: true,
			},
			sourceCodeTimestamp: {
				type: Sequelize.DATE,
				isNull: true,
			},
	}, {
		validate: {
			deviceIdValid : function() {
				if (!this.DeviceId || this.DeviceId < 0) {
					throw new Error('DeviceId is a mandatory field!');
				}
			},
			uniqueEnabledFilenamePerSubdirectory : function() {
				var filterParameters = {
					id: {
						ne: this.id,
					},
					DeviceId: this.DeviceId,
					filename: this.filename,
					subdirectory: this.subdirectory,
					isActive: true
				};

				// Find all existing active roms for this filename in the given subdirectory.
				Rom.count({
					where: filterParameters,
				}).success(function(totalExisting) {
					if (totalExisting > 0) {
						throw new Error('There are already ' + totalExisting + ' existing ROM matching ' + JSON.stringify(filterParameters));
					}
				});
			},

			incrementalIdAndTargetFilesZipValid : function() {
				// Make sure that if incrementalId and targetfileszip are given that the latter one contains the first one.
				if (this.incrementalId && this.targetFilesZipName && this.targetFilesZipName.indexOf(buildInfo.incrementalId) == -1) {
					throw new Error(this.targetFilesZipName + " should contain the incrementalId: " + this.incrementalId);
				}
			}
		}
	});

	return Rom;
}
