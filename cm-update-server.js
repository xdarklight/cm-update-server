var restify = require('restify');
var config = require('config').Server;
var models = require('./models/');
var ResultConverter = require('./result-converter.js');

var server = restify.createServer({ name: 'cm-updater-server' });

var extractRequestParameters = function(req) {
	var requestParameters = null;

	// Prior to CM11 the CMUpdater app did not send the correct content-type.
	// Thus auto-parsing the body did not work.
	if (req.is('json')) {
		requestParameters = req.body;
	} else if (!!req.body) {
		try {
			requestParameters = JSON.parse(req.body);
		} catch (err) {
			// Ignore, this is handled with a 400 below.
		}
	}

	return requestParameters;
}

models.sequelize.sync().success(function() {
	server.listen(config.listeningPort, config.listeningAddress, function () {
		console.log('%s listening at %s', server.name, server.url);
	});

	server.use(restify.bodyParser(config.bodyParserConfiguration || {}));

	// Conditionally enable the throttle module with the settings from the config.
	if (config.throttleConfiguration && config.throttleConfiguration.isEnabled) {
		server.use(restify.throttle(config.throttleConfiguration));
	}

	server.get('/changelog/:romId', function (req, res, next) {
		models.Rom.find(req.params.romId).complete(function(err, rom) {
			if (err) {
				res.send(500);
				return next();
			}

			if (!rom) {
				res.send(404);
				return next();
			}

			if (!rom.isActive) {
				res.send(410);
				return next();
			}

			var findParentRomHandler = function(childRom, resultHandler) {
				childRom.getParentRom().success(resultHandler);
			}

			ResultConverter.getChangelogContent(rom, findParentRomHandler, function(body) {
				res.writeHead(200, {
					'Content-Length': Buffer.byteLength(body),
					'Content-Type': 'text/plain'
				});

				res.end(body);

				return next();
			});
		});
	});

	server.get('/download/:romId', function (req, res, next) {
		models.Rom.find(req.params.romId).complete(function(err, rom) {
			if (err) {
				res.send(500);
			} else if (!rom) {
				res.send(404);
			} else if (!rom.isActive) {
				res.send(410);
			} else {
				var realDownloadUrl = ResultConverter.getRealRomDownloadUrl(rom);

				res.writeHead(301, { Location: realDownloadUrl });
				res.end();

				models.Download.build({
					RomId: rom.id,
				}).save().error(function (err) {
					// Ignoring errors here since those have no impact for the user.
				});
			}

			return next();
		});
	});

	server.post('/api/v1/build/get_delta', function(req, res, next) {
		var requestParameters = extractRequestParameters(req);

		if (!requestParameters) {
			res.send(400);
			return next();
		} else if (!requestParameters.source_incremental || !requestParameters.target_incremental) {
			// TODO: Send error message.
			res.send(400);
			return next();
		}

		models.Incremental.find({ include: [
			{ model: models.Rom, as: 'sourceRom', where: { incrementalId: requestParameters.source_incremental } },
			{ model: models.Rom, as: 'targetRom', where: { incrementalId: requestParameters.target_incremental } }
		]}).success(function(incremental) {
			if (Incremental) {
				// TODO
			} else {
				res.send(404);
				return next();
			}
		});
	});

	server.post('/api', function(req, res, next) {
		var requestParameters = extractRequestParameters(req);

		if (!requestParameters || !requestParameters.params || requestParameters.method != 'get_all_builds') {
			res.send(400);
			return next();
		}

		var responseId = null;

		models.Device.find({ where: { name: requestParameters.params.device } }).complete(function(err, device) {
			if (err) {
				res.send(500, ResultConverter.convertRomList(responseId, 'Database error.', null));
				return next();
			}

			if (!device) {
				// No error but nothing found.
				res.send(200, ResultConverter.convertRomList(responseId, null, null));
				return next();
			}

			models.Rom.findAll({
				where: {
					DeviceId: device.id,
					updateChannel: requestParameters.params.channels,
					isActive: true,
				},
			}).complete(function(err, roms) {
				if (err) {
					res.send(500, ResultConverter.convertRomList(responseId, 'Database error.', null));
				} else {
					res.send(200, ResultConverter.convertRomList(responseId, null, roms));
				}

				return next();
			});
		});
	});
});
