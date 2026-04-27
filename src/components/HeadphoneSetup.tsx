import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Icon, SimpleGrid } from '@chakra-ui/react';
import { FiHeadphones, FiWifi, FiVolumeX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import StageButton from './StageButton';
import { useVolume } from '../contexts/VolumeContext';

type OptionKey = 'wired' | 'wireless';
type ConnectionChoice = OptionKey | null;

interface HeadphoneSetupProps {
  onNext: () => void;
  onBack: () => void;
}

const HeadphoneSetup: React.FC<HeadphoneSetupProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const connectionOptions: { key: OptionKey; label: string; icon: any }[] = [
    { key: 'wired', label: t('headphones.wired'), icon: FiHeadphones },
    { key: 'wireless', label: t('headphones.wireless'), icon: FiWifi },
  ];
  const [choice, setChoice] = useState<ConnectionChoice>(null);
  const { volume, setVolume } = useVolume();
  const volumePct = Math.round(volume * 100);

  // 🔊 Preview sound
  const previewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    previewRef.current = new Audio('/Audio/system-sounds/select-button.mp3');
  }, []);

  return (
    <Box
      maxW="1120px"
      w="100%"
      mx="auto"
      bg="white"
      p={{ base: 6, md: 10 }}
      border="1px solid"
      borderColor="gray.300"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      minH="calc(100vh - 220px)"
    >
      {/* Title */}
      <Text fontSize="4xl" fontWeight="800" textAlign="center" mb={2}>
        {t('headphones.title')}
      </Text>

      <Text fontSize="lg" color="gray.500" textAlign="center" mb={10}>
        {t('headphones.subtitle')}
      </Text>

      {/* Connection options */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5} mb={8} maxW="600px" mx="auto" w="100%">
        {connectionOptions.map((opt) => {
          const selected = choice === opt.key;

          return (
            <Box
              key={opt.key}
              as="button"
              onClick={() => setChoice(opt.key)}
              p={6}
              borderRadius="xl"
              border="2px solid"
              borderColor={selected ? 'purple.400' : 'gray.200'}
              bg={selected ? 'purple.50' : 'gray.50'}
              boxShadow={selected ? 'md' : 'sm'}
              transition="all 0.2s ease"
              _hover={{
                borderColor: 'purple.300',
                boxShadow: 'lg',
                transform: 'translateY(-2px)',
              }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={4}
            >
              <Flex
                align="center"
                justify="center"
                w={16}
                h={16}
                borderRadius="full"
                bg={selected ? 'purple.100' : 'gray.100'}
              >
                <Icon as={opt.icon} boxSize={8} color={selected ? 'purple.500' : 'gray.400'} />
              </Flex>

              <Text fontWeight="700" fontSize="xl" color={selected ? 'purple.600' : 'gray.700'} textAlign="center">
                {opt.label}
              </Text>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Volume slider */}
      {choice && (
        <Flex direction="column" align="center" gap={3} mb={4}>
          <Text fontWeight="600" color="gray.700">
            Adjust your volume
          </Text>

          <Flex align="center" gap={4} w="100%" maxW="400px">
            <Icon as={FiVolumeX} boxSize={5} color="gray.400" />

            <Box position="relative" flex="1" h="8px">
              {/* Track */}
              <Box position="absolute" top="0" left="0" right="0" h="8px" borderRadius="full" bg="gray.200" />

              {/* Filled */}
              <Box
                position="absolute"
                top="0"
                left="0"
                h="8px"
                w={`${volumePct}%`}
                borderRadius="full"
                bg="purple.400"
              />

              {/* Slider input */}
              <input
                type="range"
                min={0}
                max={100}
                value={volumePct}
                onChange={(e) => {
                  const newVolume = Number(e.target.value) / 100;
                  setVolume(newVolume);

                  // 🔊 PLAY PREVIEW EVERY TIME USER MOVES SLIDER
                  if (previewRef.current) {
                    previewRef.current.currentTime = 0;
                    previewRef.current.volume = newVolume;
                    previewRef.current.play().catch(() => {});
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: 0,
                  width: '100%',
                  height: '16px',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              />

              {/* Thumb */}
              <Box
                position="absolute"
                top="-6px"
                left={`${volumePct}%`}
                transform="translateX(-50%)"
                w="20px"
                h="20px"
                borderRadius="full"
                bg="purple.500"
                border="3px solid white"
              />
            </Box>

            <FiHeadphones />
          </Flex>

          <Text fontSize="sm" fontWeight="600" color="purple.500">
            {volumePct}%
          </Text>
        </Flex>
      )}

      {/* Navigation */}
      <Flex justify="space-between" mt="auto" pt={6}>
        <StageButton variantType="outline" onClick={onBack}>
          {t('common.back')}
        </StageButton>

        <StageButton variantType={choice ? 'primary' : 'disabled'} onClick={choice ? onNext : undefined}>
          {t('common.next')}
        </StageButton>
      </Flex>
    </Box>
  );
};

export default HeadphoneSetup;