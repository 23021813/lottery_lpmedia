import React, { useState, useEffect, useCallback } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { getSubmissions, getAgencies, saveAgencies } from './services/mockApi';
import type { Submission } from './types';
import { SubmissionList } from './components/SubmissionList';
import { TimeSettings } from './components/TimeSettings';
import { PasswordForm } from './components/PasswordForm';
import { AgencyManager } from './components/AgencyManager';
import { BackgroundManager } from './components/BackgroundManager';
import { LogoManager } from './components/LogoManager';
import { QRCodeManager } from './components/QRCodeManager';
import { REAL_ESTATE_AGENCIES } from './constants';

type View = 'register' | 'admin';

export default function App() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [welcomeMessage] = useState<string>('Chào mừng các bạn đến với sự kiện đặc biệt của chúng tôi! Hãy đăng ký ngay để có cơ hội nhận những phần quà hấp dẫn.');
  const [view, setView] = useState<View>('register');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [agencies, setAgencies] = useState<string[]>([]);

  const loadSubmissions = useCallback(async () => {
    try {
      const storedSubmissions = await getSubmissions();
      setSubmissions(storedSubmissions);
    } catch (error) {
      console.error("Failed to load submissions:", error);
    }
  }, []);

  const loadAgencies = useCallback(async () => {
    try {
      const storedAgencies = await getAgencies();
      if (storedAgencies.length > 0) {
        setAgencies(storedAgencies);
      } else {
        // Initialize with default agencies
        setAgencies(REAL_ESTATE_AGENCIES);
        await saveAgencies(REAL_ESTATE_AGENCIES);
      }
    } catch (error) {
      console.error("Failed to load agencies:", error);
      setAgencies(REAL_ESTATE_AGENCIES);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
    loadAgencies();

    // Set up polling to check for data changes every 10 seconds (increased interval)
    const pollInterval = setInterval(() => {
      loadSubmissions();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [loadSubmissions, loadAgencies]);

  const handleNewSubmission = () => {
    loadSubmissions();
  };

  const handleAgenciesUpdate = async (updatedAgencies: string[]) => {
    try {
      await saveAgencies(updatedAgencies);
      setAgencies(updatedAgencies);
      // No page reload, just update local state
      console.log('Agencies updated successfully');
    } catch (error) {
      console.error("Failed to save agencies:", error);
    }
  };

  const handleCopyrightClick = () => {
    if (view === 'register') {
      setView('admin');
    } else {
      setView('register');
      setIsAuthenticated(false); // Reset authentication when going back
    }
  };
  
  const [adminTab, setAdminTab] = useState<'submissions' | 'timing-qr' | 'agencies-branding'>('submissions');

  const renderRegisterView = () => (
    <>
      <div className="text-center mb-10">
      </div>
      <div className="max-w-md mx-auto">
        <RegistrationForm onNewSubmission={handleNewSubmission} agencies={agencies} />
      </div>
    </>
  );

  const renderAdminView = () => {
    if (!isAuthenticated) {
      return <PasswordForm onAuthenticated={() => setIsAuthenticated(true)} />;
    }
    
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header & Tab Navigation Bar */}
        <div className="bg-[#140f0b]/92 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#ba7c38]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Tab 1: Dữ liệu & Quay số */}
            <button
              onClick={() => setAdminTab('submissions')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                adminTab === 'submissions'
                  ? 'bg-[#ba7c38] text-white shadow-lg border border-[#ba7c38] scale-[1.02]'
                  : 'bg-[#1c140e] text-[#c4b5a2] border border-[#ba7c38]/25 hover:border-[#ba7c38]/60 hover:text-[#ffdca3]'
              }`}
            >
              <span>📋</span>
              <span>Dữ Liệu & Quay Thưởng</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                adminTab === 'submissions' ? 'bg-black/30 text-[#ffdca3]' : 'bg-[#281b12] text-[#c4b5a2]'
              }`}>
                {submissions.length}
              </span>
            </button>

            {/* Tab 2: Thời gian & QR Standee */}
            <button
              onClick={() => setAdminTab('timing-qr')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                adminTab === 'timing-qr'
                  ? 'bg-[#ba7c38] text-white shadow-lg border border-[#ba7c38] scale-[1.02]'
                  : 'bg-[#1c140e] text-[#c4b5a2] border border-[#ba7c38]/25 hover:border-[#ba7c38]/60 hover:text-[#ffdca3]'
              }`}
            >
              <span>⏱️</span>
              <span>Thời Gian & QR Standee</span>
            </button>

            {/* Tab 3: Đại lý & Thương hiệu */}
            <button
              onClick={() => setAdminTab('agencies-branding')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                adminTab === 'agencies-branding'
                  ? 'bg-[#ba7c38] text-white shadow-lg border border-[#ba7c38] scale-[1.02]'
                  : 'bg-[#1c140e] text-[#c4b5a2] border border-[#ba7c38]/25 hover:border-[#ba7c38]/60 hover:text-[#ffdca3]'
              }`}
            >
              <span>🏢</span>
              <span>Đại Lý & Thương Hiệu</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                adminTab === 'agencies-branding' ? 'bg-black/30 text-[#ffdca3]' : 'bg-[#281b12] text-[#c4b5a2]'
              }`}>
                {agencies.length}
              </span>
            </button>
          </div>

          {/* Action Nút Thoát Admin */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setView('register');
                setIsAuthenticated(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1c140e] hover:bg-[#281b12] text-[#c4b5a2] hover:text-[#ffdca3] border border-[#ba7c38]/30 hover:border-[#ba7c38]/60 transition-colors cursor-pointer"
            >
              <span>🚪</span>
              <span>Về Form Đăng Ký</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dữ Liệu & Quay Thưởng */}
        {adminTab === 'submissions' && (
          <SubmissionList 
            submissions={submissions} 
            agencies={agencies}
            onSubmissionsUpdate={loadSubmissions} 
          />
        )}

        {/* Tab 2: Thời Gian & QR Standee */}
        {adminTab === 'timing-qr' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <QRCodeManager />
            <TimeSettings />
          </div>
        )}

        {/* Tab 3: Đại Lý & Thương Hiệu */}
        {adminTab === 'agencies-branding' && (
          <div className="space-y-6">
            <AgencyManager agencies={agencies} onAgenciesUpdate={handleAgenciesUpdate} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <LogoManager />
              <BackgroundManager />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen text-[#e8ded1] transition-colors duration-500 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url(/background.jpg)' }}
    >
      <div className="min-h-screen bg-black/65 backdrop-blur-[2px] flex flex-col justify-between">
        <main className="container mx-auto p-4 md:p-8 flex-grow flex items-center justify-center">
          {view === 'register' ? renderRegisterView() : renderAdminView()}
        </main>
        <footer className="text-center py-6 text-sm text-[#ba7c38]/90">
            <p 
              className="cursor-pointer hover:text-[#ffdca3] transition-colors duration-200 select-none font-medium"
              onClick={handleCopyrightClick}
            >
              Bản quyền bởi Lam Phương Media
            </p>
        </footer>
      </div>
    </div>
  );
}