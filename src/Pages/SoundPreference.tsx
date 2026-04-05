import React, { useState } from 'react';
import { Flex, Box, Spinner, Text } from '@chakra-ui/react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SoundPreferenceSplitScreen from '../features/soundSplit/SoundPreferenceSplitScreen';
import { useStoryRecommendation } from '../hooks/useStoryRecommendation';
import ErrorBoundary from '../components/ErrorBoundary';

interface SoundPreferenceProps {
  userId: string;
  onCompleted?: () => void;
  onSignOut?: () => void;
}

const SoundPreference: React.FC<SoundPreferenceProps> = ({ userId, onCompleted, onSignOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: story, loading, error } = useStoryRecommendation(userId);
const toggleSidebar = () => setSidebarOpen((v) => !v);
  const handleNext = () => onCompleted?.();

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: 'gray.800' }} position="relative">
      <Sidebar
        activeItem="Profile"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />
      <Flex direction="column" flex="1" w="100%">
        <Header title="Sound Preference" onMenuClick={toggleSidebar} onSignOut={onSignOut} />
        <Box
          flex="1"
          p={0}
          overflowY="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {loading && (
            <Flex direction="column" align="center" justify="center" gap={3}>
              <Spinner size="lg" color="purple.500" />
              <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                Loading your story experience...
              </Text>
            </Flex>
          )}

          {!loading && error && (
            <Box p={6} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50">
              <Text color="red.600" fontWeight="600">
                Could not load your story: {error}
              </Text>
            </Box>
          )}

          {!loading && !error && !story && (
            <Box p={6}>
              <Text color="gray.600">No story found. Please contact support.</Text>
            </Box>
          )}

          {!loading && !error && story && (
            <ErrorBoundary fallbackMessage="Could not load the story experience">
              <SoundPreferenceSplitScreen
                userId={userId}
                story={story}
                onBack={handleNext}
                onNext={handleNext}
              />
            </ErrorBoundary>
          )}
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default SoundPreference;
