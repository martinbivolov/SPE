import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import SoundExplorationComplete from '../components/SoundExplorationComplete';
import { useProfile } from '../hooks/useProfile';

interface SoundExplorationCompletePageProps {
  userId: string;
  onNext: () => void;
  onSignOut?: () => void;
}

const SoundExplorationCompletePage: React.FC<SoundExplorationCompletePageProps> = ({
  userId,
  onNext,
  onSignOut,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, loading: profileLoading } = useProfile(userId);

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: 'gray.800' }} position="relative">
      <Sidebar
        activeItem="SoundExploration"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />
      <Flex direction="column" flex="1" w="100%">
        <Header
          title="Sound Preference"
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          onSignOut={onSignOut}
          userName={profileLoading ? undefined : profile?.name ?? undefined}
          userEmail={profileLoading ? undefined : profile?.email ?? undefined}
        />
        <Box
          flex="1"
          overflowY="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={{ base: 3, md: 6 }}
        >
          <SoundExplorationComplete onNext={onNext} />
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default SoundExplorationCompletePage;
