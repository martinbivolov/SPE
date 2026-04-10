import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from '../components/layout/Header';
import { useProfile } from '../hooks/useProfile';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import Results from '../components/Results';

interface DigitalTwinProps {
  userId: string;
  onSignOut?: () => void;
}

const DigitalTwin: React.FC<DigitalTwinProps> = ({ userId, onSignOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, loading: profileLoading } = useProfile(userId);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: 'gray.800' }} position="relative">
      <Sidebar
        activeItem="DigitalTwin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />
      <Flex direction="column" flex="1" w="100%">
        <Header title="Your Digital Twin" onMenuClick={toggleSidebar} onSignOut={onSignOut} userName={profileLoading ? undefined : profile?.name ?? undefined} userEmail={profileLoading ? undefined : profile?.email ?? undefined} />
        <Box
          flex="1"
          p={{ base: 3, md: 0 }}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          alignItems={{ base: "stretch", md: "center" }}
          justifyContent="flex-start"
        >
          <Results userId={userId} />
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default DigitalTwin;
