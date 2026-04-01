import type { FormEvent } from 'react';
import { useState } from 'react';
import { Box, Button, Flex, Input, Spinner, Text } from '@chakra-ui/react';
import SoundPreference from './Pages/SoundPreference';
import LifestyleExploration from './Pages/LifestyleExploration';
import { useAuth } from './hooks/useAuth';
import StoryIntro from './components/StoryIntro';

function App() {
  const [currentPage, setCurrentPage] = useState<'sound' | 'lifestyle'>('lifestyle');
  const [email, setEmail] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [showStoryIntro, setShowStoryIntro] = useState(false);

  const { data: user, loading, error, signIn, signOut } = useAuth();

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthNotice(null);

    const { error: signInError } = await signIn(email.trim());
    if (signInError) {
      setAuthNotice(signInError);
      return;
    }

    setAuthNotice('Magic link sent. Check your inbox and open the link to continue.');
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" direction="column" gap={3}>
        <Spinner size="lg" color="purple.500" />
        <Text color="gray.600">Checking your session...</Text>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
        <Box w="100%" maxW="460px" bg="white" p={8} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
          <Text fontSize="2xl" fontWeight="700" mb={2}>
            Sign in with magic link
          </Text>
          <Text color="gray.600" mb={6}>
            Enter your email and we will send you a secure sign-in link.
          </Text>

          <form onSubmit={handleSignIn}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              mb={4}
              required
            />
            <Button type="submit" colorPalette="purple" w="100%">
              Send magic link
            </Button>
          </form>

          {(authNotice || error) && (
            <Text mt={4} color={error ? 'red.500' : 'green.600'} fontSize="sm" fontWeight="600">
              {error ?? authNotice}
            </Text>
          )}
        </Box>
      </Flex>
    );
  }

  if (showStoryIntro) {
    return (
      <StoryIntro
        onComplete={() => {
          setShowStoryIntro(false);
          setCurrentPage('sound');
        }}
      />
    );
  }

  return currentPage === 'sound' ? (
    <SoundPreference userId={user.id} onCompleted={() => setCurrentPage('lifestyle')} />
  ) : (
    <>
      <Flex justify="flex-end" p={3} bg="gray.100">
        <Button size="sm" variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      </Flex>
      <LifestyleExploration
        userId={user.id}
        onNext={() => setShowStoryIntro(true)}
        onBack={() => setCurrentPage('sound')}
      />
    </>
  );
}

export default App;
