// @flow
import R from 'ramda';
import config from '../../config';
import { HandlerContext } from '../records';

/**
 * Curried handler function for the `onBeforeRequest` event
 *
 * @param {any} context
 * @param {any} contextCallbackFn
 * @param {any} details
 * @param {any} callback
 */
function onBeforeRequest(context, contextCallbackFn, details, callback) {
  const shouldCancelRequest = config.gameSwfPrefix.test(details.url) && context.firstGameLoad;
  callback({ cancel: shouldCancelRequest });

  // Detect when the game SWF is loaded and take it into view.
  if (shouldCancelRequest) {
    context.webContents.loadURL(details.url);
    contextCallbackFn(context.merge({
      firstGameLoad: false,
      handleMessages: true
    }));
  }
}

export default R.curry(onBeforeRequest);
