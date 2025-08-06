
export interface Submission {
  id: number;
  name: string;
  phone: string;
  nationalId: string;
  agency: string;
  prizeWon?: string; // Giải thưởng đã trúng (nếu có)
}

export interface FormErrors {
  name?: string;
  phone?: string;
  nationalId?: string;
  agency?: string;
  captcha?: string;
}
