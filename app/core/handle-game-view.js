// @flow
import R from 'ramda';
import { Map, Record } from 'immutable';
import { cookies } from './cookies';
import { onDebuggerDetach, onDebuggerMessage, onBeforeRequest } from './handlers';
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
  let firstGameLoad = true;

  const context = new HandlerContext({
    firstGameLoad,
    transformerActions
  });

  // Manual currying is fine too 🍛
  return (event): void => {
    const view = event.target;
    const webContents = view.getWebContents();
    const webSession = webContents.session;
    const currentCtx = context.merge({ webContents: webContents });

    console.log('currentCtx', currentCtx.toJS());

    view.addEventListener('close', (e) => {
      console.log('Closing; disabling debugger.');
      webContents.debugger.sendCommand('Network.disable');
    });

    if (!debuggerAttached) {
      try {
        webContents.debugger.attach(PROTOCOL_VERSION);
        debuggerAttached = true;
      }
      catch (err) {
        console.error('An error has occurred:', err);
      }

      webContents.executeJavaScript(cookies);
      webContents.debugger.on('detach', onDebuggerDetach(context));
      webContents.debugger.on('message', onDebuggerMessage(context));
      webContents.debugger.sendCommand('Network.enable');
      webSession.webRequest.onBeforeRequest(onBeforeRequest(context, res => firstGameLoad = res.firstGameLoad));
    }
  }
}
