import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import SoundPreference from './Pages/SoundPreference';
import LifestyleExploration from './Pages/LifestyleExploration';
import DigitalTwin from './Pages/DigitalTwin';
import SignIn from './Pages/SignIn';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { LanguageProvider } from './contexts/LanguageContext';
import StoryIntro from './components/StoryIntro';
import AdminSceneEditor from './Pages/AdminSceneEditor';
import SoundExplorationCompletePage from './Pages/SoundExplorationCompletePage';

function App() {
  const navigate = useNavigate();
  const { data: user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id ?? '');

  if (authLoading || (user && profileLoading)) {
    return (
      <Flex minH="100vh" align="center" justify="center" direction="column" gap={3}>
        <Spinner size="lg" color="purple.500" />
        <Text color="gray.600">Checking your session...</Text>
      </Flex>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <LanguageProvider userId={user.id} initialLanguage={profile?.language ?? 'en'}>
      <Routes>
        <Route path="/" element={<Navigate to="/lifestyle" />} />
        {/* <Route path="/profile" element={<ProfileForm onNext={() => navigate('/lifestyle')} />} /> */}
        <Route path="/sound" element={<SoundPreference userId={user.id} onCompleted={() => navigate('/sound-complete')} onSignOut={() => void signOut()} />} />
        <Route path="/sound-complete" element={<SoundExplorationCompletePage userId={user.id} onNext={() => navigate('/digital-twin')} onSignOut={() => void signOut()} />} />
        <Route path="/lifestyle" element={<LifestyleExploration userId={user.id} onNext={() => navigate('/story-intro')} onBack={() => navigate('/sound')} onSignOut={() => void signOut()} />} />
        <Route path="/story-intro" element={<StoryIntro onComplete={() => navigate('/sound')} />} />
        <Route path="/digital-twin" element={<DigitalTwin userId={user.id} onSignOut={() => void signOut()} />} />
        <Route path="/admin/scene-editor" element={<AdminSceneEditor />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
