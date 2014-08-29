var fsextra = require('fs-extra');
var path = require('path');
var async = require('async');
var wintersmith = require('wintersmith');
var config = require('config').Website;
var models = require('./models/');
var ResultConverter = require('./result-converter.js');

models.sequelize.sync().success(function() {

	var deviceJsonPath = path.join(config.contents, 'devices');

	if (fsextra.existsSync(deviceJsonPath)) {
		fsextra.removeSync(deviceJsonPath);
	}

	fsextra.ensureDirSync(deviceJsonPath);
	fsextra.ensureDirSync(config.output);

	async.waterfall([
		function(waterfallCallback) {
			models.Device.findAll({ order: 'name ASC' }).complete(function(error, devices) {
				waterfallCallback(error, devices);
			});
		},

		function(devices, waterfallCallback) {
			async.each(devices, function(device, eachCallback) {
				var deviceValues = device.toJSON();
				deviceValues.template = 'device.jade';
				deviceValues.filename = '/device-' + device.name + '.html';

				models.Rom.findAll({
					where: {
						DeviceId: device.id,
						isActive: true,
					},
					order: 'createdAt DESC',
				}).complete(function(err, roms) {
					deviceValues.roms = [];

					roms.forEach(function(rom) {
						var romValues = rom.toJSON();
						romValues.downloadUrl = ResultConverter.getRomDownloadUrl(rom);
						romValues.md5sumUrl = ResultConverter.getRomMd5sumUrl(rom);

						deviceValues.roms.push(romValues);
					});

					fsextra.writeFileSync(path.join(deviceJsonPath, device.id + '.json'), JSON.stringify(deviceValues));

					eachCallback(err, null);
				});
			}, waterfallCallback);
		},


		function(waterfallCallback) {
			var env = wintersmith(config);

			env.build(function(error) {
				if (error) {
					console.log('ERROR while building website: ' + error);
				} else {
					console.log('Finished building website!');
				}

				waterfallCallback(error, null);
			});
		},
	]);
});
