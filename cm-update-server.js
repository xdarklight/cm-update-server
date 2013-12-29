var restify = require('restify');
var config = require('config').Server;
var models = require('./models/');
var ResultConverter = require('./result-converter.js');

var server = restify.createServer({ name: 'cm-updater-server' });

models.sequelize.sync().success(function() {
	server.listen(config.listeningPort, config.listeningAddress, function () {
		console.log('%s listening at %s', server.name, server.url);
	});

	server.use(restify.bodyParser());

	server.get('/changelog/:romId', function (req, res, next) {
		models.Rom.find(req.params.romId).complete(function(err, rom) {
			if (err) {
				res.send(500);
			} else if (!rom) {
				res.send(404);
			} else {
				var body = rom.changelog ? rom.changelog : "";

				res.writeHead(200, {
					'Content-Length': Buffer.byteLength(body),
					'Content-Type': 'text/plain'
				});

				res.write(body);
			}

			return next();
		});
	});

	server.get('/download/:romId', function (req, res, next) {
		models.Rom.find(req.params.romId).complete(function(err, rom) {
			if (err) {
				res.send(500);
			} else if (!rom) {
				res.send(404);
			} else {
				var realDownloadUrl = ResultConverter.getRealDownloadUrl(rom);

				res.writeHead(301, { Location: realDownloadUrl });
				res.end();

				models.Download.build({
					timestamp: new Date(),
				}).save().error(function (err) {
					// Ignoring errors here since those have no impact for the user.
				});
			}

			return next();
		});
	});

	server.post('/api', function(req, res, next) {
		// Currently the CMUpdater app does not send the correct content-type.
		// Thus auto-parsing the body does not work. But we are ready once that problem is fixed.
		var requestParameters = req.is('json') ? req.body : JSON.parse(req.body);

		if (!requestParameters || !requestParameters.params || requestParameters.method != 'get_all_builds') {
			res.send(400);
			return next();
		}

		var responseId = null;

		models.Device.find({ where: { name: requestParameters.params.device } }).complete(function(err, device) {
			if (err) {
				res.send(500, ResultConverter.convert(responseId, 'Database error.', null));
				return next();
			}

			if (!device) {
				// No error but nothing found.
				res.send(200, ResultConverter.convert(responseId, null, null));
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
					res.send(500, ResultConverter.convert(responseId, 'Database error.', null));
				} else {
					res.send(200, ResultConverter.convert(responseId, null, roms));
				}

				return next();
			});
		});
	});
});
