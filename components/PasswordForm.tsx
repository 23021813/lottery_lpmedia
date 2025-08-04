import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { validatePassword } from '../services/authService';

interface PasswordFormProps {
  onAuthenticated: () => void;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (validatePassword(password)) {
        onAuthenticated();
      } else {
        setError('Mật khẩu không đúng. Vui lòng thử lại.');
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <Card>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Xác Thực Quản Trị</h2>
            <p className="text-slate-600">Vui lòng nhập mật khẩu để truy cập bảng điều khiển</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-2">
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị"
                  isError={!!error}
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!password.trim() || isSubmitting}
              >
                {isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Chỉ dành cho quản trị viên có thẩm quyền
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};