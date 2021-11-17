const express = require('express');
const router = express.Router();
const ash = require('express-async-handler');

const sql = require('./../conn/sql');
router.get('/', function (req, res, next) {
  console.log('pushp agge');
  res.render('push');
});

router.get('/:deviceID', ash(async (req, res, next) => {
  const deviceID = req.params.deviceID;
  const data = await sql.get(deviceID);
  console.log(data);
  res.json(data);
}));

module.exports = router;
