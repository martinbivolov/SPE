import React, { useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import ProfileForm from '../Components/ProfileForm';
import Footer from '../Components/Footer';

interface SoundPreferenceProps {
  onCompleted?: () => void;
}

const SoundPreference: React.FC<SoundPreferenceProps> = ({ onCompleted }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNext = () => {
    onCompleted?.();
  };

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: 'gray.800' }} position="relative">
      <Sidebar activeItem="Profile" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} />
      <Flex direction="column" flex="1" w="100%">
        <Header title="Profile" onMenuClick={toggleSidebar} />
        <Box flex="1" p={0} overflowY="auto" display="flex" alignItems="center" justifyContent="center">
          <ProfileForm onNext={handleNext} />
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default SoundPreference;
