const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('azubiDesktop', Object.freeze({
  version: 1,
  journey: Object.freeze({
    load: (topicId = 'common-lf1-role') => ipcRenderer.invoke('journey:load', topicId),
    save: (value) => {
      const own = key => value != null && Object.hasOwn(value, key);
      const payload = { raw: own('raw') ? value.raw : undefined, expectedRaw: own('expectedRaw') ? value.expectedRaw : undefined };
      if (value != null && typeof value === 'object' && 'topicId' in value) payload.topicId = own('topicId') ? value.topicId : undefined;
      return ipcRenderer.invoke('journey:save', payload);
    },
  }),
  jsPilot: Object.freeze({
    catalog: () => ipcRenderer.invoke('js-pilot:catalog'),
    start: id => ipcRenderer.invoke('js-pilot:start', id),
    stop: id => ipcRenderer.invoke('js-pilot:stop', id),
    onEvent: callback => {
      if (typeof callback !== 'function') return () => {};
      const listener = (_event, value) => callback(value);
      ipcRenderer.on('js-pilot:event', listener);
      return () => ipcRenderer.removeListener('js-pilot:event', listener);
    },
  }),
  loadAiPreferences: () => ipcRenderer.invoke('ai:preferences-load'),
  saveAiPreferences: (value) => ipcRenderer.invoke('ai:preferences-save', value),
  openMaterialFolder: () => ipcRenderer.invoke('rag:open-folder'),
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
