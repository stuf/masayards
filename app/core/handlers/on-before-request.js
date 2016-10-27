// @flow

const onBeforeRequest = (context) => () => {
  // Handler function body
  console.log('onBeforeRequest');
};

export default onBeforeRequest;
