import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
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

import { submitGameSession, fetchAiDifficultyRecommendation } from './services/api';
import { ArrowLeft, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, token, loading, logout } = useAuth();
  const { lang, speak, voiceEnabled, t } = useAccessibility();

  const [currentPath, setCurrentPath] = useState<string>('/login');

  // Active game gameplay state
  const [activeGameType, setActiveGameType] = useState<'memory' | 'pattern' | 'routine' | 'object_rec'>('memory');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<string | null>('good');
  const [gameResult, setGameResult] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [aiBannerMessage, setAiBannerMessage] = useState<string | null>(null);

  // Sync route with user authentication status & role protection
  useEffect(() => {
    if (loading) return;

    if (!token || !user) {
      if (!['/login', '/register', '/forgot'].includes(currentPath)) {
        setCurrentPath('/login');
      }
      return;
    }

    const isCaregiverOrAdmin = user.role === 'caregiver' || user.role === 'admin';

    if (['/login', '/register', '/forgot'].includes(currentPath)) {
      setCurrentPath(isCaregiverOrAdmin ? '/caregiver' : '/dashboard');
      return;
    }

    if (isCaregiverOrAdmin) {
      if (['/games', '/gameplay', '/dashboard'].includes(currentPath)) {
        setCurrentPath('/caregiver');
      }
    } else {
      if (['/caregiver', '/patients', '/alerts', '/caregiver/performance'].includes(currentPath)) {
        setCurrentPath('/dashboard');
      }
    }
  }, [user, token, loading, currentPath]);

  const handleNavigate = (path: string) => {
    if (!token && !['/login', '/register', '/forgot'].includes(path)) {
      setCurrentPath('/login');
      return;
    }
    const isCaregiverOrAdmin = user?.role === 'caregiver' || user?.role === 'admin';
    if (isCaregiverOrAdmin && ['/games', '/gameplay', '/dashboard'].includes(path)) {
      setCurrentPath('/caregiver');
      return;
    }
    if (!isCaregiverOrAdmin && ['/caregiver', '/patients', '/alerts', '/caregiver/performance'].includes(path)) {
      setCurrentPath('/dashboard');
      return;
    }
    setCurrentPath(path);
  };

  const handleStartGame = async (gameType: 'memory' | 'pattern' | 'routine' | 'object_rec') => {
    if (user?.role === 'caregiver') {
      setCurrentPath('/caregiver');
      return;
    }

    setActiveGameType(gameType);
    setCurrentPath('/gameplay');

    try {
      const fullGameType = gameType === 'memory' ? 'memory_match' : (gameType === 'pattern' ? 'pattern_recognition' : (gameType === 'routine' ? 'daily_routine_recall' : 'object_recognition'));
      const aiRes = await fetchAiDifficultyRecommendation(fullGameType);

      let selectedLevel = 1;
      if (aiRes && aiRes.numericDifficulty) {
        selectedLevel = aiRes.numericDifficulty;
      } else if (aiRes && aiRes.recommendedDifficulty) {
        selectedLevel = aiRes.recommendedDifficulty === 'easy' ? 1 : (aiRes.recommendedDifficulty === 'medium' ? 2 : 3);
      }
      setDifficulty(selectedLevel);

      if (aiRes && aiRes.difficultySource === 'xgboost') {
        setAiBannerMessage(`XGBoost ML Model Recommended: Level ${selectedLevel} based on performance history.`);
      } else {
        setAiBannerMessage(`AI Fallback Adjustment (Local): Level ${selectedLevel} set based on recent accuracy.`);
      }
    } catch (e) {
      console.warn('[AI ADAPTIVE START ERROR]', e);
      setAiBannerMessage('AI Fallback Adjustment (Local): Continuing at Level 1.');
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
      }
    } catch (e) {
      console.warn('[GAME FINISH SUBMIT ERROR]', e);
    }
  };

  const handleModalContinue = (nextLevel: number) => {
    const validLevel = Math.max(1, Math.min(100, nextLevel));
    setDifficulty(validLevel);
    setGameResult(null);
    setAiRecommendation(null);
    setAiBannerMessage(`AI Next Recommended Level: Level ${validLevel}`);
    setCurrentPath('/gameplay');
  };

  const handleModalExit = () => {
    setGameResult(null);
    setAiRecommendation(null);
    setCurrentPath('/games');
  };

  const handleTriggerVoice = () => {
    if (!voiceEnabled) return;
    speak(t('voicePrompt'), true);
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
    >
      {/* Route: /dashboard */}
      {currentPath === '/dashboard' && (
        <ElderlyDashboardPage
          user={user}
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
              <ArrowLeft size={18} /> {t('exitGame')}
            </button>
            <span className="badge-pill badge-emerald">Difficulty Level {difficulty}</span>
          </div>

          {activeGameType === 'memory' && <MemoryMatchGame difficulty={difficulty} onFinish={handleGameFinish} onNavigateBack={() => handleNavigate('/games')} />}
          {activeGameType === 'pattern' && <PatternRecognitionGame difficulty={difficulty} onFinish={handleGameFinish} onNavigateBack={() => handleNavigate('/games')} />}
          {activeGameType === 'routine' && <RoutineRecallGame difficulty={difficulty} onFinish={handleGameFinish} onNavigateBack={() => handleNavigate('/games')} />}
          {activeGameType === 'object_rec' && <ObjectRecognitionGame difficulty={difficulty} onFinish={handleGameFinish} onNavigateBack={() => handleNavigate('/games')} />}
        </div>
      )}

      {/* Route: /progress */}
      {currentPath === '/progress' && (
        <ProgressPage lang={lang} onNavigate={handleNavigate} />
      )}

      {/* Route: /reminders */}
      {currentPath === '/reminders' && (
        <RemindersPage onNavigate={handleNavigate} />
      )}

      {/* Route: /profile */}
      {currentPath === '/profile' && (
        <ProfilePage user={user} onNavigate={handleNavigate} />
      )}

      {/* Route: /settings */}
      {currentPath === '/settings' && (
        <SettingsPage
          user={user}
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
          onContinue={handleModalContinue}
          onExit={handleModalExit}
          lang={lang}
        />
      )}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
};
