import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { RulesPage } from './pages/RulesPage';
import { BriefingPage } from './pages/BriefingPage';
import { LevelSelectionPage } from './pages/LevelSelectionPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { FinalSubmissionPage } from './pages/FinalSubmissionPage';
import { SubmissionConfirmationPage } from './pages/SubmissionConfirmationPage';
import { PublicSubmissionsPage } from './pages/PublicSubmissionsPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#050813] text-slate-100 cyber-grid-bg selection:bg-cyan-500 selection:text-slate-950">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/case/:id" element={<CaseDetailsPage />} />
              <Route path="/case/:id/rules" element={<RulesPage />} />
              <Route path="/rules-guide" element={<RulesPage />} />
              <Route path="/case/:id/briefing" element={<BriefingPage />} />
              <Route path="/case/:id/levels" element={<LevelSelectionPage />} />
              <Route path="/case/:id/investigate/:level" element={<InvestigationPage />} />
              <Route path="/case/:id/submit" element={<FinalSubmissionPage />} />
              <Route path="/submission-confirmed/:ref" element={<SubmissionConfirmationPage />} />
              <Route path="/submissions" element={<PublicSubmissionsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
