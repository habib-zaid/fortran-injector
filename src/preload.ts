import { contextBridge, ipcRenderer } from 'electron';

export type ElectronAPI = {
  openDirectoryDialog: () => Promise<string | undefined>;
  openOutputDirectoryDialog: () => Promise<string | undefined>;
  searchAndInject: (functionName: string, workspacePath: string) => Promise<void>;
  exportToCsv: (results: any[], outputPath: string, filename: string) => Promise<void>;
  onSearchResults: (callback: (results: any[]) => void) => void;
  onStatusUpdate: (callback: (message: string, type: string) => void) => void;
  onCsvExportComplete: (callback: (success: boolean, message: string) => void) => void;
  // Theme methods
  toggleDarkMode: () => Promise<boolean>;
  setSystemTheme: () => Promise<void>;
  getThemeInfo: () => Promise<{ shouldUseDarkColors: boolean; themeSource: string }>;
  cycleTheme: (currentMode: string) => Promise<string>;
};

const electronAPI: ElectronAPI = {
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  openOutputDirectoryDialog: () => ipcRenderer.invoke('open-output-directory-dialog'),
  searchAndInject: (functionName: string, workspacePath: string) => 
    ipcRenderer.invoke('search-and-inject', functionName, workspacePath),
  exportToCsv: (results: any[], outputPath: string, filename: string) => 
    ipcRenderer.invoke('export-to-csv', results, outputPath, filename),
  onSearchResults: (callback: (results: any[]) => void) => {
    ipcRenderer.on('search-results', (_event, results) => callback(results));
  },
  onStatusUpdate: (callback: (message: string, type: string) => void) => {
    ipcRenderer.on('status-update', (_event, message, type) => callback(message, type));
  },
  onCsvExportComplete: (callback: (success: boolean, message: string) => void) => {
    ipcRenderer.on('csv-export-complete', (_event, success, message) => callback(success, message));
  },
  // Theme methods
  toggleDarkMode: () => ipcRenderer.invoke('dark-mode:toggle'),
  setSystemTheme: () => ipcRenderer.invoke('dark-mode:system'),
  getThemeInfo: () => ipcRenderer.invoke('dark-mode:get'),
  cycleTheme: (currentMode: string) => ipcRenderer.invoke('dark-mode:cycle', currentMode),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
