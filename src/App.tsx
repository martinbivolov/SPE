import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Flex, Button, Spinner, Text } from '@chakra-ui/react';
import SoundPreference from './Pages/SoundPreference';
import LifestyleExploration from './Pages/LifestyleExploration';
import DigitalTwin from './Pages/DigitalTwin';
import SignIn from './Pages/SignIn';
import { useAuth } from './hooks/useAuth';
import StoryIntro from './components/StoryIntro';
import ProfileForm from './features/profile/ProfileForm';

function App() {
  const navigate = useNavigate();
  const { data: user, loading, signOut } = useAuth();

  if (loading) {
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
    <>
      <Flex justify="flex-end" p={3} bg="gray.100">
        <Button size="sm" variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      </Flex>
      <Routes>
        <Route path="/" element={<Navigate to="/lifestyle" />} />
        {/* <Route path="/profile" element={<ProfileForm onNext={() => navigate('/lifestyle')} />} /> */}
        <Route path="/sound" element={<SoundPreference userId={user.id} onCompleted={() => navigate('/digital-twin')} />} />
        <Route path="/lifestyle" element={<LifestyleExploration userId={user.id} onNext={() => navigate('/story-intro')} onBack={() => navigate('/sound')} />} />
        <Route path="/story-intro" element={<StoryIntro onComplete={() => navigate('/sound')} />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
      </Routes>
    </>
  );
}

export default App;
