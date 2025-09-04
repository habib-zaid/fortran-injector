# Fortran Function Injector 🔧

An Electron app that automatically injects `write` statements above Fortran function calls for debugging purposes.

## What It Does

This app searches through Fortran 77 files and adds `write` statements above function calls to log parameter values. For example:

**Before:**
```fortran
      call blyat (mom, mommy)
```

**After:**
```fortran
      write (mom, mommy)
      call blyat (mom, mommy)
```

## Features

- 🔍 Search through all Fortran files in a workspace
- 📝 Automatically inject `write` statements above function calls
- 🎯 Preserve Shift-JIS encoding for Japanese text
- 🖥️ Clean, modern Electron UI
- 📁 Browse and select workspace directories

## How to Use

1. **Enter Function Name**: Type the name of the function you want to find (e.g., `blyat`)
2. **Select Workspace**: Choose the directory containing your Fortran files
3. **Search & Inject**: Click the button to find all function calls and inject write statements
4. **Review Results**: See which files were modified and what was injected

## Installation

```bash
npm install
npm start
```

## Development

```bash
npm run dev
```

## Supported File Types

- `.f` - Fortran 77 source files
- `.F` - Fortran 77 source files (uppercase)
- `.f90` - Fortran 90 source files
- `.F90` - Fortran 90 source files (uppercase)
- `.f95` - Fortran 95 source files
- `.F95` - Fortran 95 source files (uppercase)

## How It Works

1. **File Discovery**: Uses glob patterns to find all Fortran files in the workspace
2. **Pattern Matching**: Searches for `call function_name (params)` patterns
3. **Parameter Extraction**: Extracts parameter names from function calls
4. **Write Statement Generation**: Creates `write (param1, param2)` statements
5. **File Modification**: Inserts write statements above function calls
6. **Encoding Preservation**: Maintains Shift-JIS encoding for Japanese text

## Example Output

When you search for function calls to `blyat`, the app will:

1. Find all files containing `call blyat (...)` 
2. Extract the parameters (e.g., `mom, mommy`)
3. Insert `write (mom, mommy)` above each call
4. Show you exactly what was modified

## Notes

- The app preserves the original file formatting and indentation
- It only adds write statements where they don't already exist
- All modifications are done in-place with proper encoding handling
- Backup your files before running if you're concerned about modifications

## Built With

- Electron
- TypeScript
- Webpack
- Node.js
