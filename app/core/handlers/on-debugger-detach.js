// @flow
import R from 'ramda';

function onDebuggerDetach(context, reason) {
  // Handler function body
  console.log('onDebuggerDetach: reason=%s', reason);
}

export default R.curry(onDebuggerDetach);
