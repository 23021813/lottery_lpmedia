// File service for reading/writing JSON data
// Note: In browser environment, we simulate file operations using localStorage
// In a real server environment, these would be actual file operations

interface ConfigData {
  agencies: string[];
  timeSettings: {
    regStart: string;
    regEnd: string;
  };
  lastUpdated: string;
}

// No localStorage keys needed - we only work with actual files

// Default config
const DEFAULT_CONFIG: ConfigData = {
  agencies: [
    "Đất xanh Bắc Trung Bộ",
    "Cenland Bắc Trung Bộ", 
    "Bhomes",
    "Tân Long",
    "Fivestar",
    "Hoàng Huy NT",
    "Âu Lạc Land",
    "City Homes",
    "Xứ Nghệ homes",
    "SVLand",
    "RealLand",
    "Aura Realty",
    "Titan Luxury",
    "MT group",
    "New Sky Land",
    "Fuji Land",
    "Haka Holding",
    "Phú Lâm",
    "GC Land"
  ],
  timeSettings: {
    regStart: "",
    regEnd: ""
  },
  lastUpdated: new Date().toISOString()
};

// Read config from actual file only
export const readConfigFile = async (): Promise<ConfigData> => {
  try {
    // Always fetch from the actual config.json file with aggressive cache busting
    const cacheBuster = Date.now() + Math.random();
    const response = await fetch(`/data/config.json?t=${cacheBuster}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    // If file doesn't exist, return default config
    console.warn('Config file not found, using default config');
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error reading config file:', error);
    return DEFAULT_CONFIG;
  }
};

// Write config to file using API
export const writeConfigFile = async (config: ConfigData): Promise<void> => {
  try {
    config.lastUpdated = new Date().toISOString();
    
    // Use API to write file directly (both development and production)
    const response = await fetch('/api/write-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('Config file updated successfully');
        // Show success message but don't reload page (stay in admin panel)
        return;
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error writing config file:', error);
    alert(`Lỗi khi lưu cấu hình: ${error.message}`);
    throw new Error('Failed to save configuration');
  }
};

// Read CSV data from file only
export const readCSVFile = async (): Promise<string> => {
  try {
    // Always fetch from the actual data.csv file with aggressive cache busting
    const cacheBuster = Date.now() + Math.random();
    const response = await fetch(`/data/data.csv?t=${cacheBuster}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (response.ok) {
      const data = await response.text();
      return data;
    }
    
    // If file doesn't exist, return default header
    console.warn('CSV file not found, using default header');
    return 'id,name,phone,nationalId,agency,answer,prizeWon\n';
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return 'id,name,phone,nationalId,agency,answer,prizeWon\n';
  }
};

// Write CSV data to file using API
export const writeCSVFile = async (csvContent: string): Promise<void> => {
  try {
    console.log('writeCSVFile called with content length:', csvContent.length);
    console.log('First 200 chars:', csvContent.substring(0, 200));
    
    // Use API to write file directly (both development and production)
    const response = await fetch('/api/write-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: csvContent })
    });
    
    console.log('API response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('API response result:', result);
      if (result.success) {
        console.log('CSV file updated successfully via API');
        return;
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } else {
      const errorText = await response.text();
      console.error('API response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
  } catch (error) {
    console.error('Error writing CSV file:', error);
    alert(`Lỗi khi lưu dữ liệu CSV: ${error.message}`);
    throw new Error('Failed to save CSV data');
  }
};

// Export config for download
export const downloadConfigFile = (): void => {
  readConfigFile().then(config => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'config.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

// Export CSV for download
export const downloadCSVFile = (): void => {
  readCSVFile().then(csvData => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

// Force reload from files (no localStorage involved)
export const forceReloadFromFiles = (): void => {
  // Simply refresh the page to reload from files
  window.location.reload();
};