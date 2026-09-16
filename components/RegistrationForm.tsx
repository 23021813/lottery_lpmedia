import React, { useState, useEffect } from 'react';
import { addSubmission, getTimeSettings, checkPhoneExists, checkNationalIdExists } from '../services/mockApi';
import { verifyCaptcha } from '../services/captchaService';
import type { FormErrors } from '../types';
import { TURNSTILE_SITE_KEY } from '../constants';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { TurnstileComponent } from './ui/Turnstile';
import { Logo } from './ui/Logo';

interface RegistrationFormProps {
  onNewSubmission: () => void;
  agencies: string[];
}

export const QUIZ_QUESTION = {
  question: 'Đâu là giá bán căn Studio 40.3m2 (Chưa trừ chính sách, chưa VAT và PBT)?',
  options: [
    { key: 'A', text: 'A. 1,789,286,000 VND' },
    { key: 'B', text: 'B. 1,769,050,946 VND' },
    { key: 'C', text: 'C. 1,696,000,000 VND' },
    { key: 'D', text: 'D. 1,698,506,860 VND' },
  ]
};

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNewSubmission, agencies }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [agency, setAgency] = useState('');
  const [answer, setAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ id: number | null, message: string, isError: boolean }>({ id: null, message: '', isError: false });
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [registeredUser, setRegisteredUser] = useState<{ id: number; name: string; phone: string; nationalId: string; agency: string; answer?: string } | null>(null);

  const [isRegActive, setIsRegActive] = useState(true);
  const [regMessage, setRegMessage] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lucky_draw_registered_user');
      if (saved) {
        setRegisteredUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
  }, []);

  useEffect(() => {
    const checkRegistrationTime = async () => {
      const settings = await getTimeSettings();
      if (settings && settings.regStart && settings.regEnd) {
        const now = new Date();
        const start = new Date(settings.regStart);
        const end = new Date(settings.regEnd);
        
        if (now < start) {
          setIsRegActive(false);
          setRegMessage(`Đăng ký sẽ mở vào lúc: ${start.toLocaleString('vi-VN')}`);
        } else if (now > end) {
          setIsRegActive(false);
          setRegMessage('Thời gian đăng ký đã kết thúc.');
        } else {
          setIsRegActive(true);
          setRegMessage('');
        }
      } else {
        setIsRegActive(true);
        setRegMessage('');
      }
    };

    checkRegistrationTime();
    const interval = setInterval(checkRegistrationTime, 30000); // Check every 30 seconds instead of 60
    return () => clearInterval(interval);
  }, []);

  // Validate individual field
  const validateField = async (fieldName: string, value: string): Promise<string> => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Vui lòng nhập họ và tên.';
        break;
      case 'phone':
        if (!value.trim()) return 'Vui lòng nhập số điện thoại.';
        if (!/^\d{10,11}$/.test(value)) return 'Số điện thoại không hợp lệ.';
        if (await checkPhoneExists(value)) return 'Số điện thoại này đã được đăng ký.';
        break;
      case 'nationalId':
        if (!value.trim()) return 'Vui lòng nhập số CCCD.';
        if (!/^\d{12}$/.test(value)) return 'CCCD phải có 12 chữ số.';
        if (await checkNationalIdExists(value)) return 'Số CCCD này đã được đăng ký.';
        break;
      case 'agency':
        if (!value) return 'Vui lòng chọn một đại lý.';
        break;
      case 'answer':
        if (!value) return 'Vui lòng chọn một đáp án cho câu hỏi.';
        break;
      case 'captcha':
        if (!captchaToken) return 'Vui lòng xác thực captcha.';
        break;
    }
    return '';
  };

  // Handle field blur for realtime validation
  const handleFieldBlur = async (fieldName: string, value: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const error = await validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Clear error when user starts typing again
  const handleFieldChange = (fieldName: string, value: string, setter: (value: string) => void) => {
    setter(value);
    if (touchedFields.has(fieldName)) {
      // Clear error immediately if field was previously touched
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  // Handle captcha verification
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setErrors(prev => ({
      ...prev,
      captcha: ''
    }));
  };

  // Handle captcha error
  const handleCaptchaError = () => {
    setCaptchaToken('');
    setErrors(prev => ({
      ...prev,
      captcha: 'Xác thực captcha thất bại. Vui lòng thử lại.'
    }));
  };

  // Handle captcha expire
  const handleCaptchaExpire = () => {
    setCaptchaToken('');
    setErrors(prev => ({
      ...prev,
      captcha: 'Captcha đã hết hạn. Vui lòng xác thực lại.'
    }));
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};
    
    const nameError = await validateField('name', name);
    if (nameError) newErrors.name = nameError;
    
    const phoneError = await validateField('phone', phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const nationalIdError = await validateField('nationalId', nationalId);
    if (nationalIdError) newErrors.nationalId = nationalIdError;
    
    const agencyError = await validateField('agency', agency);
    if (agencyError) newErrors.agency = agencyError;
    
    const answerError = await validateField('answer', answer);
    if (answerError) newErrors.answer = answerError;

    const captchaError = await validateField('captcha', captchaToken);
    if (captchaError) newErrors.captcha = captchaError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionResult({ id: null, message: '', isError: false });

    if (!(await validateForm())) {
      return;
    }

    setIsSubmitting(true);
    try {
      // First verify captcha with server
      const captchaVerification = await verifyCaptcha(captchaToken, {
        name, phone, nationalId, agency
      });

      if (!captchaVerification.success) {
        setSubmissionResult({ 
          id: null, 
          message: `Xác thực captcha thất bại: ${captchaVerification.error}`, 
          isError: true 
        });
        // Reset captcha on verification failure
        setCaptchaToken('');
        setErrors(prev => ({
          ...prev,
          captcha: 'Vui lòng xác thực captcha lại.'
        }));
        return;
      }

      // If captcha verified, proceed with submission
      const newId = await addSubmission({ name, phone, nationalId, agency, answer });
      const record = { id: newId, name, phone, nationalId, agency, answer };
      try {
        localStorage.setItem('lucky_draw_registered_user', JSON.stringify(record));
        setRegisteredUser(record);
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }

      setSubmissionResult({ id: newId, message: 'success', isError: false });
      setName('');
      setPhone('');
      setNationalId('');
      setAgency('');
      setAnswer('');
      setCaptchaToken('');
      setErrors({});
      setTouchedFields(new Set());
      onNewSubmission();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
      setSubmissionResult({ id: null, message: `Đăng ký thất bại: ${errorMessage}`, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredUser && !submissionResult.id) {
    return (
      <Card>
        <Logo />
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 mb-1">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-[#ffdca3] tracking-wider uppercase font-['Be_Vietnam_Pro']">BẠN ĐÃ ĐĂNG KÝ THÀNH CÔNG</h3>
          <p className="text-xs text-[#a89f91]">
            Hệ thống ghi nhận thiết bị này đã hoàn tất đăng ký check-in sự kiện.
          </p>

          <div className="bg-gradient-to-b from-[#2a1c11] to-[#160f0a] border border-[#ba7c38]/60 text-white rounded-2xl p-6 shadow-2xl space-y-2">
            <p className="text-xs uppercase tracking-wider font-bold text-[#ba7c38]">Mã số quay thưởng của bạn</p>
            <div className="text-5xl font-black text-[#ffdca3] tracking-widest drop-shadow-md">
              #{registeredUser.id.toString().padStart(4, "0")}
            </div>
            <p className="text-xs text-[#c4b5a2] italic">Vui lòng lưu lại mã số này để đối chiếu khi quay thưởng!</p>
          </div>

          <div className="bg-[#18120d]/90 border border-[#ba7c38]/30 rounded-xl p-4 text-left text-xs text-[#d4c5b2] space-y-2">
            <div><strong className="text-[#ba7c38]">Họ và tên:</strong> <span className="text-white font-medium ml-1.5">{registeredUser.name}</span></div>
            <div><strong className="text-[#ba7c38]">Số điện thoại:</strong> <span className="text-white font-medium ml-1.5">{registeredUser.phone.length > 4 ? registeredUser.phone.slice(0, -4) + '****' : registeredUser.phone}</span></div>
            <div><strong className="text-[#ba7c38]">CCCD:</strong> <span className="text-white font-medium ml-1.5">{registeredUser.nationalId.length > 4 ? registeredUser.nationalId.slice(0, -4) + '****' : registeredUser.nationalId}</span></div>
            <div><strong className="text-[#ba7c38]">Đại lý:</strong> <span className="text-white font-medium ml-1.5">{registeredUser.agency}</span></div>
            <div><strong className="text-[#ba7c38]">Đáp án đã chọn:</strong> <span className="font-bold text-[#ffdca3] ml-1.5">Đáp án {registeredUser.answer || 'Chưa ghi nhận'}</span></div>
          </div>

          <p className="text-[11px] text-[#888]">
            * Mỗi khách hàng chỉ được tham gia 1 lần duy nhất trong suốt sự kiện.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Logo />
      <h3 className="text-2xl font-black mb-6 text-center text-[#ba7c38] tracking-wider uppercase font-['Be_Vietnam_Pro']">THÔNG TIN ĐĂNG KÝ</h3>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={!isRegActive || isSubmitting}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#e8ded1] mb-1.5">Họ và Tên</label>
              <Input 
                id="name" 
                type="text" 
                value={name} 
                onChange={e => handleFieldChange('name', e.target.value, setName)}
                onBlur={e => handleFieldBlur('name', e.target.value)}
                placeholder="Nguyễn Văn A" 
                isError={!!errors.name} 
              />
              {errors.name && <p className="text-red-400 text-xs mt-1.5 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-[#e8ded1] mb-1.5">Số Điện Thoại</label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone} 
                onChange={e => handleFieldChange('phone', e.target.value, setPhone)}
                onBlur={e => handleFieldBlur('phone', e.target.value)}
                placeholder="09xxxxxxxx" 
                isError={!!errors.phone} 
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1.5 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>}
            </div>
            <div>
              <label htmlFor="nationalId" className="block text-sm font-semibold text-[#e8ded1] mb-1.5">Số Căn cước công dân (CCCD)</label>
              <Input 
                id="nationalId" 
                type="text" 
                value={nationalId} 
                onChange={e => handleFieldChange('nationalId', e.target.value, setNationalId)}
                onBlur={e => handleFieldBlur('nationalId', e.target.value)}
                placeholder="0012xxxxxxxx" 
                isError={!!errors.nationalId} 
              />
              {errors.nationalId && <p className="text-red-400 text-xs mt-1.5 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.nationalId}
              </p>}
            </div>
            <div>
              <label htmlFor="agency" className="block text-sm font-semibold text-[#e8ded1] mb-1.5">Đại lý Bất động sản</label>
              <Select 
                id="agency" 
                value={agency} 
                onChange={e => {
                  handleFieldChange('agency', e.target.value, setAgency);
                  handleFieldBlur('agency', e.target.value);
                }}
                isError={!!errors.agency}
              >
                <option value="">-- Chọn đại lý --</option>
                {agencies.map(agent => <option key={agent} value={agent}>{agent}</option>)}
              </Select>
              {errors.agency && <p className="text-red-400 text-xs mt-1.5 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.agency}
              </p>}
            </div>
            
            {/* Câu hỏi trắc nghiệm */}
            <div className="pt-3 border-t border-[#ba7c38]/25">
              <label className="block text-sm font-bold text-[#ffdca3] mb-2.5">
                <span className="inline-block bg-[#ba7c38] text-white text-xs font-bold px-2.5 py-0.5 rounded-full mr-2 uppercase tracking-wide">
                  CÂU HỎI
                </span>
                {QUIZ_QUESTION.question}
              </label>
              <div className="space-y-2 mt-2">
                {QUIZ_QUESTION.options.map((opt) => {
                  const isSelected = answer === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => {
                        setAnswer(opt.key);
                        if (errors.answer) {
                          setErrors(prev => ({ ...prev, answer: '' }));
                        }
                      }}
                      className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-[#ba7c38] bg-[#ba7c38]/20 shadow-md shadow-black/40'
                          : 'border-[#ba7c38]/25 hover:border-[#ba7c38]/50 bg-[#18120d]/70'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`answer-${opt.key}`}
                        name="quiz_answer"
                        value={opt.key}
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#ba7c38] border-[#ba7c38]/40 focus:ring-[#ba7c38] bg-[#1c140e] cursor-pointer"
                      />
                      <label
                        htmlFor={`answer-${opt.key}`}
                        className={`ml-3 text-sm font-medium cursor-pointer ${
                          isSelected ? 'text-[#ffdca3] font-bold' : 'text-[#d4c5b2]'
                        }`}
                      >
                        {opt.text}
                      </label>
                    </div>
                  );
                })}
              </div>
              {errors.answer && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.answer}
                </p>
              )}
            </div>

            {/* Cloudflare Turnstile Captcha */}
            <div className="mt-5">
              <label className="block text-sm font-semibold text-[#e8ded1] mb-2.5">Xác thực bảo mật</label>
              <TurnstileComponent
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={handleCaptchaVerify}
                onError={handleCaptchaError}
                onExpire={handleCaptchaExpire}
                className="mb-2"
              />
              {errors.captcha && <p className="text-red-400 text-xs mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.captcha}
              </p>}
            </div>
          </div>
          <div className="mt-7">
              <Button type="submit" isLoading={isSubmitting} disabled={!isRegActive || isSubmitting || !captchaToken}>
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
              </Button>
          </div>
        </fieldset>
        {!isRegActive && (
          <div className="mt-4 text-center p-3 rounded-xl bg-amber-950/80 border border-[#ba7c38]/40 text-[#ffdca3]">
            <p>{regMessage}</p>
          </div>
        )}
        {submissionResult.message && (
          <div className={`mt-4 text-center p-4 rounded-xl ${
            submissionResult.isError 
              ? 'bg-red-950/80 border border-red-500/50 text-red-300' 
              : 'bg-gradient-to-b from-[#2a1c11] to-[#160f0a] border border-[#ba7c38] text-white shadow-xl'
          }`}>
            {submissionResult.isError ? (
              <p>{submissionResult.message}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center text-[#ffdca3]">
                  <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-bold">ĐĂNG KÝ THÀNH CÔNG!</span>
                </div>
                <div className="bg-[#140f0b]/80 rounded-xl p-4 border border-[#ba7c38]/30">
                  <p className="text-xs uppercase font-bold text-[#ba7c38] mb-1">Mã số dự thưởng của bạn là:</p>
                  <div className="text-4xl font-black text-[#ffdca3] drop-shadow-lg tracking-wider">
                    #{submissionResult.id.toString().padStart(4, "0")}
                  </div>
                  <p className="text-xs mt-2 text-[#a89f91] italic">Vui lòng lưu lại mã số này!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Card>
  );
};