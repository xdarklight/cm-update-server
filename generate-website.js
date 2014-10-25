var fsextra = require('fs-extra');
var path = require('path');
var async = require('async');
var wintersmith = require('wintersmith');
var config = require('config').Website;
var models = require('./models/');
var ResultConverter = require('./result-converter.js');

models.sequelize.sync().success(function() {

	var Directories = {
		deviceJsonPath: path.join(config.contents, 'devices'),
		statsJsonPath: path.join(config.contents, 'stats'),
		romVariantsJsonPath: path.join(config.contents, 'romvariants'),
		romJsonPath: path.join(config.contents, 'roms'),
	}

	async.series([
		function(seriesCallback) {
			for (var i in Directories) {
				var directory = Directories[i];

				if (fsextra.existsSync(directory)) {
					fsextra.removeSync(directory);
				}

				fsextra.ensureDirSync(directory);
			}

			seriesCallback(null);
		},

		function(seriesCallback) {
			fsextra.ensureDir(config.output, seriesCallback);
		},

		function(seriesCallback) {
			async.parallel([
				function(parallelCallback) {
					models.Device.findAll({
						order: 'name ASC'
					}).success(function(devices) {
						async.each(devices, function(device, eachCallback) {
							models.Rom.count({
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
							}).success(function(romCount) {
								if (romCount > 0) {
									var deviceValues = device.toJSON();
									deviceValues.template = 'device.jade';
									deviceValues.filename = '/device-' + device.name + '.html';

									fsextra.writeJSON(path.join(Directories.deviceJsonPath, device.name + '.json'), deviceValues, eachCallback);
								} else {
									eachCallback(null);
								}
							});
						}, parallelCallback);
					});
				},

				function(parallelCallback) {
					models.RomVariant.findAll({
						order: 'displayName ASC, name ASC'
					}).success(function(romVariants) {
						async.each(romVariants, function(romVariant, eachCallback) {
							models.Rom.count({
								include: [
									{
										model: models.RomVariant,
										where: {
											id: romVariant.id,
										}
									}
								],
								where: {
									isActive: true,
								},
							}).success(function(romCount) {
								if (romCount > 0) {
									var romVariantValues = romVariant.toJSON();

									romVariantValues.template = 'romvariant.jade';
									romVariantValues.filename = '/rom-' + romVariant.name + '.html';

									fsextra.writeJSON(path.join(Directories.romVariantsJsonPath, romVariant.name + '.json'), romVariantValues, eachCallback);
								} else {
									eachCallback(null);
								}
							});
						}, parallelCallback);
					});
				},

				function(parallelCallback) {
					models.Rom.findAll({
						include: [
							{
								model: models.RomVariant,
								include: [
									{
										model: models.Device,
									}
								]
							}
						],
						where: {
							isActive: true,
						},
						order: 'createdAt DESC',
					}).success(function(roms) {
						async.each(roms, function(rom, eachCallback) {
							var romValues = { rom: rom.toJSON() };
							romValues.downloadUrl = ResultConverter.getRomDownloadUrl(rom);
							romValues.md5sumUrl = ResultConverter.getRomMd5sumUrl(rom);

							fsextra.writeJSON(path.join(Directories.romJsonPath, rom.id + '.json'), romValues, eachCallback);
						}, parallelCallback);
					});
				},

				function(parallelCallback) {
					// Start 7 days ago at 0:00:00
					var dateStart = new Date();
					dateStart.setDate(dateStart.getDate() - 7);
					dateStart.setHours(0, dateStart.getTimezoneOffset() * -1, 0, 0);

					// Until today 0:00:00
					var dateEnd = new Date();
					dateEnd.setDate(dateEnd.getDate());
					dateEnd.setHours(0, dateEnd.getTimezoneOffset() * -1, 0, 0);

					models.Download.findAll({
						attributes: [
							[ models.sequelize.fn('strftime', '%Y-%m-%d', models.sequelize.col('Downloads.createdAt')), 'downloadDate' ],
							[ models.sequelize.fn('COUNT', 'Downloads.id'), 'downloadCount' ],
						],
						include: [
							{
								model: models.Rom,
								include: {
									model: models.RomVariant,
									include: [
										{
											model: models.Device,
										}
									]
								}
							},
							{
								model: models.Incremental,
								include: {
									model: models.RomVariant,
									include: [
										{
											model: models.Device,
										}
									]
								}
							},
						],
						where: [
							{
								createdAt: {
									between: [ dateStart, dateEnd ]
								}
							}
						],
						group: [
							models.sequelize.fn('strftime', '"%Y-%m-%d"', models.sequelize.col('Downloads.createdAt')),
							'Downloads.RomId',
							'Downloads.IncrementalId',
						]
					}).success(function(allDownloads) {
						async.map(allDownloads, function(download, mapCallback) {
							var incrementalId = null;
							var romId = null;
							var romVariantId = null;

							if (!!download.rom) {
								romId = download.rom.id;
								romVariantId = download.rom.romVariant.id;
							} else {
								incrementalId = download.incremental.id;
								romVariantId = download.incremental.romVariant.id;
							}

							var result = {
								DownloadCount: download.toJSON().downloadCount,
								DownloadDate: download.toJSON().downloadDate,
								RomId: romId,
								IncrementalId: incrementalId,
								RomVariantId: romVariantId,
							};

							mapCallback(null, result);
						}, function(err, processedDownloads) {
							if (err) {
								parallelCallback(err);
							} else {
								var downloadStats = { template: 'statistics.jade', filename: '/stats.html', downloads: processedDownloads };

								fsextra.writeJSON(path.join(Directories.statsJsonPath, 'statistics.json'), downloadStats, parallelCallback);
							}
						});
					});
				},
			], seriesCallback);
		},

		function(seriesCallback) {
			wintersmith(config).build(seriesCallback);
		},
	], function(err) {
		if (err) {
			console.log('ERROR while building website: ' + err);
		} else {
			console.log('Finished building website!');
		}
	});
});
