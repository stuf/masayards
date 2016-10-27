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
  console.log('onBeforeRequest');
  const shouldCancel = config.gameSwfPrefix.test(details.url) && context.firstGameLoad;
  callback({ cancel: shouldCancel });

  if (shouldCancel) {
    console.log('Found game SWF at URL %s', details.url);
    context.webContents.loadURL(details.url);
    const newContext = context.set('firstGameLoad', false);
    contextCallbackFn(newContext);
  }
}

export default R.curry(onBeforeRequest);
