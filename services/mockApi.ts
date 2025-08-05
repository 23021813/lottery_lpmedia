import type { Submission } from '../types';
import { 
  getSubmissions as getCSVSubmissions, 
  addSubmission as addCSVSubmission, 
  checkPhoneExists,
  checkNationalIdExists,
  resetCSVData
} from './csvService';
import { readConfigFile, writeConfigFile } from './fileService';

export interface TimeSettings {
  regStart: string;
  regEnd: string;
}

// Function to get all submissions from CSV
export const getSubmissions = async (): Promise<Submission[]> => {
  return await getCSVSubmissions();
};

// Function to add a new submission
export const addSubmission = async (data: Omit<Submission, 'id'>): Promise<number> => {
  return await addCSVSubmission(data);
};

// Function to save time settings to config file
export const saveTimeSettings = async (settings: TimeSettings): Promise<void> => {
    try {
        const config = await readConfigFile();
        config.timeSettings = settings;
        await writeConfigFile(config);
    } catch (error) {
        throw new Error('Failed to save time settings');
    }
};

// Function to get time settings from config file
export const getTimeSettings = async (): Promise<TimeSettings | null> => {
    try {
        const config = await readConfigFile();
        return config.timeSettings.regStart || config.timeSettings.regEnd ? config.timeSettings : null;
    } catch (error) {
        console.error('Failed to get time settings:', error);
        return null;
    }
};

// Function to save agencies to config file
export const saveAgencies = async (agencies: string[]): Promise<void> => {
    try {
        const config = await readConfigFile();
        config.agencies = agencies;
        await writeConfigFile(config);
    } catch (error) {
        throw new Error('Failed to save agencies');
    }
};

// Function to get agencies from config file
export const getAgencies = async (): Promise<string[]> => {
    try {
        const config = await readConfigFile();
        return config.agencies || [];
    } catch (error) {
        console.error('Failed to get agencies:', error);
        return [];
    }
};

// Export validation functions
export { 
    checkPhoneExists, 
    checkNationalIdExists, 
    resetCSVData
};