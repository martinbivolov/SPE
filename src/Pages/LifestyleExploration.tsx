import React, { useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import SoundPreferenceQuestions from '../features/soundSplit/SoundPreferenceQuestions';
import LifestyleSelectionSection from '../features/lifestyle/LifestyleSelectionSection';
import LifestyleImagePicker from '../features/lifestyle/LifestyleImagePicker';
import Footer from '../components/layout/Footer';
import LifestyleSelectionSectionMulti from '../features/lifestyle/LifestyleSelectionSectionMulti';

interface LifestyleExplorationProps {
  userId: string;
  onNext?: () => void;
  onBack?: () => void;
}

const LifestyleExploration: React.FC<LifestyleExplorationProps> = ({ userId, onNext, onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [selectedLifestyleImages, setSelectedLifestyleImages] = useState<string[]>([]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNext = () => {
    if (currentStep === 2) {
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
        return <SoundPreferenceQuestions userId={userId} onNext={handleNext} onBack={handleBack} />;
        case 1:
        return (
          <LifestyleSelectionSectionMulti
            userId={userId}
            onNext={handleNext}
            onBack={handleBack}
            selectedOptionIds={selectedOptionIds}
            onSelectionChange={setSelectedOptionIds}
          />
        );
      case 2:
        return (
          <LifestyleSelectionSection
            userId={userId}
            onNext={handleNext}
            onBack={handleBack}
            selectedOptionIds={selectedOptionIds}
            onSelectionChange={setSelectedOptionIds}
          />
        );
      case 3:
        return (
          <LifestyleImagePicker
            userId={userId}
            onNext={handleNext}
            onBack={handleBack}
            selectedImages={selectedLifestyleImages}
            onSelectionChange={setSelectedLifestyleImages}
          />
        );
      default:
        return <SoundPreferenceQuestions userId={userId} onNext={handleNext} onBack={handleBack} />;
    }
  };

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: 'gray.800' }} position="relative">
      <Sidebar
        activeItem="Lifestyle"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />
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
