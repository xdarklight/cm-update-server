var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Download = sequelize.define('Download', {
		userAgent: {
			type: Sequelize.TEXT,
			isNull: true,
		},
	}, {
		validate: {
			romIdValid : function() {
				var hasRomId = this.RomId && this.RomId > 0;
				var hasIncrementalId = this.IncrementalId && this.IncrementalId > 0;

				// XOR -> only one can be true.
				if (hasRomId && hasIncrementalId) {
					throw new Error('Only "RomId" OR "IncrementalId" have to be set (NOT both)!');
				} else if (!hasRomId && !hasIncrementalId) {
					throw new Error('Either "RomId" OR "IncrementalId" has to be set!');
				}
			},
		}
	});

	return Download;
}
