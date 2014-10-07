var fsextra = require('fs-extra');
var path = require('path');
var async = require('async');
var wintersmith = require('wintersmith');
var config = require('config').Website;
var models = require('./models/');
var ResultConverter = require('./result-converter.js');

models.sequelize.sync().success(function() {

	var deviceJsonPath = path.join(config.contents, 'devices');
	var statsJsonPath = path.join(config.contents, 'stats');

	if (fsextra.existsSync(deviceJsonPath)) {
		fsextra.removeSync(deviceJsonPath);
	}

	if (fsextra.existsSync(statsJsonPath)) {
		fsextra.removeSync(statsJsonPath);
	}

	fsextra.ensureDirSync(deviceJsonPath);
	fsextra.ensureDirSync(statsJsonPath);
	fsextra.ensureDirSync(config.output);

	async.waterfall([
		function(waterfallCallback) {
			models.Device.findAll({ order: 'name ASC' }).complete(function(error, devices) {
				waterfallCallback(error, devices);
			});
		},

		function(devices, waterfallCallback) {
			var totalDownloadStats = { template: 'statistics.jade', filename: '/stats.html', statistics: [] };

			async.each(devices, function(device, eachCallback) {
				async.parallel([
					function(parallelCallback) {
						var deviceValues = device.toJSON();
						deviceValues.template = 'device.jade';
						deviceValues.filename = '/device-' + device.name + '.html';

						models.Rom.findAll({
							include: [
								{
									model: models.RomVariant,
									include: [
										{
											model: models.Device,
											where: {
												id: device.id,
											}
										}
									]
								}
							],
							where: {
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

							fsextra.writeJSONSync(path.join(deviceJsonPath, device.name + '.json'), deviceValues);

							parallelCallback(err, device.name);
						});
					},

					function(parallelCallback) {
						async.times(7, function(n, timesCallback) {
							var date = new Date();
							date.setHours(0, 0, 0, 0);
							date.setDate(date.getDate() - n);

							var dateEnd = new Date(date);
							dateEnd.setHours(23, 59, 59);

							async.parallel([
								function(parallelInTimesCallback) {
									parallelInTimesCallback(null, date);
								},

								function(parallelInTimesCallback) {
									models.Download.count({
										include: [
											{
												model: models.Rom,
												include: {
													model: models.RomVariant,
													include: [
														{
															model: models.Device,
														where: {
																id: device.id,
															}
														}
													]
												}
											},
										],
										where: [
											{
												createdAt: {
													between: [ date, dateEnd ]
												}
											}
										],
										group: [
											[ models.sequelize.fn('strftime', '"%Y-%m-%d", timestamp') ],
										],
									}).complete(function(err, fullDownloads) {
										parallelInTimesCallback(err, fullDownloads);
									});
								},

								function(parallelInTimesCallback) {
									models.Download.count({
										include: [
											{
												model: models.Incremental,
												include: {
													model: models.RomVariant,
													include: [
														{
															model: models.Device,
															where: {
																id: device.id,
															}
														}
													]
												}
											},
										],
										where: [
											{
												createdAt: {
													between: [ date, dateEnd ]
												}
											}
										],
										group: [
											[ models.sequelize.fn('strftime', '"%Y-%m-%d", timestamp') ],
										],
									}).complete(function(err, incrementalDownloads) {
										parallelInTimesCallback(err, incrementalDownloads);
									});
								},
							], timesCallback);
						}, parallelCallback);
					}
				], function(err, results) {
					var deviceStats = { device: results[0], downloads: {} }

					results[1].forEach(function(downloadsPerDay) {
						deviceStats.downloads[downloadsPerDay[0].getTime()] = {
							full: downloadsPerDay[1],
							incremental: downloadsPerDay[2] };
					});

					totalDownloadStats.statistics.push(deviceStats);
					eachCallback(err);
				});
			}, function(err) {
				fsextra.writeJSONSync(path.join(statsJsonPath, 'totaldownloads.json'), totalDownloadStats);
				waterfallCallback(err);
			});
		},

		function(waterfallCallback) {
			wintersmith(config).build(waterfallCallback);
		},
	], function(err) {
		if (err) {
			console.log('ERROR while building website: ' + err);
		} else {
			console.log('Finished building website!');
		}
	});
});
