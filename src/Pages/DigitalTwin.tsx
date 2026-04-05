import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import Results from '../components/Results';

interface DigitalTwinProps {
  onSignOut?: () => void;
}

const DigitalTwin: React.FC<DigitalTwinProps> = ({ onSignOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <Header title="Your Digital Twin" onMenuClick={toggleSidebar} onSignOut={onSignOut} />
        <Box
          flex="1"
          p={{ base: 3, md: 0 }}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          alignItems={{ base: "stretch", md: "center" }}
          justifyContent={{ base: "flex-start", md: "center" }}
        >
          <Results />
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default DigitalTwin;
