import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { SplashLoadingScreen } from './components/auth/SplashLoadingScreen';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

import { ElderlyDashboardPage } from './pages/ElderlyDashboardPage';
import { GamesPage } from './pages/GamesPage';
import { ProgressPage } from './pages/ProgressPage';
import { RemindersPage } from './pages/RemindersPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

import { CaregiverDashboardPage } from './pages/CaregiverDashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientPerformancePage } from './pages/PatientPerformancePage';
import { AlertsPage } from './pages/AlertsPage';

// Games & Result Modal
import { MemoryMatchGame } from './components/games/MemoryMatchGame';
import { PatternRecognitionGame } from './components/games/PatternRecognitionGame';
import { RoutineRecallGame } from './components/games/RoutineRecallGame';
import { ObjectRecognitionGame } from './components/games/ObjectRecognitionGame';
import { GameResultModal } from './components/GameResultModal';

import { voiceService } from './services/voiceService';
import { submitGameSession, fetchAiDifficultyRecommendation } from './services/api';
import { Language, getTranslation } from './utils/i18n';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { user, token, loading, login, register, logout } = useAuth();

  const [currentPath, setCurrentPath] = useState<string>('/login');
  const [lang, setLang] = useState<Language>('en');
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Active game gameplay state
  const [activeGameType, setActiveGameType] = useState<'memory' | 'pattern' | 'routine' | 'object_rec'>('memory');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<string | null>('good');
  const [gameResult, setGameResult] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [aiBannerMessage, setAiBannerMessage] = useState<string | null>(null);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Sync route with user authentication status & role protection
  useEffect(() => {
    if (loading) return;

    if (!token || !user) {
      if (!['/login', '/register', '/forgot'].includes(currentPath)) {
        setCurrentPath('/login');
      }
      return;
    }

    // Role-based protection: Redirect unauthenticated paths or restricted routes
    const isCaregiverOrAdmin = user.role === 'caregiver' || user.role === 'admin';

    if (['/login', '/register', '/forgot'].includes(currentPath)) {
      setCurrentPath(isCaregiverOrAdmin ? '/caregiver' : '/dashboard');
      return;
    }

    // Protect Caregiver-only paths from elderly users
    if (!isCaregiverOrAdmin && ['/caregiver', '/patients', '/alerts', '/caregiver/performance'].includes(currentPath)) {
      setCurrentPath('/dashboard');
    }
  }, [user, token, loading, currentPath]);

  const handleNavigate = (path: string) => {
    if (!token && !['/login', '/register', '/forgot'].includes(path)) {
      setCurrentPath('/login');
      return;
    }
    const isCaregiverOrAdmin = user?.role === 'caregiver' || user?.role === 'admin';
    if (!isCaregiverOrAdmin && ['/caregiver', '/patients', '/alerts', '/caregiver/performance'].includes(path)) {
      setCurrentPath('/dashboard');
      return;
    }
    setCurrentPath(path);
  };

  const handleStartGame = async (gameType: 'memory' | 'pattern' | 'routine' | 'object_rec') => {
    setActiveGameType(gameType);
    setCurrentPath('/gameplay');

    // Call AI Adaptive Difficulty Recommendation Engine (Node.js -> FastAPI -> XGBoost)
    try {
      const fullGameType = gameType === 'memory' ? 'memory_match' : (gameType === 'pattern' ? 'pattern_recognition' : (gameType === 'routine' ? 'daily_routine_recall' : 'object_recognition'));
      const aiRes = await fetchAiDifficultyRecommendation(fullGameType);

      if (aiRes && aiRes.numericDifficulty) {
        setDifficulty(aiRes.numericDifficulty);
      } else if (aiRes && aiRes.recommendedDifficulty) {
        const num = aiRes.recommendedDifficulty === 'easy' ? 1 : (aiRes.recommendedDifficulty === 'medium' ? 2 : 3);
        setDifficulty(num);
      }

      setAiBannerMessage('Your next activity has been adjusted based on your recent game performance.');
    } catch (e) {
      console.warn('[AI ADAPTIVE START ERROR]', e);
    }
  };

  const handleGameFinish = async (resultData: any) => {
    setGameResult(resultData);
    try {
      const apiRes = await submitGameSession({
        ...resultData,
        mood: selectedMood || 'good',
      });

      if (apiRes && apiRes.aiRecommendation) {
        setAiRecommendation(apiRes.aiRecommendation);
        setDifficulty(apiRes.aiRecommendation.recommended_difficulty);
      }
    } catch (e) {
      console.warn('[GAME FINISH SUBMIT ERROR]', e);
    }
  };

  const handleModalNext = () => {
    setGameResult(null);
    setAiRecommendation(null);
    const isCaregiverOrAdmin = user?.role === 'caregiver' || user?.role === 'admin';
    setCurrentPath(isCaregiverOrAdmin ? '/caregiver' : '/dashboard');
  };

  const handleTriggerVoice = () => {
    if (!voiceEnabled) return;
    voiceService.speak(t('voicePrompt'), lang);
  };

  if (loading) {
    return <SplashLoadingScreen />;
  }

  // Public Route 1: Login
  if (!user && currentPath === '/login') {
    return (
      <LoginPage
        onSuccess={(u) => {
          const isCaregiverOrAdmin = u.role === 'caregiver' || u.role === 'admin';
          setCurrentPath(isCaregiverOrAdmin ? '/caregiver' : '/dashboard');
        }}
        onNavigateRegister={() => setCurrentPath('/register')}
        onNavigateForgot={() => setCurrentPath('/forgot')}
        lang={lang}
      />
    );
  }

  // Public Route 2: Register
  if (!user && currentPath === '/register') {
    return (
      <RegisterPage
        onSuccess={(u) => {
          const isCaregiverOrAdmin = u.role === 'caregiver' || u.role === 'admin';
          setCurrentPath(isCaregiverOrAdmin ? '/caregiver' : '/dashboard');
        }}
        onNavigateLogin={() => setCurrentPath('/login')}
        lang={lang}
      />
    );
  }

  // Public Route 3: Forgot Password
  if (!user && currentPath === '/forgot') {
    return <ForgotPasswordPage onNavigateLogin={() => setCurrentPath('/login')} />;
  }

  // Fallback for unauthenticated state
  if (!user) {
    return (
      <LoginPage
        onSuccess={(u) => {
          const isCaregiverOrAdmin = u.role === 'caregiver' || u.role === 'admin';
          setCurrentPath(isCaregiverOrAdmin ? '/caregiver' : '/dashboard');
        }}
        onNavigateRegister={() => setCurrentPath('/register')}
        onNavigateForgot={() => setCurrentPath('/forgot')}
        lang={lang}
      />
    );
  }

  // Authenticated App Shell with Layout
  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      lang={lang}
      onLangChange={(newLang) => setLang(newLang)}
      voiceEnabled={voiceEnabled}
      onTriggerVoice={handleTriggerVoice}
      textSize={textSize}
    >
      {/* Route: /dashboard */}
      {currentPath === '/dashboard' && (
        <ElderlyDashboardPage
          user={user}
          lang={lang}
          difficulty={difficulty}
          selectedMood={selectedMood}
          onSelectMood={setSelectedMood}
          onNavigate={handleNavigate}
          onTriggerVoice={handleTriggerVoice}
        />
      )}

      {/* Route: /games */}
      {currentPath === '/games' && (
        <GamesPage
          lang={lang}
          difficulty={difficulty}
          onNavigate={handleNavigate}
          onStartGame={handleStartGame}
        />
      )}

      {/* Route: /gameplay */}
      {currentPath === '/gameplay' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {aiBannerMessage && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                borderRadius: '16px',
                padding: '12px 18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              <Sparkles size={20} color="#EC4899" />
              <span>{aiBannerMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              onClick={() => handleNavigate('/games')}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '40px', padding: '0 14px', fontSize: '14px' }}
            >
              <ArrowLeft size={18} /> Exit Game
            </button>
            <span className="badge-pill badge-emerald">Difficulty Level {difficulty}</span>
          </div>

          {activeGameType === 'memory' && <MemoryMatchGame difficulty={difficulty} onFinish={handleGameFinish} lang={lang} />}
          {activeGameType === 'pattern' && <PatternRecognitionGame difficulty={difficulty} onFinish={handleGameFinish} lang={lang} />}
          {activeGameType === 'routine' && <RoutineRecallGame difficulty={difficulty} onFinish={handleGameFinish} lang={lang} />}
          {activeGameType === 'object_rec' && <ObjectRecognitionGame difficulty={difficulty} onFinish={handleGameFinish} lang={lang} />}
        </div>
      )}

      {/* Route: /progress */}
      {currentPath === '/progress' && (
        <ProgressPage lang={lang} onNavigate={handleNavigate} />
      )}

      {/* Route: /reminders */}
      {currentPath === '/reminders' && (
        <RemindersPage lang={lang} onNavigate={handleNavigate} />
      )}

      {/* Route: /profile */}
      {currentPath === '/profile' && (
        <ProfilePage user={user} lang={lang} onNavigate={handleNavigate} onLanguageChange={setLang} />
      )}

      {/* Route: /settings */}
      {currentPath === '/settings' && (
        <SettingsPage
          user={user}
          lang={lang}
          onLanguageChange={setLang}
          textSize={textSize}
          onTextSizeChange={setTextSize}
          voiceEnabled={voiceEnabled}
          onVoiceToggle={setVoiceEnabled}
          onNavigate={handleNavigate}
          onLogout={logout}
        />
      )}

      {/* Route: /caregiver */}
      {currentPath === '/caregiver' && (
        <CaregiverDashboardPage user={user} onNavigate={handleNavigate} lang={lang} />
      )}

      {/* Route: /patients */}
      {currentPath === '/patients' && (
        <PatientsPage lang={lang} onNavigate={handleNavigate} />
      )}

      {/* Route: /caregiver/performance */}
      {currentPath === '/caregiver/performance' && (
        <PatientPerformancePage lang={lang} onNavigate={handleNavigate} />
      )}

      {/* Route: /alerts */}
      {currentPath === '/alerts' && (
        <AlertsPage lang={lang} onNavigate={handleNavigate} />
      )}

      {/* Result & Explainable AI Modal */}
      {gameResult && (
        <GameResultModal
          result={gameResult}
          aiRecommendation={aiRecommendation}
          onNext={handleModalNext}
          lang={lang}
        />
      )}
    </AppLayout>
  );
};
