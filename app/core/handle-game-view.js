// @flow
import { ipcRenderer, remote } from 'electron';
import R from 'ramda';
import { Map, Record } from 'immutable';
import { cookies } from './cookies';
import { onDebuggerDetach, onDebuggerMessage, onBeforeRequest, viewOnCloseHandler } from './handlers';
import { HandlerContext } from './records';
import { transformerActionMap } from './transformer-action-map';

const PROTOCOL_VERSION: string = '1.1';

/**
 * @export
 * @param transformerActions
 * @returns {void}
 */
export function GameViewHandler(transformerActions): void {
  console.info('GameViewHandler; transformers=%O', transformerActions);
  let debuggerAttached = false;
  let requestMap = Map();

  const context = new HandlerContext({
    transformerActions,
    firstGameLoad: true,
    handleMessages: false
  });

  // Manual currying is fine too 🍛
  return (event): void => {
    const view = event.target;
    const viewId = view.id;
    const webContents = view.getWebContents();
    const webSession = webContents.session;

    console.log('GameViewHandler: webContents.id=%s', webContents.id);
    ipcRenderer.send('register-game-view', webContents.id);

    // view.addEventListener('close', (e) => {
    //   console.log('Closing; disabling debugger.');
    //   webContents.debugger.sendCommand('Network.disable');
    // });
    //
    // if (!debuggerAttached) {
    //   try {
    //     webContents.debugger.attach(PROTOCOL_VERSION);
    //     debuggerAttached = true;
    //   }
    //   catch (err) {
    //     console.error('An error has occurred:', err);
    //   }
    //
    //   const updateContextFn = responseCtx => {
    //     if (!!responseCtx) {
    //       currentCtx = currentCtx.merge(responseCtx);
    //     }
    //     console.log('currentCtx => %s', currentCtx.toString());
    //   }
    //
    //   webContents.executeJavaScript(cookies);
    //   webContents.debugger.on('detach', onDebuggerDetach(currentCtx));
    //   webContents.debugger.on('message', onDebuggerMessage(currentCtx, updateContextFn));
    //   webContents.debugger.sendCommand('Network.enable');
    //   webSession.webRequest.onBeforeRequest(onBeforeRequest(currentCtx, updateContextFn));
    // }
  }
}
