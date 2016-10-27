// @flow
import R from 'ramda';
import { Map, Record } from 'immutable';
import { cookies } from './cookies';
import { onDebuggerDetach, onDebuggerMessage, onBeforeRequest, viewOnCloseHandler } from './handlers';
import { HandlerContext } from './records';
import { transformerActionMap } from './transformer-action-map';

const PROTOCOL_VERSION: string = '1.1';

function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

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
    const webContents = view.getWebContents();
    const webSession = webContents.session;
    let currentCtx = context.merge({ webContents: webContents });

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

      const updateContextFn = responseCtx => {
        if (!!responseCtx) {
          currentCtx = currentCtx.merge(responseCtx);
        }
        console.log('currentCtx => %s', currentCtx.toString());
      }

      webContents.executeJavaScript(cookies);
      webContents.debugger.on('detach', onDebuggerDetach(currentCtx));
      webContents.debugger.on('message', onDebuggerMessage(currentCtx, updateContextFn));
      webContents.debugger.sendCommand('Network.enable');
      webSession.webRequest.onBeforeRequest(onBeforeRequest(currentCtx, updateContextFn));
    }
  }
}
