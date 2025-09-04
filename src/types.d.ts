export interface ElectronAPI {
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
