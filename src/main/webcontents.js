// @flow
import { ipcMain, webContents } from 'electron';

let viewWebContents = null;

ipcMain.on('register-game-view', (event, webContentsId) => {
  console.log('Registering game view with the ID `%s`', webContentsId);
  viewWebContents = webContentsId;
});
