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

interface RegistrationFormProps {
  onNewSubmission: () => void;
  agencies: string[];
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNewSubmission, agencies }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [agency, setAgency] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ id: number | null, message: string, isError: boolean }>({ id: null, message: '', isError: false });
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [isRegActive, setIsRegActive] = useState(true);
  const [regMessage, setRegMessage] = useState('');

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
      const newId = await addSubmission({ name, phone, nationalId, agency });
      setSubmissionResult({ id: newId, message: 'success', isError: false });
      setName('');
      setPhone('');
      setNationalId('');
      setAgency('');
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

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-6 text-center text-slate-800">Thông Tin Đăng Ký</h3>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={!isRegActive || isSubmitting}>
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Họ và Tên</label>
              <Input 
                id="name" 
                type="text" 
                value={name} 
                onChange={e => handleFieldChange('name', e.target.value, setName)}
                onBlur={e => handleFieldBlur('name', e.target.value)}
                placeholder="Nguyễn Văn A" 
                isError={!!errors.name} 
              />
              {errors.name && <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">Số Điện Thoại</label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone} 
                onChange={e => handleFieldChange('phone', e.target.value, setPhone)}
                onBlur={e => handleFieldBlur('phone', e.target.value)}
                placeholder="09xxxxxxxx" 
                isError={!!errors.phone} 
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>}
            </div>
            <div>
              <label htmlFor="nationalId" className="block text-sm font-medium text-slate-600 mb-1">Số Căn cước công dân (CCCD)</label>
              <Input 
                id="nationalId" 
                type="text" 
                value={nationalId} 
                onChange={e => handleFieldChange('nationalId', e.target.value, setNationalId)}
                onBlur={e => handleFieldBlur('nationalId', e.target.value)}
                placeholder="0012xxxxxxxx" 
                isError={!!errors.nationalId} 
              />
              {errors.nationalId && <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.nationalId}
              </p>}
            </div>
            <div>
              <label htmlFor="agency" className="block text-sm font-medium text-slate-600 mb-1">Đại lý Bất động sản</label>
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
              {errors.agency && <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.agency}
              </p>}
            </div>
            
            {/* Cloudflare Turnstile Captcha */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-600 mb-3">Xác thực bảo mật</label>
              <TurnstileComponent
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={handleCaptchaVerify}
                onError={handleCaptchaError}
                onExpire={handleCaptchaExpire}
                className="mb-2"
              />
              {errors.captcha && <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.captcha}
              </p>}
            </div>
          </div>
          <div className="mt-8">
              <Button type="submit" isLoading={isSubmitting} disabled={!isRegActive || isSubmitting || !captchaToken}>
                {isSubmitting ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
              </Button>
          </div>
        </fieldset>
        {!isRegActive && (
          <div className="mt-4 text-center p-3 rounded-lg bg-yellow-100 text-yellow-800">
            <p>{regMessage}</p>
          </div>
        )}
        {submissionResult.message && (
          <div className={`mt-4 text-center p-4 rounded-lg ${submissionResult.isError ? 'bg-red-100 text-red-700' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'}`}>
            {submissionResult.isError ? (
              <p>{submissionResult.message}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-semibold">Đăng ký thành công!</span>
                </div>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm mb-2">Mã số dự thưởng của bạn là:</p>
                  <div className="text-4xl font-bold text-yellow-300 drop-shadow-lg">
                    #{submissionResult.id.toString().padStart(4, "0")}
                  </div>
                  <p className="text-xs mt-2 opacity-90">Vui lòng lưu lại mã số này!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Card>
  );
};