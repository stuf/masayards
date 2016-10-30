import { app, BrowserWindow, Menu, shell } from 'electron';
import logger from './src/main/logger';
import pkg from './package.json';

logger.info(`Starting ${pkg.name} in mode '${process.env.NODE_ENV}'`);

let menu;
let template;
let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger.info('All windows have been closed, exiting.');
    app.quit();
  }
});

const installExtensions = async() => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('Installing development extensions');
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      }
      catch (e) {
      } // eslint-disable-line
    }
  }
};

logger.info('Applying command-line switches to the Chrome instance');
if (process.env.NODE_ENV) {
  app.commandLine.appendSwitch('remote-debugging-port', '8642');
}

const flashPluginPath = './lib/plugins/PepperFlashPlayer.plugin';
const flashPluginVer = '23.0.0.205';

logger.info(`Using version ${flashPluginVer} of the Pepper Flash Plugin`);

app.commandLine.appendSwitch('ppapi-flash-path', flashPluginPath);
app.commandLine.appendSwitch('ppapi-flash-version', flashPluginVer);

app.on('ready', async() => {
  await installExtensions();

  require('./src/main');

  mainWindow = new BrowserWindow({
    show: false,
    width: 1580,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/app/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click() {
            mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(mainWindow);
    });
  }

  if (process.platform === 'darwin') {
    template = [
      {
        label: 'Electron',
        submenu: [
          {
            label: 'About ElectronReact',
            selector: 'orderFrontStandardAboutPanel:'
          }, {
            type: 'separator'
          }, {
            label: 'Services',
            submenu: []
          }, {
            type: 'separator'
          }, {
            label: 'Hide ElectronReact',
            accelerator: 'Command+H',
            selector: 'hide:'
          }, {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          }, {
            label: 'Show All',
            selector: 'unhideAllApplications:'
          }, {
            type: 'separator'
          }, {
            label: 'Quit',
            accelerator: 'Command+Q',
            click() {
              app.quit();
            }
          }
        ]
      }, {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:'
          }, {
            label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          }, {
            type: 'separator'
          }, {
            label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:'
          }, {
            label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:'
          }, {
            label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:'
          }, {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          }
        ]
      }, {
        label: 'View',
        submenu: (process.env.NODE_ENV === 'development') ? [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click() {
              mainWindow.webContents.reload();
            }
          }, {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click() {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }, {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click() {
              mainWindow.toggleDevTools();
            }
          }
        ] : [
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click() {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        ]
      }, {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          }, {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:'
          }, {
            type: 'separator'
          }, {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
          }
        ]
      }, {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('http://electron.atom.io');
            }
          }, {
            label: 'Documentation',
            click() {
              shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
            }
          }, {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://discuss.atom.io/c/electron');
            }
          }, {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/atom/electron/issues');
            }
          }
        ]
      }
    ];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
  else {
    template = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O'
          }, {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click() {
              mainWindow.close();
            }
          }
        ]
      }, {
        label: '&View',
        submenu: (process.env.NODE_ENV === 'development') ? [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click() {
              mainWindow.webContents.reload();
            }
          }, {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click() {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }, {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click() {
              mainWindow.toggleDevTools();
            }
          }
        ] : [
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click() {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        ]
      }, {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('http://electron.atom.io');
            }
          }, {
            label: 'Documentation',
            click() {
              shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
            }
          }, {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://discuss.atom.io/c/electron');
            }
          }, {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/atom/electron/issues');
            }
          }
        ]
      }
    ];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
});
