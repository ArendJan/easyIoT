const express = require('express');
const router = express.Router();
const ash = require('express-async-handler');
const analyzers = require('../plugins/analyze');
const sql = require('./../conn/sql');
router.get('/', function (req, res, next) {
  console.log('pushp agge');
  res.render('push');
});

const defaults = {
  temp: -1, hum: -1, test: 10, password: ''
};

router.post('/:deviceID', ash(async (req, res, next) => {
  const deviceID = req.params.deviceID;

  const data = { ...defaults, ...req.body };

  if (!(await sql.checkDevice(deviceID, data.password))) {
    res.render('error');
    return;
  }

  delete data.password;
  // run all calculators
  const olderData = await sql.getAmount(deviceID, 1000); // last 1000 records = 8.3 hours
  let userData = await sql.getUsers(deviceID);
  let deviceMem = await sql.getDeviceMem(deviceID);
  if(userData.length < 1) {
    userData = {email: '', id: '-1', subscription: undefined};
  } else {
    userData = userData[0];
  }
  if(deviceMem.length < 1) {
    deviceMem = {};
  } else {
    deviceMem = deviceMem[0].memory;
    if(!deviceMem) {
      deviceMem = {};
    }
  }
  await analyzers.run(deviceID, data, olderData, userData, deviceMem);

  await sql.push(deviceID, data);
  await sql.setDeviceMem(deviceID, deviceMem);

  res.json(data);
}));

module.exports = router;
