const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendWeeklyData: () => ipcRenderer.invoke('data:sendWeeklyData'),
  saveData: (shoppingList) => ipcRenderer.send('data:saveData', shoppingList),
  listenForSave: () => ipcRenderer.on('save-data-success', (evt, message) => {
    alert(message); 
  }),   
  generateList: (finalList) => ipcRenderer.send('generate-list', finalList),
  printList: () => ipcRenderer.invoke('printShoppingData')
});