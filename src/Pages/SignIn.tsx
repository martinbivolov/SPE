import type { FormEvent } from 'react';
import { useState } from 'react';
import { Box, Button, Flex, Input, Spinner, Text } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const { loading, error, signIn } = useAuth();

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
};

export default SignIn;