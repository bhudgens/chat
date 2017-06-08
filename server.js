"use strict";

/********************************************************************
 * Logging
 ********************************************************************/

const config = require('./config/config.js');
const log = require('iphb-logs');

/** Respect Logging Configs */
log.enable.logging = config.logging;
log.enable.debug = config.debug;
log.enable.verbose = config.verbose;

// XXX: A reminder to look at "TODO/XXX" tags and handle them before
// we are production ready
log.warn("Someone left dev code in a production release!!!!");

/********************************************************************
 * Libraries
 ********************************************************************/

/** Hookup Express */
const express = require('express');
const app = express();

/** Configure our body Parser */
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/********************************************************************
 * Route Handlers
 ********************************************************************/

// app.get('/', (req, res) => res.redirect('https://github.com/Beginnerprise/node_boilerplate'));
app.use('/', express.static(`${__dirname}/public`));
app.get('/diagnostic', (req, res) => res.status(200).end('OK'));

/********************************************************************
 * Start the Express Server
 ********************************************************************/
app.listen(config.serverPort, () =>
  log.info(`${config.appName} listening on ${config.serverPort}`));
