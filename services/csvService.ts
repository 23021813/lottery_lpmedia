import type { Submission } from '../types';
import { readCSVFile, writeCSVFile } from './fileService';

// Function to parse CSV data
const parseCSV = (csvText: string): Submission[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return []; // No data or only header
  
  const headerLine = lines[0].toLowerCase();
  const hasAnswerCol = headerLine.includes('answer');

  const submissions: Submission[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(field => field.replace(/^"|"$/g, '').trim());
    let id: string, name: string, phone: string, nationalId: string, agency: string, answer: string | undefined, prizeWon: string | undefined;

    if (parts.length >= 7 || hasAnswerCol) {
      [id, name, phone, nationalId, agency, answer, prizeWon] = parts;
    } else {
      [id, name, phone, nationalId, agency, prizeWon] = parts;
      answer = undefined;
    }
    
    if (id && name) {
      submissions.push({
        id: parseInt(id),
        name,
        phone: phone || '',
        nationalId: nationalId || '',
        agency: agency || '',
        answer: answer || undefined,
        prizeWon: prizeWon || undefined
      });
    }
  }
  return submissions;
};

// Function to convert submissions to CSV format
const toCSV = (submissions: Submission[]): string => {
  const header = 'id,name,phone,nationalId,agency,answer,prizeWon';
  const rows = submissions.map(s => `${s.id},"${s.name}","${s.phone}","${s.nationalId}","${s.agency}","${s.answer || ''}","${s.prizeWon || ''}"`);
  return [header, ...rows].join('\n');
};

// Function to save CSV data
const saveCSVData = async (csvContent: string): Promise<void> => {
  await writeCSVFile(csvContent);
};

// Function to load CSV data
const loadCSVData = async (): Promise<string> => {
  return await readCSVFile();
};

// Function to get all submissions
export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const csvData = await loadCSVData();
    return parseCSV(csvData);
  } catch (error) {
    console.error("Failed to load submissions from CSV", error);
    return [];
  }
};

// Function to add a new submission
export const addSubmission = async (data: Omit<Submission, 'id'>): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        const submissions = await getSubmissions();
        
        // Check for duplicate phone or nationalId
        if (submissions.some(s => s.phone === data.phone)) {
            return reject(new Error('Số điện thoại này đã được đăng ký.'));
        }
        if (submissions.some(s => s.nationalId === data.nationalId)) {
            return reject(new Error('Số CCCD này đã được đăng ký.'));
        }

        const lastId = submissions.length > 0 ? Math.max(...submissions.map(s => s.id)) : 0;
        const newId = lastId + 1;
        const newSubmission: Submission = { ...data, id: newId };
        
        const updatedSubmissions = [...submissions, newSubmission];
        const csvContent = toCSV(updatedSubmissions);
        
        await saveCSVData(csvContent);
        
        resolve(newId);
      } catch (error) {
        reject(new Error("Không thể lưu thông tin. Vui lòng thử lại."));
      }
    }, 500);
  });
};

// Function to check if phone number already exists
export const checkPhoneExists = async (phone: string): Promise<boolean> => {
  const submissions = await getSubmissions();
  return submissions.some(s => s.phone === phone);
};

// Function to check if national ID already exists
export const checkNationalIdExists = async (nationalId: string): Promise<boolean> => {
  const submissions = await getSubmissions();
  return submissions.some(s => s.nationalId === nationalId);
};

// Function to reset CSV data
export const resetCSVData = async (): Promise<void> => {
  const initialData = 'id,name,phone,nationalId,agency,answer,prizeWon\n';
  await writeCSVFile(initialData);
};

// Function to export CSV data for download
export const exportCSV = async (): Promise<void> => {
  const csvData = await loadCSVData();
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'lucky_draw_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};