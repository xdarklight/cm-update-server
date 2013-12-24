module.exports = function RequestParser(request, response) {
	this.request = request;

	this.fullBody = new String();
	this.dataValid = false;

	this.execute = function(successCallback, errorCallback) {
		var parser = this;

		if (this.request.method != 'POST') {
			errorCallback(405);
			return;
		}

		this.request.on('data', function(chunk) {
			parser.fullBody += chunk.toString();
			parser.dataValid = true;

			if (parser.fullBody.length > 1024) {
				console.log("Skipping large request: " + parser.fullBody.length);

				parser.dataValid = false;

				errorCallback(413);
			}
		});

		this.request.on('end', function() {
			if (parser.dataValid) {
				var requestObject;

				try {
					requestObject = JSON.parse(parser.fullBody);
				} catch (e) {
					console.log('Received illegal JSON string: ' + parser.fullBody);
				}

				parser.dataValid = requestObject != null;
			}

			if (parser.dataValid) {
				successCallback(requestObject);
			} else {
				errorCallback(400);
			}
		});
	}
}