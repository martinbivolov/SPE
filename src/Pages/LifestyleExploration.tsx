import React, { useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import SoundPreferenceQuestions from '../Components/SoundPreferenceQuestions';
import LifestyleQuestions from '../Components/LifestyleQuestions';
import LifestyleSelectionSection from '../Components/LifestyleSelectionSection';
import LifestyleImagePicker from '../Components/LifestyleImagePicker';
import Footer from '../Components/Footer';

interface LifestyleExplorationProps {
  onNext?: () => void;
  onBack?: () => void;
}

const LifestyleExploration: React.FC<LifestyleExplorationProps> = ({ onNext, onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLifestyleStatements, setSelectedLifestyleStatements] = useState<string[]>([]);
  const [selectedLifestyleImages, setSelectedLifestyleImages] = useState<string[]>([]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNext = () => {
    if (currentStep === 3) {
      onNext?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack?.();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const getHeaderTitle = () => {
    return "Lifestyle Exploration";
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return <SoundPreferenceQuestions onNext={handleNext} onBack={handleBack} />;
      case 1:
        return <LifestyleQuestions onNext={handleNext} onBack={handleBack} />;
      case 2:
        return (
          <LifestyleSelectionSection
            onNext={handleNext}
            onBack={handleBack}
            selectedStatements={selectedLifestyleStatements}
            onSelectionChange={setSelectedLifestyleStatements}
          />
        );
      case 3:
        return (
          <LifestyleImagePicker
            onNext={handleNext}
            onBack={handleBack}
            selectedImages={selectedLifestyleImages}
            onSelectionChange={setSelectedLifestyleImages}
          />
        );
      default:
        return <SoundPreferenceQuestions onNext={handleNext} onBack={handleBack} />;
    }
  };

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: 'gray.800' }} position="relative">
      <Sidebar activeItem="Lifestyle" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} />
      <Flex direction="column" flex="1" w="100%">
        <Header title={getHeaderTitle()} onMenuClick={toggleSidebar} />
        <Box
            flex="1"
            p={{ base: 3, md: 0 }}
            overflowY="auto"
            display="flex"
            flexDirection="column"           
            alignItems={{ base: "stretch", md: "center" }}
            justifyContent={{ base: "flex-start", md: "center" }}
          >
  {renderContent()}
</Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default LifestyleExploration;
