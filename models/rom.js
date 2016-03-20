var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Rom = sequelize.define('Rom', {
			timestamp: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			md5sum: {
				type: Sequelize.STRING(32),
				allowNull: false,
				validate: {
					notEmpty: true,
				}
			},
			filename: {
				type: Sequelize.STRING(255),
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			updateChannel: {
				type: Sequelize.ENUM,
				values: [ 'stable', 'snapshot', 'RC', 'nightly', 'experimental' ],
				allowNull: false,
			},
			changelog: {
				type: Sequelize.TEXT,
			},
			apiLevel: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				validate: {
					min: 1,
				},
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			incrementalId: {
				type: Sequelize.STRING(32),
				allowNull: true,
			},
			targetFilesZipName: {
				type: DataTypes.STRING(32),
				allowNull: true,
			},
			sourceCodeTimestamp: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			fileSize: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: true,
			},
	}, {
		validate: {
			uniqueEnabledFilenamePerRomVariant : function() {
				var self = this;

				// Find all existing active roms for this filename with the same RomVariant.
				return Rom.count({
					where: {
						id: {
							$ne: self.id,
						},
						isActive: true,
						filename: self.filename,
					},
					include: [
						{
							model: sequelize.models.RomVariant,
							where: {
								id: self.RomVariantId,
							}
						}
					]
				}).then(function(totalExisting) {
					if (totalExisting > 0) {
						throw new Error('There are already ' + totalExisting + ' existing ROM matching ' + JSON.stringify(self.get({ plain: true })));
					}
				});
			},

			incrementalIdAndTargetFilesZipValid : function() {
				// Make sure that if incrementalId and targetfileszip are given that the latter one contains the first one.
				if (this.incrementalId && this.targetFilesZipName && this.targetFilesZipName.indexOf(this.incrementalId) == -1) {
					throw new Error(this.targetFilesZipName + " should contain the incrementalId: " + this.incrementalId);
				}
			}
		}
	});

	return Rom;
}
