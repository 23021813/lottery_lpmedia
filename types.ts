
export interface Submission {
  id: number;
  name: string;
  phone: string;
  nationalId: string;
  agency: string;
  answer?: string; // Đáp án câu hỏi trắc nghiệm (A, B, C, D)
  prizeWon?: string; // Giải thưởng đã trúng (nếu có)
}

export interface FormErrors {
  name?: string;
  phone?: string;
  nationalId?: string;
  agency?: string;
  answer?: string;
  captcha?: string;
}
