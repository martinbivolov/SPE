import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface ReplayOptionsModalProps {
  isOpen: boolean;
  onReplayFirst: () => void;
  onReplaySecond: () => void;
  onReplayBoth: () => void;
  onSkipReplay: () => void;
}

interface PreferenceModalProps {
  isOpen: boolean;
  selectedVersion: 'A' | 'B' | null;
  onSelect: (version: 'A' | 'B') => void;
}

interface StrengthModalProps {
  isOpen: boolean;
  preferredVersion: 'A' | 'B' | null;
  selectedStrength: 1 | 2 | 3 | 4 | 5 | null;
  onSubmit: (strength: 1 | 2 | 3 | 4 | 5) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  title?: string;
}

interface ModalShellProps {
  isOpen: boolean;
  step: 1 | 2 | 3;
  children: React.ReactNode;
}

interface OptionConfig {
  key: string;
  label: string;
  isSelected?: boolean;
  onClick: () => void;
  loading?: boolean;
}

interface QuestionModalProps {
  isOpen: boolean;
  step: 1 | 2 | 3;
  title: string;
  options: OptionConfig[];
  subtitle?: string;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const PROGRESS_STEPS: Array<1 | 2 | 3> = [1, 2, 3];

const ModalShell: React.FC<ModalShellProps> = ({ isOpen, step, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={30}
      bg="blackAlpha.600"
      backdropFilter="blur(8px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        w="100%"
        maxW={{ base: '96vw', sm: '560px' }}
        bg="#efedf0"
        border="1px solid"
        borderColor="gray.300"
        _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
        borderRadius="12px"
        boxShadow="xl"
        overflow="hidden"
      >
        <HStack justify="flex-end" gap={3} bg="#ddd8e6" px={4} py={3}>
          {PROGRESS_STEPS.map((item) => (
            <Box key={item} w="14px" h="14px" borderRadius="full" bg={step === item ? 'gray.700' : 'gray.300'} />
          ))}
        </HStack>
        <Box px={{ base: 3, md: 4 }} py={{ base: 4, md: 5 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const OptionButton: React.FC<{
  label: string;
  isSelected?: boolean;
  onClick: () => void;
  loading?: boolean;
}> = ({ label, isSelected = false, onClick, loading = false }) => {
  const defaultBg = '#c9cacc';
  const hoverBg = '#89ea78';
  const selectedBg = '#7ae467';

  return (
    <Button
      justifyContent="flex-start"
      w="100%"
      minH={{ base: '44px', md: '48px' }}
      h="auto"
      borderRadius="6px"
      px={4}
      py={{ base: 2, md: 2.5 }}
      whiteSpace="normal"
      textAlign="left"
      lineHeight="1.3"
      fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
      fontWeight="500"
      color="#6f7276"
      bg={isSelected ? selectedBg : defaultBg}
      _hover={{ bg: isSelected ? selectedBg : hoverBg }}
      _active={{ bg: selectedBg }}
      onClick={onClick}
      loading={loading}
    >
      {label}
    </Button>
  );
};

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  step,
  title,
  options,
  subtitle,
  isSubmitting = false,
  submitError,
}) => {
  return (
    <ModalShell isOpen={isOpen} step={step}>
      <VStack align="stretch" gap={3}>
        <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} color="#6f7276" px={1} pb={2} lineHeight="1.3">
          {title}
        </Text>

        {subtitle && (
          <Text color="gray.600" _dark={{ color: 'gray.300' }} fontSize={{ base: 'sm', md: 'md' }}>
            {subtitle}
          </Text>
        )}

        {options.map((option) => (
          <OptionButton
            key={option.key}
            label={option.label}
            isSelected={option.isSelected}
            onClick={option.onClick}
            loading={option.loading}
          />
        ))}

        {isSubmitting && (
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
            Saving your preference...
          </Text>
        )}

        {submitError && (
          <Text color="red.500" fontSize="sm" fontWeight="600">
            {submitError}
          </Text>
        )}
      </VStack>
    </ModalShell>
  );
};

export const ReplayOptionsModal: React.FC<ReplayOptionsModalProps> = ({
  isOpen,
  onReplayFirst,
  onReplaySecond,
  onReplayBoth,
  onSkipReplay,
}) => {
  const { t } = useTranslation();
  const replayOptions: OptionConfig[] = [
    { key: 'replay-first', label: t('replay.version1'), onClick: onReplayFirst },
    { key: 'replay-second', label: t('replay.version2'), onClick: onReplaySecond },
    { key: 'replay-both', label: t('replay.both'), onClick: onReplayBoth },
    { key: 'skip-replay', label: t('replay.skip'), onClick: onSkipReplay },
  ];

  return (
    <QuestionModal
      isOpen={isOpen}
      step={1}
      title={t('replay.question')}
      options={replayOptions}
    />
  );
};

export const PreferenceModal: React.FC<PreferenceModalProps> = ({
  isOpen,
  selectedVersion,
  onSelect,
}) => {
  const { t } = useTranslation();
  const preferenceOptions: OptionConfig[] = [
    { key: 'version-a', label: t('sound.tutorial.versionOne'), isSelected: selectedVersion === 'A', onClick: () => onSelect('A') },
    { key: 'version-b', label: t('sound.tutorial.versionTwo'), isSelected: selectedVersion === 'B', onClick: () => onSelect('B') },
  ];

  return (
    <QuestionModal
      isOpen={isOpen}
      step={2}
      title={t('sound.preference.whichPrefer')}
      options={preferenceOptions}
    />
  );
};

export const StrengthModal: React.FC<StrengthModalProps> = ({
  isOpen,
  preferredVersion,
  selectedStrength,
  onSubmit,
  isSubmitting = false,
  submitError,
  title,
}) => {
  const { t } = useTranslation();
  const strengthOptions: OptionConfig[] = [
    {
      key: 'strength-1',
      label: t('sound.preference.veryWeak'),
      isSelected: selectedStrength === 1,
      onClick: () => void onSubmit(1),
      loading: isSubmitting,
    },
    {
      key: 'strength-2',
      label: t('sound.preference.weak'),
      isSelected: selectedStrength === 2,
      onClick: () => void onSubmit(2),
      loading: isSubmitting,
    },
    {
      key: 'strength-3',
      label: t('sound.preference.hesitant'),
      isSelected: selectedStrength === 3,
      onClick: () => void onSubmit(3),
      loading: isSubmitting,
    },
    {
      key: 'strength-4',
      label: t('sound.preference.strong'),
      isSelected: selectedStrength === 4,
      onClick: () => void onSubmit(4),
      loading: isSubmitting,
    },
    {
      key: 'strength-5',
      label: t('sound.preference.veryStrong'),
      isSelected: selectedStrength === 5,
      onClick: () => void onSubmit(5),
      loading: isSubmitting,
    },
  ];

  return (
    <QuestionModal
      isOpen={isOpen}
      step={3}
      title={title ?? t('sound.preference.howStrong')}
      subtitle={preferredVersion ? `Preferred version: ${preferredVersion === 'A' ? t('sound.tutorial.versionOne') : t('sound.tutorial.versionTwo')}` : undefined}
      options={strengthOptions}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
};
