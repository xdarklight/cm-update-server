var Sequelize = require('sequelize');
var config = require('config').Database;

var sequelize = new Sequelize(config.name, config.username, config.password, config.options);

module.exports.sequelize = sequelize;
module.exports.Device = sequelize.import(__dirname + '/device.js');
module.exports.Rom = sequelize.import(__dirname + '/rom.js');
module.exports.Download = sequelize.import(__dirname + '/download.js');
module.exports.Incremental = sequelize.import(__dirname + '/incremental.js');

// Model relationships according to http://redotheweb.com/2013/02/20/sequelize-the-javascript-orm-in-practice.html.
(function(models) {
	models.Device.hasMany(models.Rom);
	models.Rom.belongsTo(models.Device);
	models.Rom.hasMany(models.Download);
	models.Download.belongsTo(models.Rom);
	models.Rom.hasOne(models.Rom, { as: 'parentRom' });
	models.Rom.hasMany(models.Incremental, { as: 'sourceRom', foreignKey: 'sourceRomId' });
	models.Rom.hasMany(models.Incremental, { as: 'sourceRom', foreignKey: 'targetRomId' });
	models.Incremental.belongsTo(models.Rom, { as: 'sourceRom', foreignKey: 'sourceRomId' });
	models.Incremental.belongsTo(models.Rom, { as: 'targetRom', foreignKey: 'targetRomId' });
	models.Incremental.hasMany(models.Download);
	models.Download.belongsTo(models.Incremental);
})(module.exports);
