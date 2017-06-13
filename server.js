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
 * Instead of Request
 ********************************************************************/

/*eslint no-ternary: "off"*/
/*eslint global-require: "off"*/
const urlParse = require('url');
const _request = (method, url, data) => new Promise((resolve, reject) => {
  const options = typeof url === "object" ? url : urlParse.parse(url);
  const lib = options.protocol.startsWith('https') ? require('https') : require('http');
  options.auth = config.username && config.password ? `${config.username}:${config.password}` : undefined;
  options.method = method;
  log.debug(`Request Method: ${options.method}`);
  log.verbose(options);
  const request = lib.request(options, response => {
    const body = [];
    response.on('data', chunk => body.push(chunk));
    response.on('end', () =>
      response.statusCode > 399
      ? reject([response.statusCode, response.headers, body.join('')])
      : resolve([response.statusCode, response.headers, body.join('')]));
  });
  // handle connection errors of the request
  request.on('error', err => reject(err));
  request.end(typeof data === "object" ? JSON.stringify(data) : data || "");
});

const http = {
  get: url => _request("GET", url),
  head: url => _request("HEAD", url),
  delete: url => _request("DELETE", url),
  post: (url, data) => _request("POST", url, data)
};


/********************************************************************
 * Route Handlers
 ********************************************************************/

let state = {};
// let state = {
//   rooms: {
//     "general": {
//       name: "General",
//       messages: [],
//       users: [],
//     }
//   },
//   settings: {
//     "bhudgens": {
//       currentRoom: "general"
//       rooms: [
//         "general"
//       ]
//     }
//   }
// };

const getUserSettings = username => {
  state.settings = state.settings || {};
  state.settings[username] = state.settings[username] || {};
  state.settings[username].currentRoom = state.settings[username].currentRoom || "general";
  state.settings[username].rooms = state.settings[username].rooms || [{
    name: "General",
    id: "general",
    type: "room"
  }];


  // state.settings[username].rooms = state.rooms
  //   ? state.settings[username].rooms.filter(room => state.rooms && state.rooms[room])
  //   : state.settings[username].rooms;

  return state.settings[username];
};

const _log = msg => org => {
  log.info(msg);
  log.data(org);
  return Promise.resolve(org);
};

//XXX: For dev only
// app.use((req, res, next) => {
//   req.headers = req.headers || {};
//   req.headers["jwt-un"] = "bhudgens";
//   next();
// });

app.use((req, res, next) => {
  req.headers = req.headers || {};
  req.headers["jwt-un"] = req.headers["jwt-un"].replace(/"/g, "");
  next();
});

const getRoomData = room => {
  state.rooms = state.rooms || {
    "general": {
      name: "General",
      messages: [],
      users: [{
        name: "Clu",
        id: 'clu'
      }],
      type: "room"
    },
  };
  state.rooms[room.id] = state.rooms[room.id] || {};
  state.rooms[room.id].messages = state.rooms[room.id].messages || [];
  state.rooms[room.id].users = state.rooms[room.id].users || [{
    name: "Clu",
    id: 'clu'
  }];
  // TODO: Add clu on new room
  return state.rooms[room.id];
};

const setRoomData = room => {
  state.rooms[room.id] = Object.assign({}, getRoomData(room.id), room);
  return Promise.resolve(state.rooms[room.id]);
};

const setUserSettings = (userid, settings) => {
  state.settings[userid] = Object.assign({}, getUserSettings(userid), settings);
  return Promise.resolve(state.settings[userid]);
};

const addMessageToRoom = (room, message) => {
  log.info("amtr", room, message);
  state.rooms[room.id] = Object.assign(getRoomData(room), room);
  state.rooms[room.id].messages.push(message);
};

const ldapCache = {};
const getLdapForUser = username => typeof ldapCache[username] === "undefined"
  ? http.get(`http://services-internal.glgresearch.com/epildap/searchldap?sAMAccountName=${username}`)
  // .then(_log(["UN:", username, `http://services-internal.glgresearch.com/epildap/searchldap?sAMAccountName=${username}`].join(' ')))
  // .then(_log("ldap response"))
  .then(response => JSON.parse(response[2]))
  .then(ldapInfo => {
    ldapCache[username] = ldapInfo[0];
    return ldapCache[username];
  })
  : Promise.resolve(ldapCache[username]);

// app.get('/', (req, res) => res.redirect('https://github.com/Beginnerprise/node_boilerplate'));
app.use('/', express.static(`${__dirname}/public`));
app.get('/diagnostic', (req, res) => res.status(200).end('OK'));
app.post('/room', (req, res) => setRoomData(req.body)
  .then(() => res.status(200).json({ status: "OK" })));
app.get('/room/:room', (req, res) => getLdapForUser(req.headers["jwt-un"])
  .then(ldapInfo => {
    // console.log("h", req.headers);
    // console.log("ldi", ldapInfo);
    const _roomData = getRoomData({ id: req.params.room });
    if (state.rooms[req.params.room].users.filter(u => u.id === req.headers["jwt-un"]).length === 0) {
      state.rooms[req.params.room].users.push({
        id: req.headers["jwt-un"],
        name: ldapInfo.displayName
      });
    }
    return res.status(200).json(_roomData);
  })
  .catch(() => {
    delete ldapCache[req.headers["jwt-un"]];
  }));
const btoa = require('btoa');
app.post('/createPM', (req, res) => getLdapForUser(req.headers["jwt-un"])
  .then(ldapInfo => {
    if (req.headers["jwt-un"] === req.body.id) {
      return res.status(502).json({ status: "Clicked Self" });
    }
    const _requestor = getUserSettings(req.headers["jwt-un"]);
    const _destination = getUserSettings(req.body.id);
    const _roomId = btoa([req.headers["jwt-un"], req.body.id].sort());
    if (_requestor.rooms.filter(r => r.id === _roomId).length === 0) {
      _requestor.rooms.push({
        name: req.body.name,
        id: _roomId,
        type: "person"
      });
    }
    if (_destination.rooms.filter(r => r.id === _roomId).length === 0) {
      _destination.rooms.push({
        name: ldapInfo.displayName,
        id: _roomId,
        type: "person"
      });
    }
    _requestor.currentRoom = _roomId;
    setUserSettings(req.headers["jwt-un"], _requestor);
    setUserSettings(req.body.id, _destination);

    const _roomName = [ldapInfo.displayName, req.body.name].sort().join(' | ');
    setRoomData({ id: _roomId, name: _roomName });
    return res.status(200).json({ status: "OK" });
  }));
app.get('/settings', (req, res) => res.status(200).json(getUserSettings(req.headers["jwt-un"])));
app.post('/settings', (req, res) => setUserSettings(req.headers["jwt-un"], req.body)
  .then(() => res.status(200).json({ status: "OK" })));
app.post('/message', (req, res) => getLdapForUser(req.headers["jwt-un"])
  .then(ldapInfo => addMessageToRoom(req.body.room, Object.assign({}, {
    from: req.headers["jwt-un"],
    name: ldapInfo.displayName
  }, req.body.message)))
  .then(() => res.status(200).json({ status: "OK" }))
  .catch(e => {
    res.status(502).json({ status: "Error" });
    log.error(e);
  }));

/********************************************************************
 * Start the Express Server
 ********************************************************************/
app.listen(config.serverPort, () =>
  log.info(`${config.appName} listening on ${config.serverPort}`));
