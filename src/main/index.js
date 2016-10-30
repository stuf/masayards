// @flow
import { webContents, ipcMain } from 'electron';
import config from '../../app/config';

console.log('/src/main/index');

let firstCall = true;
let gotGameFlash = false;
let debuggerIsAttached = false;

let webContentsId = null;
let wc = null;
let ws = null;

const cookies = [
  'document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/";',
  'document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame/";',
  'document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame_s/";',
  'document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/";',
  'document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame/";',
  'document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame_s/";'
].join('\n');

ipcMain.on('register-game-view', (event, arg) => {
  console.log('Registering game view with the ID %s; firstCall=%s', arg, firstCall);

  // TODO I am ashamed
  if (firstCall) {
    firstCall = false;
  }

  // TODO As with this
  if (!!webContentsId) {
    console.log('Already registered');
    return;
  }

  webContentsId = arg;
  wc = webContents.fromId(webContentsId);
  ws = wc.session;

  if (!debuggerIsAttached) {
    wc.debugger.attach('1.1');
    debuggerIsAttached = true;
  }

  if (!firstCall) {
    wc.executeJavaScript(cookies);
    wc.debugger.on('detach', onDebuggerDetach());
    wc.debugger.on('message', onDebuggerMessage());
    wc.debugger.sendCommand('Network.enable');
    ws.webRequest.onBeforeRequest((details, callback) => {
      const shouldCancelRequest = config.gameSwfPrefix.test(details.url) && !gotGameFlash;
      callback({ cancel: shouldCancelRequest });

      if (shouldCancelRequest) {
        console.log(`Found game SWF at address ${details.url}`);
        gotGameFlash = true;
        wc.loadURL(details.url);
      }
    });
  }
});

ipcMain.on('deregister-game-view', (event, arg) => {
  console.log('Deregistering game view.');
  wc.debugger.sendCommand('Network.disable');
});

function onDebuggerDetach(event, reason) {
  return () => {
    console.log(`Debugger has been detached. Reason: ${reason}`);
  }
}

function onDebuggerMessage() {
  console.log('onDebuggerMessage:outer');
  return (event, method, params) => {
    console.log('onDebuggerMessage:inner', method, params);
  }
}
