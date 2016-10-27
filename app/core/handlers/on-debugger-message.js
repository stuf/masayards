// @flow
import R from 'ramda';

/**
 * @param context
 * @param contextCallbackFn
 * @param event
 * @param method
 * @param params
 */
function onDebuggerMessage(context, contextCallbackFn, event, method, params) {
  if (context.handleMessages) {
    console.log('onDebuggerMessage: method=%s', method);
  }
}

export default R.curry(onDebuggerMessage);
