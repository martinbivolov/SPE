import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import Results from '../components/Results';

const DigitalTwin: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Sidebar
        activeItem="DigitalTwin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />
      <Flex direction="column" flex="1" w="100%">
        <Header title="Your Digital Twin" onMenuClick={toggleSidebar} />
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
    </>
  );
};

export default DigitalTwin;
