const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const setupPug = require('electron-pug');
const {getEndDate} = require('./utils/utils');


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
ipcMain.on('generate-list', async (event, list) => {
  // Generate array data for template
  const finalArray = [];
  const categories = ['Fresh Produce','Dairy','Grains & Cereals','Baking','Frozen','Oils & Seasoning','Snacks, Spreads & Drink',
'Cleaning & Household'];
  try {  
    const shoppingList = JSON.parse(list);
    categories.forEach((category) => {
      const classAttribute = category.toLowerCase().replace('& ','').replace(/\s/g,'-').replace(',','');
      const categoryItems = shoppingList.filter((item) => {
        return item.category == category;
      }).map((item) => {
        return item.name;
      }).join(', ');
      if (categoryItems.length > 0) {
        finalArray.push({classAtt: classAttribute, category: category, selectedItems: categoryItems});
      }
    });

    // Determine the end date of the current shopping week
    const dateEndArray = getEndDate().toISO().split('T')[0].split('-');
    const dateEnd = `${dateEndArray[2]}/${dateEndArray[1]}/${dateEndArray[0]}`;
    
    // Get date of next Monday
    const locals = {date: dateEnd, shoppingItems: finalArray}
    
    // Setup pug converter
    if (pug == undefined) {
      pug = await setupPug({pretty: true}, locals);
    }

    // Create new window and load pug file
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
    
    pug.on('error', err => console.error('electron-pug error', err))
  } catch (err) {
    console.error('finalList pug template error', err);
  }  
});

// Save the data to the JSON file
ipcMain.on('data:saveData', (event, list) => {
  const listArray = JSON.parse(list);
  
  // Determine the end date of the current shopping week
  const dateEnd = getEndDate(); 
  
  const storedDataObject = {endTimeStamp: dateEnd.ts, shoppingListData: listArray};
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


app.whenReady().then(() => {
  createWindow()
    
  app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
      }
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});