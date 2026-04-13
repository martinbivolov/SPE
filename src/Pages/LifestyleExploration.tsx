import React, { useEffect, useState } from 'react';
import { Flex, Box, Spinner } from '@chakra-ui/react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useProfile } from '../hooks/useProfile';
import SoundPreferenceQuestions from '../features/soundSplit/SoundPreferenceQuestions';
import LifestyleSelectionSection from '../features/lifestyle/LifestyleSelectionSection';
import LifestyleImagePicker from '../features/lifestyle/LifestyleImagePicker';
import Footer from '../components/layout/Footer';
import LifestyleSelectionSectionMulti from '../features/lifestyle/LifestyleSelectionSectionMulti';
import SoundExplorationWelcome from '../components/SoundExplorationWelcome';
import SoundTutorial from '../components/SoundTutorial';
import HeadphoneSetup from '../components/HeadphoneSetup';
import { supabase } from '../lib/supabase';

interface LifestyleExplorationProps {
  userId: string;
  onNext?: () => void;
  onBack?: () => void;
  onSignOut?: () => void;
}

const LifestyleExploration: React.FC<LifestyleExplorationProps> = ({ userId, onNext, onBack, onSignOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [selectedLifestyleImages, setSelectedLifestyleImages] = useState<string[]>([]);
  // Stays false until quiz_section is loaded — prevents saving 0 before the real value is read.
  const [sectionLoaded, setSectionLoaded] = useState(false);

  const { profile, loading: profileLoading } = useProfile(userId);

  // STEP 4 — Load saved section on mount and restore position.
  useEffect(() => {
    if (!userId) return;
    const loadSection = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('quiz_section')
        .eq('id', userId)
        .single();

      if (data?.quiz_section) {
        setCurrentStep(data.quiz_section);
      }

      setSectionLoaded(true);
    };
    void loadSection();
  }, [userId]);

  // STEP 3 — Persist section index whenever it changes.
  // The sectionLoaded guard prevents overwriting the saved value on mount.
  useEffect(() => {
    if (!userId || !sectionLoaded) return;
    supabase
      .from('profiles')
      .update({ quiz_section: currentStep })
      .eq('id', userId)
      .then(() => {});
  }, [currentStep, userId, sectionLoaded]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNext = () => {
    if (currentStep === 6) {
      // Final completion — reset both section and step.
      supabase
        .from('profiles')
        .update({ quiz_section: 0, quiz_step: 0 })
        .eq('id', userId)
        .then(() => {});
      onNext?.();
    } else {
      console.log('[lifestyle] advancing to step:', currentStep + 1, 'quiz_section saving:', currentStep + 1);
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
      case 4:
        return (
          <SoundExplorationWelcome
            onStart={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <SoundTutorial
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <HeadphoneSetup
            onNext={handleNext}
            onBack={handleBack}
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
        <Header title={getHeaderTitle()} onMenuClick={toggleSidebar} onSignOut={onSignOut} userName={profileLoading ? undefined : profile?.name ?? undefined} userEmail={profileLoading ? undefined : profile?.email ?? undefined} />
        <Box
            flex="1"
            p={{ base: 3, md: 0 }}
            overflowY="auto"
            display="flex"
            flexDirection="column"
            alignItems={{ base: "stretch", md: "center" }}
            justifyContent={{ base: "flex-start", md: "center" }}
          >
          {!sectionLoaded ? (
            <Flex align="center" justify="center" flex="1" minH="420px">
              <Spinner size="lg" color="purple.500" />
            </Flex>
          ) : (
            renderContent()
          )}
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default LifestyleExploration;
