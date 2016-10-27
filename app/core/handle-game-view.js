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

  // Manual currying is fine too 🍛
  return (event): void => {
    const view = event.target;
    const wc = view.getWebContents();
    const ws = wc.session;

    view.addEventListeners('close', (e) => {
      console.log('Closing; disabling debugger.');
      wc.debugger.sendCommand('Network.disable');
    });

    const context = new HandlerContext({
      webContents: wc
    });

    if (!debuggerAttached) {
      try {
        wc.debugger.attach(PROTOCOL_VERSION);
        debuggerAttached = true;
      }
      catch (err) {
        console.error('An error has occurred:', err);
      }

      wc.executeJavascript(cookies);
      wc.debugger.on('detach', onDebuggerDetach(context));
      wc.debugger.on('message', onDebuggerMessage(context));
      wc.debugger.sendCommand('Network.enable');
      ws.webRequest.onBeforeRequest(onBeforeRequest(context));
    }
  }
}
