const express = require('express');
const router = express.Router();
const ash = require('express-async-handler');
const sql = require('./../conn/sql');
const webpush = require('web-push');

// check login credentials!
router.use(ash(async (req, res, next) => {
  if (req.originalUrl.startsWith('/api/login') || req.originalUrl.startsWith('/api/addDevice') || req.originalUrl.startsWith('/api/createAccount')) {
    next();
  } else {
    if (!req.session.username || !req.session.password) {
      res.json({ ok: 0 });
      return;
    }
    const check = await sql.checkLogin(req.session.username, req.session.password);
    if (!(check.check)) {
      res.json({ ok: 0 });
      return;
    }
    res.locals.login = check;
    next();
  }
}));

router.get('/', function (req, res, next) {
  res.json({ ok: 1 });
});

router.post('/login', ash(async (req, res) => {
  if (!await (await sql.checkLogin(req.body.username, req.body.password)).check) {
    console.log('oeps', req.body);
    res.json({ ok: 0 });
  } else {
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    res.json({ ok: 1 });
  }
}));

router.get('/devices', ash(async (req, res) => {
  const id = res.locals.login.data.id;
  const devices = (await sql.getDevices(id)).map((v) => { delete v.password; return v; });
  res.json(devices);
}));

// get the types of the device(last 100)
router.get('/dev/:deviceID', ash(async (req, res) => {
  const deviceID = req.params.deviceID;

  if (!await sql.checkAccess(res.locals.login.data.id, deviceID)) {
    res.json({ ok: 0 });
    return;
  }
  const data = await sql.getAmount(deviceID, 100);
  const types = new Set();

  data.forEach((v) => {
    Object.keys(v.data).forEach((v2) => types.add(v2));
  });
  res.json([...types.values()]);
}));

router.get('/data/:deviceID', ash(async (req, res) => {
  const deviceID = req.params.deviceID;

  if (!await sql.checkAccess(res.locals.login.data.id, deviceID)) {
    res.json({ ok: 0 });
    return;
  }
  const data = await sql.get(deviceID, false);

  res.json(data);
}));

router.get('/data/:deviceID/:time', ash(async (req, res) => {
  const deviceID = req.params.deviceID;
  if (!await sql.checkAccess(res.locals.login.data.id, deviceID)) {
    res.json({ ok: 0 });
    return;
  }
  const HOUR = 60 * 60;
  const DAY = 24 * HOUR;
  let diff = HOUR;
  const times = {
    '1h': HOUR, '8h': 8 * HOUR, '1d': 1 * DAY
  };
  if (req.params.time in times) {
    diff = times[req.params.time];
  }
  const data = await sql.getWithTime(deviceID, diff);
  res.json(data);
}));
router.get('/data/:deviceID/:time/:amount', ash(async (req, res) => {
  const deviceID = req.params.deviceID;
  if (!await sql.checkAccess(res.locals.login.data.id, deviceID)) {
    res.json({ ok: 0 });
    return;
  }
  const HOUR = 60 * 60;
  const DAY = 24 * HOUR;
  let diff = HOUR;
  const times = {
    '1h': HOUR, '8h': 8 * HOUR, '1d': 1 * DAY, '7h': 7 * HOUR
  };
  if (req.params.time in times) {
    diff = times[req.params.time];
  }
  const data = await sql.getWithTimeAmount(deviceID, diff, req.params.amount);
  res.json(data);
}));

router.post('/connect', ash(async (req, res) => {
  const userID = res.locals.login.data.id;
  const deviceID = req.body.deviceID;
  const devicePass = req.body.password;
  if (!await sql.checkDeviceConnect(deviceID, devicePass)) {
    res.json({ ok: 0 });
    return;
  }
  await sql.setDeviceUser(deviceID, userID);
  res.json({ ok: 1 });
}));

router.post('/removeDevice', ash(async (req, res) => {
  const userID = res.locals.login.data.id;
  const deviceID = req.body.deviceID;
  if (!await sql.checkAccess(res.locals.login.data.id, deviceID)) {
    res.json({ ok: 0 });
    return;
  }
  await sql.setDeviceUser(deviceID, -1);
  res.json({ ok: 1 });
}))

router.get('/addDevice', ash(async (req, res) => {
  res.json(await sql.addDevice());
}));

router.post('/changeName', ash(async (req, res) => {
  const deviceID = req.body.deviceID;
  if (!await sql.checkAccess(res.locals.login.data.id, deviceID)) {
    res.json({ ok: 0 });
    return;
  }
  const name = req.body.name;
  await sql.changeName(deviceID, name);
  res.json({ ok: 1 });
}));

router.get('/isLoggedIn', ash(async (req, res) => {
  res.json({ ok: 1 });
}));

router.post('/createAccount', ash(async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  res.json(await sql.createAccount(username, password));
}));

router.get('/logOut', ash(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.json({ ok: 1 });
}));
router.post('/subscribe', ash(async (req, res) => {
  const subscription = req.body;
  console.log(subscription);
  res.status(201).json({})
  //create paylod: specified the detals of the push notification
  const payload = JSON.stringify({ title: 'AirQuality meter!' });

  //pass the object into sendNotification fucntion and catch any error
  setTimeout(() => {
    webpush.sendNotification(subscription, payload).catch(err => console.error(err));
  }, 3000);
  const userID = res.locals.login.data.id;
  await sql.setSub(userID, subscription);
}));

module.exports = router;
