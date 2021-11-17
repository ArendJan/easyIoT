
const Pool = require('pg').Pool;
const flatten = require('flat');

const conn = new Pool({
  user: 'postgres',
  host: '<YOUR HOST>', // host can be localhost or an actual url to make your server run on another device than postgres db
  database: 'airquality',
  password: '<PASSWORD>',
  port: 5432
});
async function push (id, data) {
  await conn.query('INSERT INTO public.data(data, "deviceID")VALUES ($1, $2);', [data, id]);
}

async function get (id, flat = true) {
  return (await conn.query('SELECT * FROM public.data WHERE "deviceID" = $1;', [id])).rows.map(v => flat ? flatten(v, { maxDepth: 2 }) : v);
}

async function getAmount (id, amount) {
  return (await conn.query('SELECT * FROM public.data WHERE "deviceID" = $1 ORDER BY id DESC LIMIT $2;', [id, amount])).rows;
}

async function checkDevice (id, password) {
  return (await conn.query('SELECT * FROM public.devices WHERE id = $1 AND password = $2;', [id, password])).rowCount === 1;
}

async function checkLogin (username, password) {
  const res = (await conn.query('SELECT * FROM public.users WHERE email = $1 AND password = $2;', [username, password]));
  if (res.rowCount !== 1) {
    return { check: false, data: {} };
  } else {
    return { check: true, data: res.rows[0] };
  }
}

async function getDevices (userId) {
  return (await conn.query('SELECT * FROM public.devices WHERE "userID" = $1;', [userId])).rows;
}

async function checkAccess (userID, deviceID) {
  return (await conn.query('SELECT * FROM public.devices WHERE "userID" = $1 AND id = $2;', [userID, deviceID])).rowCount === 1;
}

async function checkDeviceConnect (deviceID, password) {
  if (password.length !== 5) {
    return false;
  }
  const result = conn.query('SELECT * FROM public.devices WHERE id = $1 AND password LIKE $2 || \'%\';', [deviceID, password]);
  return (await result).rowCount;
}

async function setDeviceUser (deviceID, userID) {
  await conn.query('UPDATE public.devices SET "userID" = $2 WHERE id = $1;', [deviceID, userID]);
}

async function addDevice () {
  return (await conn.query('INSERT INTO public.devices DEFAULT VALUES returning id, password;')).rows[0];
}

async function changeName (deviceID, name) {
  await conn.query('UPDATE public.devices SET "name" = $2 WHERE id = $1;', [deviceID, name]);
}

async function createAccount (username, password) {
  const res = (await conn.query('SELECT * FROM public.users WHERE email = $1', [username]));
  if (res.rowCount !== 0) { // Already existing user with same email
    return { ok: false };
  }
  if (password.length < 2) {
    return { ok: false };
  }
  await conn.query('INSERT INTO public.users(email, password) VALUES ($1, $2);', [username, password]);
  return { ok: true };
}

async function getWithTime (deviceID, timeDiffSec) {
  return (await conn.query('SELECT * FROM public.data WHERE "deviceID" = $1 AND time > NOW()-($2 * INTERVAL \'1\' second) ORDER BY id DESC;', [deviceID, timeDiffSec])).rows;
}
async function getWithTimeAmount (deviceID, timeDiffSec, amount) {
  const secondInterval = Math.floor(parseInt(timeDiffSec) / parseInt(amount));
  const data = (await conn.query('SELECT *, EXTRACT(EPOCH FROM "time") as seconds FROM public.data WHERE "deviceID" = $1 AND time > NOW()-($2 * INTERVAL \'1\' second) ORDER BY id DESC;', [deviceID, timeDiffSec])).rows;

  // not very sql-like, but deemed the fastest and easiest at the moment
  if (data.length < amount) {
    return data;
  }
  let nextTime = data[0].seconds + 1;
  return data.filter((value, index) => {
    const currTime = value.seconds;
    if (nextTime > currTime) {
      nextTime = currTime - secondInterval;
      return true;
    }
    return false;
  });
}


async function setSub(userID, subscription) {
  await conn.query('UPDATE public.users SET "subscription" = $2 WHERE id = $1;', [userID, subscription]);
}

async function getUsers(deviceID) {
  return (await conn.query('SELECT * FROM users where users.id = (select devices."userID" from devices where id = $1)', [deviceID])).rows;
}

async function getDeviceMem(deviceID) {
  return  (await conn.query('SELECT memory FROM devices where id = $1', [deviceID])).rows;
}

async function setDeviceMem(deviceID, memory) {
  await conn.query('UPDATE public.devices SET memory=$2 WHERE id = $1;',[deviceID, memory] );
}

module.exports = { conn, push, get, checkDevice, checkLogin, getDevices, getAmount, checkAccess, checkDeviceConnect, getWithTimeAmount, setDeviceUser, addDevice, changeName, createAccount, getWithTime, setSub, getUsers, getDeviceMem, setDeviceMem };
