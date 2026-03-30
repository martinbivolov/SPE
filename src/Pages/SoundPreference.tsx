import React, { useMemo, useState } from 'react';
import { Flex, Box, Spinner, Text } from '@chakra-ui/react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SoundPreferenceSplitScreen from '../features/soundSplit/SoundPreferenceSplitScreen';
import type { SessionConfig } from '../features/soundSplit/types';
import { useSceneMatch } from '../hooks/useSceneMatch';
import { useSaveSessionResult } from '../hooks/useSaveSessionResult';

interface SoundPreferenceProps {
  userId: string;
  onCompleted?: () => void;
}

const SoundPreference: React.FC<SoundPreferenceProps> = ({ userId, onCompleted }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: scene, loading, error } = useSceneMatch(userId);
  const {
    loading: resultLoading,
    error: resultError,
    saveResult,
  } = useSaveSessionResult();

  const sessionConfig = useMemo<SessionConfig | null>(() => {
    if (!scene) {
      return null;
    }

    const objects = scene.scene_objects ?? [];

    return {
      sceneA: {
        id: `${scene.id}-a`,
        side: 'A',
        name: `${scene.label} - Version 1`,
        backgroundImageUrl: scene.background_image_url,
        audioLabel: `${scene.label} A`,
        audioUrl: scene.video_a_url,
        videoUrl: scene.video_a_url,
        elements: objects.map((entry) => ({
          id: `a-${entry.id}`,
          label: entry.label,
          imageUrl: entry.image_url,
          sfxUrl: entry.sfx_url,
          x: entry.x,
          y: entry.y,
          size: entry.size,
        })),
      },
      sceneB: {
        id: `${scene.id}-b`,
        side: 'B',
        name: `${scene.label} - Version 2`,
        backgroundImageUrl: scene.background_image_url,
        audioLabel: `${scene.label} B`,
        audioUrl: scene.video_b_url,
        videoUrl: scene.video_b_url,
        elements: objects.map((entry) => ({
          id: `b-${entry.id}`,
          label: entry.label,
          imageUrl: entry.image_url,
          sfxUrl: entry.sfx_url,
          x: entry.x,
          y: entry.y,
          size: entry.size,
        })),
      },
    };
  }, [scene]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSaveResult = async (preferredVersion: 'A' | 'B', preferenceStrength: number) => {
    if (!scene?.id) {
      return false;
    }

    const ok = await saveResult(userId, scene.id, preferredVersion, preferenceStrength);
    if (ok) {
      localStorage.setItem('sp_onboarding_complete', 'true');
    }
    return ok;
  };

  const handleNext = () => {
    onCompleted?.();
  };

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: 'gray.800' }} position="relative">
      <Sidebar activeItem="Profile" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} />
      <Flex direction="column" flex="1" w="100%">
        <Header title="Sound Preference" onMenuClick={toggleSidebar} />
        <Box flex="1" p={0} overflowY="auto" display="flex" alignItems="center" justifyContent="center">
          {loading && (
            <Flex direction="column" align="center" justify="center" gap={3}>
              <Spinner size="lg" color="purple.500" />
              <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                ur best scene...
              </Text>
            </Flex>
          )}

          {!loading && error && (
            <Box p={6} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50">
              <Text color="red.600" fontWeight="600">
                Could not load matched scene: {error}
              </Text>
            </Box>
          )}

          {!loading && !error && sessionConfig && (
            <SoundPreferenceSplitScreen
              onBack={handleNext}
              onNext={handleNext}
              sessionConfig={sessionConfig}
              onSubmitPreference={handleSaveResult}
              isSubmittingPreference={resultLoading}
              submitError={resultError}
            />
          )}
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default SoundPreference;
