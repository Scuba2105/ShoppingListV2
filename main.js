const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { DateTime } = require("luxon");
const setupPug = require('electron-pug');

// Define the main window, final list window, and pug converter 
let win1;
let win2;
let pug;

// Define the async function for sending the data to the renderer process.
async function sendWeeklyData() {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'shopping_items.json'))
  const dataArray = JSON.parse(data);
  return dataArray
};

ipcMain.handle('data:sendWeeklyData', sendWeeklyData);

// Generate the final shopping list page on a new screen
ipcMain.on('generate-list', (event, list) => {
  console.log(list);
  const mainWindow = new BrowserWindow({
    width: 1150,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolated: false
    }
  })
  win2 = mainWindow;
  mainWindow.setMenu(null);
  mainWindow.webContents.on('did-finish-load', () => {
    const version = require('./package.json').version;
    const windowTitle = `Shopping List Generator v${version}`;
    mainWindow.setTitle(windowTitle);
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile(`${__dirname}/pug/final-list.pug`);
});

// Save the data to the JSON file
ipcMain.on('data:saveData', (event, list) => {
  const listArray = JSON.parse(list);
  
  // Monday is 1 through to Sunday which is 7. 
  const currentDate = DateTime.now();
  const dayOfWeek = currentDate.weekday;
  let daysElapsed;
  if (dayOfWeek == 1) {
    daysElapsed = 6;
  }
  else {
    daysElapsed = dayOfWeek - 2;
  }
  const daysToEnd = 6 - daysElapsed;
  const dateEnd = currentDate.plus({days: daysToEnd}).ts;
  const storedDataObject = {endTimeStamp: dateEnd, shoppingListData: listArray};
  const storedDataString = JSON.stringify(storedDataObject, null, 2);
  fs.writeFileSync(path.join(__dirname, 'data', 'current_data.json'), storedDataString);
  win.webContents.send('save-data-success', 'Data successfully saved!');
});

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolated: false
    }
  })
  win1 = mainWindow;
  mainWindow.setMenu(null);
  mainWindow.webContents.on('did-finish-load', () => {
    const version = require('./package.json').version;
    const windowTitle = `Shopping List Generator v${version}`;
    mainWindow.setTitle(windowTitle);
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile('./html/index.html')
}


app.whenReady().then(async () => {
  try {
    createWindow()
    pug = await setupPug({pretty: true}, {})
    pug.on('error', err => console.error('electron-pug error', err))
  } catch (err) {
    // Could not initiate 'electron-pug'
  }  
  
  app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
      }
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});