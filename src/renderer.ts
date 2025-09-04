/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { PreferenceDB, PREFERENCE_KEYS } from './db';

// DOM elements
const functionNameInput = document.getElementById('functionName') as HTMLInputElement;
const workspacePathInput = document.getElementById('workspacePath') as HTMLInputElement;
const outputPathInput = document.getElementById('outputPath') as HTMLInputElement;
const browseBtn = document.getElementById('browseBtn') as HTMLButtonElement;
const browseOutputBtn = document.getElementById('browseOutputBtn') as HTMLButtonElement;
const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement;
const exportCsvBtn = document.getElementById('exportCsvBtn') as HTMLButtonElement;
const exportSection = document.getElementById('exportSection') as HTMLDivElement;
const resultsList = document.getElementById('resultsList') as HTMLDivElement;
const statusMessage = document.getElementById('statusMessage') as HTMLDivElement;

// Store search results for CSV export
let currentSearchResults: any[] = [];
let currentFunctionName: string = '';

// Initialize IndexedDB
const preferenceDB = new PreferenceDB();
console.log('📦 PreferenceDB instance created:', preferenceDB);

// Event listeners
browseBtn.addEventListener('click', handleBrowse);
browseOutputBtn.addEventListener('click', handleBrowseOutput);
searchBtn.addEventListener('click', handleSearch);
exportCsvBtn.addEventListener('click', handleExportCsv);

// Add input change listeners to save preferences in real-time
functionNameInput.addEventListener('input', () => {
  const value = functionNameInput.value.trim();
  savePreference(PREFERENCE_KEYS.FUNCTION_NAME, value || '');
  console.log('💾 Function name saved:', value || '(empty)');
});

workspacePathInput.addEventListener('input', () => {
  const value = workspacePathInput.value.trim();
  savePreference(PREFERENCE_KEYS.WORKSPACE_PATH, value || '');
  console.log('💾 Workspace path saved:', value || '(empty)');
});

outputPathInput.addEventListener('input', () => {
  const value = outputPathInput.value.trim();
  savePreference(PREFERENCE_KEYS.OUTPUT_PATH, value || '');
  console.log('💾 Output path saved:', value || '(empty)');
});

// Also listen for 'change' events (paste, programmatic changes)
functionNameInput.addEventListener('change', () => {
  const value = functionNameInput.value.trim();
  savePreference(PREFERENCE_KEYS.FUNCTION_NAME, value || '');
  console.log('💾 Function name changed and saved:', value || '(empty)');
});

workspacePathInput.addEventListener('change', () => {
  const value = workspacePathInput.value.trim();
  savePreference(PREFERENCE_KEYS.WORKSPACE_PATH, value || '');
  console.log('💾 Workspace path changed and saved:', value || '(empty)');
});

outputPathInput.addEventListener('change', () => {
  const value = outputPathInput.value.trim();
  savePreference(PREFERENCE_KEYS.OUTPUT_PATH, value || '');
  console.log('💾 Output path changed and saved:', value || '(empty)');
});

// Initialize app with saved preferences
async function initializeApp() {
  try {
    await preferenceDB.init();
    await loadSavedPreferences();
  } catch (error) {
    console.error('Failed to initialize preferences:', error);
  }
}

async function loadSavedPreferences() {
  try {
    // Load workspace path
    const savedWorkspacePath = await preferenceDB.getPreference(PREFERENCE_KEYS.WORKSPACE_PATH);
    if (savedWorkspacePath) {
      workspacePathInput.value = savedWorkspacePath;
    }

    // Load output path
    const savedOutputPath = await preferenceDB.getPreference(PREFERENCE_KEYS.OUTPUT_PATH);
    if (savedOutputPath) {
      outputPathInput.value = savedOutputPath;
    }

    // Load last function name
    const savedFunctionName = await preferenceDB.getPreference(PREFERENCE_KEYS.FUNCTION_NAME);
    if (savedFunctionName) {
      functionNameInput.value = savedFunctionName;
    }

    // Load and apply saved theme
    const savedThemeMode = await preferenceDB.getPreference(PREFERENCE_KEYS.THEME_MODE);
    if (savedThemeMode && savedThemeMode !== 'system') {
      console.log('🎨 Loading saved theme:', savedThemeMode);
      // Wait a bit for main process to be ready, then apply the saved theme
      setTimeout(async () => {
        try {
          if (savedThemeMode === 'dark') {
            await window.electronAPI.toggleDarkMode();
            console.log('🌙 Dark theme applied');
          } else if (savedThemeMode === 'light') {
            await window.electronAPI.toggleDarkMode();
            await window.electronAPI.toggleDarkMode();
            console.log('☀️ Light theme applied');
          }
        } catch (error) {
          console.error('Failed to apply saved theme:', error);
        }
      }, 500);
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
}

async function savePreference(key: string, value: string) {
  try {
    await preferenceDB.setPreference(key, value);
  } catch (error) {
    console.error('Failed to save preference:', error);
  }
}

function handleBrowse() {
  // This will be handled by the main process
  window.electronAPI.openDirectoryDialog().then((selectedPath) => {
    if (selectedPath) {
      workspacePathInput.value = selectedPath;
      savePreference(PREFERENCE_KEYS.WORKSPACE_PATH, selectedPath);
    }
  });
}

function handleBrowseOutput() {
  // This will be handled by the main process
  window.electronAPI.openOutputDirectoryDialog().then((selectedPath) => {
    if (selectedPath) {
      outputPathInput.value = selectedPath;
      savePreference(PREFERENCE_KEYS.OUTPUT_PATH, selectedPath);
    }
  });
}

function handleSearch() {
  const functionName = functionNameInput.value.trim();
  let workspacePath = workspacePathInput.value.trim();
  
  if (!functionName) {
    showStatus('Please enter a function name', 'is-danger');
    return;
  }
  
  // Set default to root if no path selected
  if (!workspacePath) {
    workspacePath = '.';
    workspacePathInput.value = '.';
  }
  
  showStatus('Searching for function calls...', 'is-info');
  
  // Store for CSV export
  currentFunctionName = functionName;
  
  // Preferences are now saved in real-time via input listeners
  // No need to save here again
  
  // Call the main process to search and inject
  window.electronAPI.searchAndInject(functionName, workspacePath);
}

function handleExportCsv() {
  if (currentSearchResults.length === 0) {
    showStatus('No results to export', 'is-danger');
    return;
  }
  
  const outputPath = outputPathInput.value.trim() || '.';
  const now = new Date();
  
  // Use UTC methods to avoid locale issues
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  
  const date = `${year}${month}${day}`;
  const time = `${hours}${minutes}`;
  const filename = `${currentFunctionName}_${date}_${time}.csv`;
  
  // Call main process to export CSV
  window.electronAPI.exportToCsv(currentSearchResults, outputPath, filename);
}

function showStatus(message: string, type: string) {
  statusMessage.textContent = message;
  statusMessage.className = `notification ${type}`;
  statusMessage.style.display = 'block';
}

function displayResults(results: any[]) {
  resultsList.innerHTML = '';
  currentSearchResults = results;
  
  if (results.length === 0) {
    resultsList.innerHTML = '<p class="has-text-grey">No function calls found.</p>';
    exportSection.style.display = 'none';
    return;
  }
  
  // Show export button when we have results
  exportSection.style.display = 'block';
  
  results.forEach((result, index) => {
    const resultItem = document.createElement('div');
    resultItem.className = 'box';
    
    resultItem.innerHTML = `
      <h4 class="title is-5">File: ${result.fileName}</h4>
      <div class="content">
        <p><strong>Line:</strong> ${result.lineNumber}</p>
        <p><strong>Function Call:</strong> <code>${result.functionCall}</code></p>
        <p><strong>Parameters:</strong> <code>${result.parameters.join(', ')}</code></p>
        <p><strong>Status:</strong> 
          <span class="tag ${result.status.includes('Injected') ? 'is-success' : result.status.includes('exists') ? 'is-warning' : 'is-info'}">
            ${result.status}
          </span>
        </p>
      </div>
    `;
    
    resultsList.appendChild(resultItem);
  });
}

// Listen for results from main process
window.electronAPI.onSearchResults((results: any[]) => {
  displayResults(results);
});

// Listen for status updates from main process
window.electronAPI.onStatusUpdate((message: string, type: string) => {
  showStatus(message, type === 'success' ? 'is-success' : type === 'error' ? 'is-danger' : 'is-info');
});

// Listen for CSV export completion
window.electronAPI.onCsvExportComplete((success: boolean, message: string) => {
  if (success) {
    showStatus(`CSV exported successfully: ${message}`, 'is-success');
  } else {
    showStatus(`CSV export failed: ${message}`, 'is-danger');
  }
});

// Test function to check database contents
async function debugDatabase() {
  try {
    console.log('🔍 Debugging database contents...');
    const allPrefs = await preferenceDB.getAllPreferences();
    console.log('📊 All preferences in database:', allPrefs);
    
    // Test individual reads
    const workspacePath = await preferenceDB.getPreference(PREFERENCE_KEYS.WORKSPACE_PATH);
    const outputPath = await preferenceDB.getPreference(PREFERENCE_KEYS.OUTPUT_PATH);
    const functionName = await preferenceDB.getPreference(PREFERENCE_KEYS.FUNCTION_NAME);
    
    console.log('📁 Workspace path:', workspacePath);
    console.log('📁 Output path:', outputPath);
    console.log('🔍 Function name:', functionName);
  } catch (error) {
    console.error('❌ Database debug failed:', error);
  }
}

// Add debug function to window for manual testing
(window as any).debugDB = debugDatabase;

// Add theme preference saving function to window for HTML script
(window as any).saveThemePreference = async (themeMode: string) => {
  console.log('🎨 Saving theme preference:', themeMode);
  await savePreference(PREFERENCE_KEYS.THEME_MODE, themeMode);
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, initializing app...');
  initializeApp();
});

