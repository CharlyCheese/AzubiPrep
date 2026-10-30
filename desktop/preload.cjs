const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('azubiDesktop', Object.freeze({
  version: 1,
  loadCourse: () => ipcRenderer.invoke('pilot:load'),
  saveCourse: (value) => ipcRenderer.invoke('pilot:save', value),
  chooseProject: (mode) => ipcRenderer.invoke('pilot:choose', mode),
  inspectPreview: (html) => ipcRenderer.invoke('pilot:inspect', html),
  onInspectRequest: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = () => callback();
    ipcRenderer.on('pilot:inspect-request', listener);
    return () => ipcRenderer.removeListener('pilot:inspect-request', listener);
  },
}));
