import React, { useState, useEffect } from 'react';
import {
  Brain, Wifi, WifiOff, UserCheck, Mic, LogOut, ArrowLeft,
  Sparkles, Play, Target, Calendar, Search, User, Settings as SettingsIcon, Bell
} from 'lucide-react';

import { translations, getTranslation, Language } from './i18n/translations';
import { voiceService } from './services/voiceService';
import { offlineService } from './services/offlineService';
import { submitGameSession, apiClient } from './services/api';
import { authService, UserProfile } from './services/authService';

import { SplashLoadingScreen } from './components/auth/SplashLoadingScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';

import { ElderlyHomeScreen } from './components/ElderlyHomeScreen';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { ProfileScreen } from './components/ProfileScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { RemindersScreen } from './components/RemindersScreen';
import { ComingSoonScreen } from './components/ComingSoonScreen';

import { MemoryMatchGame } from './components/games/MemoryMatchGame';
import { PatternRecognitionGame } from './components/games/PatternRecognitionGame';
import { RoutineRecallGame } from './components/games/RoutineRecallGame';
import { ObjectRecognitionGame } from './components/games/ObjectRecognitionGame';
import { GameResultModal } from './components/GameResultModal';

type AppScreen =
  | 'splash'
  | 'login'
  | 'register'
  | 'forgot'
  | 'elderly_home'
  | 'caregiver_home'
  | 'profile'
  | 'settings'
  | 'games'
  | 'reminders'
  | 'my_progress'
  | 'game';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // App Navigation & Screen State
  const [activeScreen, setActiveScreen] = useState<AppScreen>('splash');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [activeGameType, setActiveGameType] = useState<'memory' | 'pattern' | 'routine' | 'object_rec'>('memory');
  const [difficulty, setDifficulty] = useState<number>(2);

  const [isOffline, setIsOffline] = useState<boolean>(offlineService.isOffline());
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const [gameResult, setGameResult] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);

  const [selectedMood, setSelectedMood] = useState<string | null>('good');

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Check Persistent Auth Session on App Startup
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('mindmate_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (isMounted && res && res.user) {
            const userProfile: UserProfile = res.user;
            setCurrentUser(userProfile);
            if (userProfile.preferredLanguage && ['en', 'hi', 'as'].includes(userProfile.preferredLanguage)) {
              setLang(userProfile.preferredLanguage as Language);
            }
            setActiveScreen(userProfile.role === 'caregiver' ? 'caregiver_home' : 'elderly_home');
            return;
          }
        } catch (e) {
          console.warn('[AUTH RESTORE SESSION NOTICE]', e);
        }
      }

      // Direct unauthenticated users to login
      if (isMounted) {
        setActiveScreen('login');
      }
    };

    restoreSession();
    return () => { isMounted = false; };
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.preferredLanguage && ['en', 'hi', 'as'].includes(user.preferredLanguage)) {
      setLang(user.preferredLanguage as Language);
    }
    // Route user according to role after Firebase Auth
    if (user.role === 'caregiver') {
      setActiveScreen('caregiver_home');
    } else {
      setActiveScreen('elderly_home');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setActiveScreen('login');
  };

  const handleToggleOfflineMode = () => {
    const nextState = !isOffline;
    offlineService.setSimulatedOffline(nextState);
    setIsOffline(nextState);
    setSyncStatusMsg(nextState ? t('offlineBanner') : t('onlineBanner'));
    setTimeout(() => setSyncStatusMsg(null), 3500);
  };

  const handleSyncQueue = async () => {
    setSyncStatusMsg(t('syncSuccess'));
    const res = await offlineService.syncWithBackend(apiClient);
    setSyncStatusMsg(res.message || t('syncSuccess'));
    setTimeout(() => setSyncStatusMsg(null), 4500);
  };

  const handleStartGame = (gameType: 'memory' | 'pattern' | 'routine' | 'object_rec') => {
    setActiveGameType(gameType);
    setActiveScreen('game');
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
    setActiveScreen(currentUser?.role === 'caregiver' ? 'caregiver_home' : 'elderly_home');
  };

  const handleTriggerVoice = () => {
    if (!voiceEnabled) return;
    voiceService.speak(t('voicePrompt'), lang);
  };

  // Render auth screens before main layout shell
  if (activeScreen === 'splash') {
    return <SplashLoadingScreen />;
  }

  if (activeScreen === 'login') {
    return (
      <LoginScreen
        onSuccess={handleAuthSuccess}
        onNavigateRegister={() => setActiveScreen('register')}
        onNavigateForgot={() => setActiveScreen('forgot')}
        lang={lang}
      />
    );
  }

  if (activeScreen === 'register') {
    return (
      <RegisterScreen
        onSuccess={handleAuthSuccess}
        onNavigateLogin={() => setActiveScreen('login')}
        lang={lang}
      />
    );
  }

  if (activeScreen === 'forgot') {
    return <ForgotPasswordScreen onNavigateLogin={() => setActiveScreen('login')} />;
  }

  return (
    <div className={`font-scale-${textSize}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <header className="app-header" role="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              cursor: 'pointer',
            }}
            onClick={() => setActiveScreen(currentUser?.role === 'caregiver' ? 'caregiver_home' : 'elderly_home')}
            title="Go to Home"
          >
            <Brain size={26} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>{t('tagline')}</p>
          </div>
        </div>

        {/* Connectivity Pill, Quick Language Switcher & Profile/Role Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge-pill ${isOffline ? 'badge-coral' : 'badge-emerald'}`}>
            {isOffline ? <WifiOff size={15} /> : <Wifi size={15} />}
            {isOffline ? t('offlineBanner') : t('onlineBanner')}
          </span>

          {/* Language Selector Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
            {(['en', 'hi', 'as'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  background: lang === l ? '#10B981' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                aria-pressed={lang === l}
              >
                {l === 'as' ? 'অসমীয়া' : l === 'hi' ? 'हिन्दी' : 'ENG'}
              </button>
            ))}
          </div>

          {/* Screen Quick Switches */}
          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => setActiveScreen(activeScreen === 'caregiver_home' ? 'elderly_home' : 'caregiver_home')}
            style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px' }}
            aria-label="Toggle Dashboard View"
          >
            <UserCheck size={18} color="#10B981" />
            {activeScreen === 'caregiver_home' ? t('elderlyMode') : t('caregiverDashboard')}
          </button>

          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => setActiveScreen('profile')}
            style={{ minHeight: '44px', padding: '0 12px' }}
            title={t('profileTitle')}
            aria-label={t('profileTitle')}
          >
            <User size={18} color="#6EE7B7" />
          </button>

          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => setActiveScreen('settings')}
            style={{ minHeight: '44px', padding: '0 12px' }}
            title={t('settingsTitle')}
            aria-label={t('settingsTitle')}
          >
            <SettingsIcon size={18} color="#C4B5FD" />
          </button>

          <button
            onClick={handleLogout}
            title={t('logoutButton')}
            aria-label={t('logoutButton')}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              color: '#FDA4AF',
              padding: '10px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '700',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Sync Toast Notification */}
      {syncStatusMsg && (
        <div
          style={{
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            color: '#FFFFFF',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
          role="status"
        >
          {syncStatusMsg}
        </div>
      )}

      {/* Main Container View */}
      <main className="main-content" role="main">
        {/* Screen 1: Elderly Home Screen */}
        {activeScreen === 'elderly_home' && (
          <ElderlyHomeScreen
            user={currentUser}
            lang={lang}
            difficulty={difficulty}
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
            onNavigate={(dest) => {
              if (dest === 'games') setActiveScreen('games');
              else if (dest === 'reminders') setActiveScreen('reminders');
              else if (dest === 'my_progress') setActiveScreen('my_progress');
              else if (dest === 'profile') setActiveScreen('profile');
              else if (dest === 'settings') setActiveScreen('settings');
            }}
            onTriggerVoice={handleTriggerVoice}
          />
        )}

        {/* Screen 2: Caregiver Dashboard */}
        {activeScreen === 'caregiver_home' && (
          <CaregiverDashboard
            user={currentUser}
            onBackToElderly={() => setActiveScreen('elderly_home')}
            onNavigateSettings={() => setActiveScreen('settings')}
            lang={lang}
          />
        )}

        {/* Screen 3: Profile Screen */}
        {activeScreen === 'profile' && (
          <ProfileScreen
            user={currentUser}
            lang={lang}
            onBack={() => setActiveScreen(currentUser?.role === 'caregiver' ? 'caregiver_home' : 'elderly_home')}
            onLanguageChange={(newLang) => setLang(newLang)}
          />
        )}

        {/* Screen 4: Settings Screen */}
        {activeScreen === 'settings' && (
          <SettingsScreen
            lang={lang}
            onLanguageChange={(newLang) => setLang(newLang)}
            textSize={textSize}
            onTextSizeChange={(size) => setTextSize(size)}
            voiceEnabled={voiceEnabled}
            onVoiceToggle={(val) => setVoiceEnabled(val)}
            onBack={() => setActiveScreen(currentUser?.role === 'caregiver' ? 'caregiver_home' : 'elderly_home')}
            onLogout={handleLogout}
          />
        )}

        {/* Screen 5: Reminders Screen */}
        {activeScreen === 'reminders' && (
          <RemindersScreen
            lang={lang}
            onBack={() => setActiveScreen('elderly_home')}
          />
        )}

        {/* Screen 6: My Progress (Coming Soon) */}
        {activeScreen === 'my_progress' && (
          <ComingSoonScreen
            titleKey="myProgress"
            lang={lang}
            onBack={() => setActiveScreen('elderly_home')}
          />
        )}

        {/* Screen 7: Cognitive Games Launcher */}
        {activeScreen === 'games' && (
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => setActiveScreen('elderly_home')}
                className="btn-primary btn-glass-subtle"
                style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}
              >
                <ArrowLeft size={20} /> {t('backToHome')}
              </button>
              <h2 className="text-section-title">{t('cognitiveGames')}</h2>
              <span className="badge-pill badge-emerald">Level {difficulty}</span>
            </div>

            <div className="activities-grid">
              <div className="glass-panel glass-panel-hover" onClick={() => handleStartGame('memory')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
                <div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Brain size={28} color="#10B981" />
                  </div>
                  <h4 className="text-card-title">{t('memoryGameTitle')}</h4>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('memoryGameDesc')}</p>
                </div>
                <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px' }}>
                  <Play size={18} /> {t('startActivity')}
                </button>
              </div>

              <div className="glass-panel glass-panel-hover" onClick={() => handleStartGame('pattern')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
                <div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Target size={28} color="#F59E0B" />
                  </div>
                  <h4 className="text-card-title">{t('patternGameTitle')}</h4>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('patternGameDesc')}</p>
                </div>
                <button className="btn-primary btn-amber" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px' }}>
                  <Play size={18} /> {t('startActivity')}
                </button>
              </div>

              <div className="glass-panel glass-panel-hover" onClick={() => handleStartGame('routine')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
                <div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Calendar size={28} color="#6366F1" />
                  </div>
                  <h4 className="text-card-title">{t('routineGameTitle')}</h4>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('routineGameDesc')}</p>
                </div>
                <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                  <Play size={18} /> {t('startActivity')}
                </button>
              </div>

              <div className="glass-panel glass-panel-hover" onClick={() => handleStartGame('object_rec')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
                <div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(20, 184, 166, 0.15)', border: '1px solid #14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Search size={28} color="#14B8A6" />
                  </div>
                  <h4 className="text-card-title">{t('objectGameTitle')}</h4>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('objectGameDesc')}</p>
                </div>
                <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px', background: 'linear-gradient(135deg, #14B8A6, #0D9488)' }}>
                  <Play size={18} /> {t('startActivity')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Screen 8: Active Game Gameplay Screen */}
        {activeScreen === 'game' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveScreen('games')}
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
      </main>

      {/* Floating Voice Assistant Dock */}
      <div className="voice-footer-bar" role="navigation" aria-label="Voice Dock">
        <button
          onClick={handleTriggerVoice}
          className="pulse-mic"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: voiceEnabled ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.2)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={voiceEnabled ? 'Speak' : 'Voice Assistance Muted'}
          aria-label={t('voicePrompt')}
        >
          <Mic size={26} color="#FFFFFF" />
        </button>

        <span style={{ fontSize: '15px', fontWeight: '600', color: '#E2E8F0' }}>
          {t('voicePrompt')}
        </span>

        {activeScreen !== 'elderly_home' && activeScreen !== 'caregiver_home' && (
          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => setActiveScreen(currentUser?.role === 'caregiver' ? 'caregiver_home' : 'elderly_home')}
            style={{ minHeight: '38px', padding: '0 14px', fontSize: '13px' }}
          >
            Home
          </button>
        )}
      </div>

      {/* Result & Explainable AI Modal */}
      {gameResult && (
        <GameResultModal
          result={gameResult}
          aiRecommendation={aiRecommendation}
          onNext={handleModalNext}
          lang={lang}
        />
      )}
    </div>
  );
};
