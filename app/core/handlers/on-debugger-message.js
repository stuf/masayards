// @flow
import R from 'ramda';

const onDebuggerMessage = (context, event, method, params) => {
  // Handler function body
  console.log('onDebuggerMessage: method=%s', method);
};

export default R.curry(onDebuggerMessage);
