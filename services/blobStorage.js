import { put, list, del } from '@vercel/blob';

class BlobStorage {
  constructor() {
    // Vercel Blob sẽ tự động sử dụng BLOB_READ_WRITE_TOKEN từ environment variables
  }

  /**
   * Lưu config.json vào Vercel Blob
   * @param {Object} config - Config object to save
   * @returns {Promise<Object>} - Blob response
   */
  async saveConfig(config) {
    try {
      const configString = JSON.stringify(config, null, 2);
      const blob = await put('config.json', configString, {
        access: 'public',
        contentType: 'application/json'
      });
      
      console.log('✅ Config saved to Vercel Blob:', blob.url);
      return { success: true, url: blob.url };
    } catch (error) {
      console.error('❌ Error saving config to Vercel Blob:', error);
      throw error;
    }
  }

  /**
   * Lưu data.csv vào Vercel Blob
   * @param {string} csvContent - CSV content to save
   * @returns {Promise<Object>} - Blob response
   */
  async saveCsv(csvContent) {
    try {
      const blob = await put('data.csv', csvContent, {
        access: 'public',
        contentType: 'text/csv'
      });
      
      console.log('✅ CSV saved to Vercel Blob:', blob.url);
      return { success: true, url: blob.url };
    } catch (error) {
      console.error('❌ Error saving CSV to Vercel Blob:', error);
      throw error;
    }
  }

  /**
   * Đọc config.json từ Vercel Blob
   * @returns {Promise<Object>} - Config object
   */
  async getConfig() {
    try {
      const { blobs } = await list({ prefix: 'config.json' });
      
      if (blobs.length === 0) {
        // Trả về config mặc định nếu chưa có
        return {
          title: "Lucky Draw Registration",
          description: "Register for our lucky draw event",
          maxParticipants: 100,
          isActive: true
        };
      }

      const configBlob = blobs[0];
      const response = await fetch(configBlob.url);
      const config = await response.json();
      
      console.log('✅ Config loaded from Vercel Blob');
      return config;
    } catch (error) {
      console.error('❌ Error loading config from Vercel Blob:', error);
      // Trả về config mặc định nếu có lỗi
      return {
        title: "Lucky Draw Registration",
        description: "Register for our lucky draw event",
        maxParticipants: 100,
        isActive: true
      };
    }
  }

  /**
   * Đọc data.csv từ Vercel Blob
   * @returns {Promise<string>} - CSV content
   */
  async getCsv() {
    try {
      const { blobs } = await list({ prefix: 'data.csv' });
      
      if (blobs.length === 0) {
        // Trả về CSV header mặc định nếu chưa có
        return 'name,email,phone,registrationTime\n';
      }

      const csvBlob = blobs[0];
      const response = await fetch(csvBlob.url);
      const csvContent = await response.text();
      
      console.log('✅ CSV loaded from Vercel Blob');
      return csvContent;
    } catch (error) {
      console.error('❌ Error loading CSV from Vercel Blob:', error);
      // Trả về CSV header mặc định nếu có lỗi
      return 'name,email,phone,registrationTime\n';
    }
  }

  /**
   * Liệt kê tất cả blobs
   * @returns {Promise<Array>} - List of blobs
   */
  async listFiles() {
    try {
      const { blobs } = await list();
      return blobs;
    } catch (error) {
      console.error('❌ Error listing blobs:', error);
      return [];
    }
  }

  /**
   * Xóa một file
   * @param {string} filename - File name to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(filename) {
    try {
      const { blobs } = await list({ prefix: filename });
      
      if (blobs.length > 0) {
        await del(blobs[0].url);
        console.log(`✅ Deleted ${filename} from Vercel Blob`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error deleting ${filename} from Vercel Blob:`, error);
      return false;
    }
  }
}

export default new BlobStorage();