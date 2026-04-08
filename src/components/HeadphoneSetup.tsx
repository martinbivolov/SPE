import React, { useState } from 'react';
import { Box, Flex, Text, Icon, SimpleGrid } from '@chakra-ui/react';
import { FiHeadphones, FiWifi, FiVolumeX } from 'react-icons/fi';
import StageButton from './StageButton';

type ConnectionChoice = 'wired' | 'wireless' | 'none' | null;

interface HeadphoneSetupProps {
  onNext: () => void;
  onBack: () => void;
}

const connectionOptions: { key: ConnectionChoice; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'wired', label: 'By Wire', icon: FiHeadphones, description: 'Plug in your headphones' },
  { key: 'wireless', label: 'Wireless', icon: FiWifi, description: 'Bluetooth or wireless' },
  { key: 'none', label: 'Without Either', icon: FiVolumeX, description: 'Use device speakers' },
];

const HeadphoneSetup: React.FC<HeadphoneSetupProps> = ({ onNext, onBack }) => {
  const [choice, setChoice] = useState<ConnectionChoice>(null);
  const [volume, setVolume] = useState(50);

  return (
    <Box
      maxW="1120px"
      w="100%"
      mx="auto"
      bg="white"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      p={{ base: 6, md: 10 }}
      border="1px solid"
      borderColor="gray.300"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      minH="calc(100vh - 220px)"
      maxH="calc(100vh - 220px)"
      overflow="hidden"
    >
      {/* Title */}
      <Text
        fontSize={{ base: '2xl', md: '4xl' }}
        fontWeight="800"
        textAlign="center"
        color="gray.800"
        _dark={{ color: 'gray.100' }}
        lineHeight="1.2"
        mb={2}
      >
        Before we begin
      </Text>
      <Text
        fontSize={{ base: 'md', md: 'lg' }}
        color="gray.500"
        _dark={{ color: 'gray.400' }}
        textAlign="center"
        mb={{ base: 6, md: 10 }}
      >
        Last touch before we begin — we recommend using headphones. How would you like to connect them?
      </Text>

      {/* Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} mb={8}>
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
              _dark={{ borderColor: selected ? 'purple.300' : 'gray.600', bg: selected ? 'purple.900' : 'gray.600' }}
              bg={selected ? 'purple.50' : 'gray.50'}
              boxShadow={selected ? 'md' : 'sm'}
              transition="all 0.2s ease"
              _hover={{
                borderColor: 'purple.300',
                boxShadow: 'lg',
                transform: 'translateY(-2px)',
              }}
              _focusVisible={{ outline: '2px solid', outlineColor: 'purple.400' }}
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
                _dark={{ bg: selected ? 'purple.800' : 'gray.500' }}
                transition="all 0.2s ease"
              >
                <Icon
                  as={opt.icon}
                  boxSize={8}
                  color={selected ? 'purple.500' : 'gray.400'}
                  _dark={{ color: selected ? 'purple.300' : 'gray.300' }}
                  transition="all 0.2s ease"
                />
              </Flex>
              <Text
                fontWeight="700"
                fontSize={{ base: 'lg', md: 'xl' }}
                color={selected ? 'purple.600' : 'gray.700'}
                _dark={{ color: selected ? 'purple.200' : 'gray.200' }}
              >
                {opt.label}
              </Text>
              <Text
                fontSize="sm"
                color="gray.400"
                _dark={{ color: 'gray.400' }}
              >
                {opt.description}
              </Text>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Volume slider — shown after selecting an option */}
      {choice && (
        <Flex
          direction="column"
          align="center"
          gap={3}
          mb={4}
          animation="fadeIn 0.3s ease"
          css={{
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(8px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Text fontWeight="600" color="gray.700" _dark={{ color: 'gray.200' }}>
            Adjust your volume
          </Text>

          <Flex align="center" gap={4} w="100%" maxW="400px">
            <Icon as={FiVolumeX} boxSize={5} color="gray.400" />
            <Box position="relative" flex="1" h="8px">
              {/* Track background */}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                h="8px"
                borderRadius="full"
                bg="gray.200"
                _dark={{ bg: 'gray.500' }}
              />
              {/* Filled portion */}
              <Box
                position="absolute"
                top="0"
                left="0"
                h="8px"
                w={`${volume}%`}
                borderRadius="full"
                bg="purple.400"
                transition="width 0.1s ease"
              />
              {/* Native input */}
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
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
              {/* Thumb indicator */}
              <Box
                position="absolute"
                top="-6px"
                left={`${volume}%`}
                transform="translateX(-50%)"
                w="20px"
                h="20px"
                borderRadius="full"
                bg="purple.500"
                boxShadow="0 2px 8px rgba(128, 90, 213, 0.5)"
                border="3px solid white"
                _dark={{ borderColor: 'gray.700' }}
                transition="left 0.1s ease"
                pointerEvents="none"
              />
            </Box>
            <FiHeadphones />
          </Flex>

          <Text fontSize="sm" fontWeight="600" color="purple.500" _dark={{ color: 'purple.300' }}>
            {volume}%
          </Text>
        </Flex>
      )}

      {/* Navigation */}
      <Flex justify="space-between" w="100%" mt="auto" pt={6}>
        <StageButton variantType="outline" onClick={onBack}>
          Back
        </StageButton>
        <StageButton
          variantType={choice ? 'primary' : 'disabled'}
          onClick={choice ? onNext : undefined}
        >
          Next
        </StageButton>
      </Flex>
    </Box>
  );
};

export default HeadphoneSetup;
