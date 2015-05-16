module.exports = {
	Server: {
		/**
		 * The address where the HTTP server will listen.
		 */
		listeningAddress: '0.0.0.0',

		/**
		 * The port on which the HTTP server will listen.
		 */
		listeningPort: 3000,

		/**
		 * Configuration of restify's BodyParser / BodyReader.
		 */
		bodyParserConfiguration: {
			/**
			 * Request size in bytes.
			 */
			maxBodySize: 1000,
		},

		/**
		 * Configuration of restify's throttle module. See http://mcavage.me/node-restify/
		 * for a list of configuration options ("Throttle" section below "Bundled Plugins").
		 */
		throttleConfiguration: {
			/**
			 * Decides if the module will be enabled.
			 */
			isEnabled: false,
		},

		/**
		 * Enables serving of static content. The following example serves the website
		 * (all files reside in website/build).
		 *
		 * NOTE: The whole block is optional and can be left empty in your own configuration.
		 */
		serveStaticConfiguration: [
			{
				urlPattern: '^(/|\/?.*\.html|/assets/.*)$',

				/**
				* Configuration for restify's serveStatic module. See http://mcavage.me/node-restify/
				* for a list of configuration options ("Serve Static" section below "Bundled Plugins").
				*/
				options: {
					directory: './website/build/',
					default: 'index.html',
				}
			}
		],
	},

	/**
	 * Wintersmith settings - see: https://github.com/jnordberg/wintersmith#configuration
	 */
	Website: {
		/**
		 * Input/output directories.
		 */
		contents: "./website/contents/",
		templates: "./website/templates/",
		output: "./website/build/",

		locals: {
			/**
			 * The title (index page) of the website.
			 */
			name: 'ROM overview',

			/**
			 * The owner/copyright text that will be shown in the footer.
			 * If left blank then the footer will only show (c) <year>.
			 */
			owner: 'cm-update-server provider name',

			/**
			 * Shows the image at the given URL at the very top of the
			 * page.
			 */
			topImageUrl: '',

			/**
			 * The alt/title text for the "top image". This is only
			 * required when topImageUrl is configured.
			 */
			topImageAlt: '',

			/**
			 * Custom links for the "Additional Information" section.
			 * Leave this empty to disable the "Additional Information"
			 * area.
			 */
			customLinks: [
				{ src: "/stats.html", text: "Download statistics" },
				{ src: "http://google.com", text: "google", target: "_blank" },
				{ src: "http://github.com", text: "github", target: "_blank" }
			]
		},

		/** @see @href https://github.com/jnordberg/wintersmith#options */
		plugins: [
		],

		/** @see @href https://github.com/jnordberg/wintersmith#options */
		require: {
			filesize: "filesize"
		},

		jade: {
			pretty: true
		},

		/** @see @href https://github.com/jnordberg/wintersmith#options */
		baseUrl: "/"
	},

	Application: {
		/**
		 * The base URL where the real full roms can be found. The following parameters are appended to this 'base-URL':
		 * 1) The subdirectory of the rom (if set)
		 * 2) The filename of the rom
		 */
		realRomDownloadBaseUrl: "http://localhost/download/rom",

		/**
		 * The base URL for the download-proxy for the full rom downloads (which is handled by
		 * cm-updater-api's webserver at /download/rom). This little proxy acts as statistics module.
		 *
		 * NOTE: If isDownloadProxyEnabled is set to false then this value can be ignored!
		 */
		proxyRomDownloadBaseUrl: "http://localhost:3000/download/rom",

		/**
		 * The base URL where the incremental files can be found. The following parameters are appended to this 'base-URL':
		 * 1) The subdirectory of the incremental (if set)
		 * 2) The filename of the incremental
		 */
		realIncrementalDownloadBaseUrl: "http://localhost/download/incremental",

		/**
		 * The base URL for the download-proxy for incremental updates (which is handled by
		 * cm-updater-api's webserver at /download/incremental). This little proxy acts as statistics module.
		 *
		 * NOTE: If isDownloadProxyEnabled is set to false then this value can be ignored!
		 */
		proxyIncrementalDownloadBaseUrl: "http://localhost:3000/download/incremental",

		/**
		 * Similar to proxyDownloadBaseUrl this is the base-URL used to build each Rom's changelog URL.
		 * The rom-ID will be added to this as path-parameter.
		 */
		changelogBaseUrl: "http://localhost:3000/changelog",

		/**
		 * Decides if the download proxy (used for gathering download statistics) is enabled or not.
		 */
		isDownloadProxyEnabled: true,

		/**
		 * The number of additional changelogs (from previous builds) which are shown during a GET changelog call.
		 * Use 0 to disable this feature.
		 */
		additionalPreviousChangelogs: 3,
	},

	/**
	 * The database connection settings for sequelize. See http://sequelizejs.com/docs/latest/usage
	 * for a list of configuration options.
	 */
	Database: {
		name: "",
		username: "",
		password: "",
		options: {
			logging: false,
			dialect: "sqlite",
			storage: "./data/database.sqlite",
		}
	}
}
