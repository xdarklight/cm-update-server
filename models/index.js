var Sequelize = require('sequelize');
var config = require('config').Database;

var sequelize = new Sequelize(config.name, config.username, config.password, config.options);

module.exports.sequelize = sequelize;
module.exports.Device = sequelize.import(__dirname + '/device.js');
module.exports.Rom = sequelize.import(__dirname + '/rom.js');
module.exports.Download = sequelize.import(__dirname + '/download.js');

// Model relationships according to http://redotheweb.com/2013/02/20/sequelize-the-javascript-orm-in-practice.html.
(function(models) {
	models.Device.hasMany(models.Rom),
	models.Rom.belongsTo(models.Device),
	models.Rom.hasMany(models.Download)
	models.Download.belongsTo(models.Rom);
})(module.exports);
