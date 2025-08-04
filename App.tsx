import React, { useState, useEffect, useCallback } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { getSubmissions, getAgencies, saveAgencies } from './services/mockApi';
import type { Submission } from './types';
import { SubmissionList } from './components/SubmissionList';
import { TimeSettings } from './components/TimeSettings';
import { PasswordForm } from './components/PasswordForm';
import { AgencyManager } from './components/AgencyManager';
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
  
  const renderRegisterView = () => (
    <>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl mb-2 uppercase">CHƯƠNG TRÌNH QUAY SỐ MAY MẮN</h2>
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
      <div className="grid grid-cols-1 gap-8">
        <TimeSettings />
        <SubmissionList submissions={submissions} onSubmissionsUpdate={loadSubmissions} />
        <AgencyManager agencies={agencies} onAgenciesUpdate={handleAgenciesUpdate} />
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen text-slate-800 transition-colors duration-500 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(./bg.jpeg)' }}
    >
      <div className="min-h-screen bg-black/20 backdrop-blur-[1px]">
        <main className="container mx-auto p-4 md:p-8">
          {view === 'register' ? renderRegisterView() : renderAdminView()}
        </main>
        <footer className="text-center mt-12 py-6 text-sm text-white/80">
            <p 
              className="cursor-pointer hover:text-white transition-colors duration-200 select-none"
              onClick={handleCopyrightClick}
            >
              Bản quyền bởi Lam Phương Media
            </p>
        </footer>
      </div>
    </div>
  );
}