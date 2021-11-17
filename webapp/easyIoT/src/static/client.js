const publicVapidKey = '<EDIT!!>';
const axios = require('axios')
import { serverURL } from './../consts'

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

//check if the serveice worker can work in the current browser
if('serviceWorker' in navigator){
  console.log('client.js');

  send().catch(err => console.error(err));
} else{
  console.log('client.jsasdf');

}
console.log('client.js');

async function send(){
  //register service worker
  const register = await navigator.serviceWorker.register('/worker.js', {
      scope: '/'
  });

  //register push
  const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,

      //public vapid key
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  //Send push notification
  await axios.post(serverURL + '/api/subscribe', subscription, { withCredentials: true });
}
