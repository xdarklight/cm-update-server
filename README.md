cm-update-server
================

[![Dependency Status](https://david-dm.org/xdarklight/cm-update-server.svg)](https://david-dm.org/xdarklight/cm-update-server)

This provides the server-side API for letting a user download ROMs through the CMUpdater app.

Introduction
------------

cm-update-server is a set of tools for managing various ROMs (for various devices) in a database which uses [node](http://nodejs.org).


Quick Start
-----------

**Install all dependencies:**

    cm-update-server$ npm update

**Create a configuration file:**

    cm-update-server$ vi config/production.js

NOTE: The configuration file has to be named according to [config].

See `config/default.js` for a list of configuration options.
You probably want to have a closer look at the "Application" block, since this is where you have to configure your server URLs.

**(Optional) If the database settings were not adjusted:**

In this case a sqlite database is used by default. You need to create the directory where the sqlite file will be stored:

    mkdir data

**Peer5 Support**

Peer5 is a free CDN that allows website owners to reduce bandwidth by using P2P technology.

    To enable Peer5, please input your ID in website/templates/layout.jade

**Start your application server:**

    cm-update-server$ export NODE_ENV=production
    cm-update-server$ node cm-update-server.js

**Set up a config/config.json file for the database migrations:**

    cm-update-server$ node_modules/sequelize-cli/bin/sequelize init:config --force

Now edit config/config.json so it matches your database settings.

(Optional) If using default sqlite database approach, this should
be all that is needed to edit the config file:

    sed -i'' 's/mysql/sqlite/g' config/config.json

**Run the migrations:**

    cm-update-server$ NODE_ENV=production node_modules/sequelize-cli/bin/sequelize db:migrate

**Adding builds to the database:**

To get a list of parameters:

    cm-update-server$ node add-build.js --help

Then add a ROM:

    cm-update-server$ node add-build.js --device cmtestdevice --filename cm-11-20140101-NIGHTLY-cmtestdevice.zip --md5sum bdf2b4ead6957fe67987be78d7b31f9d --channel NIGHTLY --api_level 19 --subdirectory cmtestdevice-11.0 --active --timestamp 1388570019

**Disabling a build (to "hide" it from the user):**

    cm-update-server$ node disable-build.js --device cmtestdevice --filename cm-11-20140101-NIGHTLY-cmtestdevice.zip --subdirectory cmtestdevice-11.0

**(Optional) Use PM2 or forever to keep cm-update-server running**

You can use PM2 or forever to keep the server running. PM2 even supports generating init-scripts for Debian/Ubuntu/CentOS.


Updating
--------

**Update the project files to the latest version:**

    cm-update-server$ git pull && git update <target revision>

**Run the database migrations:**

(edit `config/config.json` to match your settings)

    cm-update-server$ NODE_ENV=production node_modules/sequelize-cli/bin/sequelize db:migrate


Website
-------

A website module is now bundled with the server. The website is pre-generated static content (generated using [wintersmith]).

**Configuration of the website module:**
The configuration section is called "Website" (see `config/default.js` for the default values).

**Generating the static content:**
This should be called (manually) after running `add-build.js` or `add-incremental.js`:

    cm-update-server$ node generate-website.js

-> The static HTML can be found (by default) in `website/build`.


Basic Idea
----------

The basic idea how the data is stored:
* You can store builds for multiple devices<br /> -> that's why all commands have a "device" parameter
* You can have different types of builds per device (you could for example have AOSP and CyanogenMod parallel)<br />-> that's why there's an optional "subdirectory" parameter
* RomVariant is the internal name of the "device" and "subdirectory" aggregate
* The following combination makes a build unique:<br />&nbsp;&nbsp;1. It's RomVariant (device + subdirectory)<br />&nbsp;&nbsp;2. It's filename
* The "unique" constraint only applies to "active" builds
* Deactivating builds can/should be done due to multiple reasons:<br />&nbsp;&nbsp;1. A build is very old and you don't want to bloat your results with very old builds&nbsp;&nbsp;2. You do a rebuild (on the same day) so the target filename already exists in the database -> in this case you disable the old build so only the latest version is returned.
* You can use this build-database to store sourcecode timestamps (useful for generating changelogs).<br />-> that's why `add-build.js` has a "--sourcecode_timestamp" parameter and why `get-sourcecode-timestamp.js` exists.

See Also
--------

[config] - The library that is used to parse the configuration file(s)<br>
[sequelize] - The library that is used as ORM - see also [how to configure it](http://sequelizejs.com/docs/latest/usage)<br>
[wintersmith] - The static website generator<br>
<br>
[forever] - A simple tool to keep cm-update-server or any other NodeJS application running continuously (forever).<br>
[pm2] - Also lets cm-update-server or any other application run forever but has far more features than forever.<br>

Useful links
-----------
[chef_cookbook] - A Chef Cookbook for cm-update-server (thanks Patrick Connolly)<br>
[vagrant_vm] - A Vagrant Demo VM for cm-update-server (thanks Patrick Connolly)<br>

License
-------

May be freely distributed under the MIT license

See `LICENSE` file.

Copyright (c) 2013-2014 Martin Blumenstingl

  [config]: http://lorenwest.github.com/node-config/latest
  [sequelize]: http://www.sequelizejs.com
  [wintersmith]: http://wintersmith.io
  [forever]: https://github.com/nodejitsu/forever
  [pm2]: https://github.com/Unitech/pm2
  [chef_cookbook]: https://github.com/mission-impossible-android/chef-cm-update-server
  [vagrant_vm]: https://github.com/mission-impossible-android/cm-update-server-vagrant
