var fsextra = require('fs-extra');
var path = require('path');
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

	models.Device.findAll({ order: 'name ASC' }).success(function(devices) {
		devices.forEach(function(device) {
			var deviceValues = device.toJSON();
			deviceValues.template = 'device.jade';
			deviceValues.filename = '/device-' + device.name + '.html';

			models.Rom.findAll({
				where: {
					DeviceId: device.id,
					isActive: true,
				},
				order: 'createdAt DESC',
			}).success(function(roms) {
				deviceValues.roms = [];

				roms.forEach(function(rom) {
					var romValues = rom.toJSON();
					romValues.downloadUrl = ResultConverter.getRomDownloadUrl(rom);

					deviceValues.roms.push(romValues);
				});

				fsextra.writeFileSync(path.join(deviceJsonPath, device.id + '.json'), JSON.stringify(deviceValues));
			});
		});
	});

	var env = wintersmith(config);

	env.build(function(error) {
		if (error) {
			throw error;
		}

		console.log('Finished building website!');
	});
});
