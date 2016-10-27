// @flow
import { Record } from 'immutable';

export const HandlerContext = Record({
  webContents: undefined,
  transformerActions: undefined,
  firstGameLoad: undefined,
  handleMessages: undefined
});
