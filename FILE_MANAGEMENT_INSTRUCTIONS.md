# 📁 File Management Instructions

## 🎯 How the System Works

This Lucky Draw app now works **ONLY with actual files** - no localStorage is used.

### 📂 File Structure
```
/data/
├── config.json    # Contains agencies and time settings
└── data.csv       # Contains all registration data and winners
```

## 🔄 How Data Updates Work

### When you make changes:
1. **Save agencies** → Downloads new `config.json`
2. **Save time settings** → Downloads new `config.json`  
3. **Register new user** → Downloads new `data.csv`
4. **Draw winner** → Downloads new `data.csv`
5. **Reset data** → Downloads new `data.csv`

### What you need to do:
1. 📥 **Find the downloaded file** in your Downloads folder
2. 📁 **Copy the file** to the `/data/` folder in your project
3. ✅ **Replace the old file**
4. 🔄 **Refresh the page** to see changes

## 🚀 Quick Steps

### For config.json updates:
```bash
1. App downloads new config.json
2. Move Downloads/config.json → /data/config.json
3. Refresh page
```

### For data.csv updates:
```bash
1. App downloads new data.csv
2. Move Downloads/data.csv → /data/data.csv  
3. Refresh page
```

## 🔧 Troubleshooting

### If data doesn't update:
- ✅ Check if file was actually replaced
- ✅ Make sure file names match exactly
- ✅ Try hard refresh (Ctrl+F5)
- ✅ Check browser console for errors

### If files are missing:
- The app will use default values
- Download will still work
- Just replace the file and refresh

## 💡 Benefits of This Approach

- ✅ **True file persistence** - data survives browser clearing
- ✅ **Easy backup** - just copy the files
- ✅ **Version control friendly** - files can be tracked in git
- ✅ **Portable** - move files between environments
- ✅ **No browser dependency** - works regardless of browser settings

## 🎮 User Experience

1. **Make changes** in the app
2. **Get notification** about file download
3. **Replace file** manually
4. **Refresh page** to see updates

This ensures your data is always stored in actual files, not browser storage!