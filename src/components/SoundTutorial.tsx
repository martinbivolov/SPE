import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import StageButton from './StageButton';

interface SoundTutorialProps {
  onNext: () => void;
  onBack: () => void;
}

const SoundTutorial: React.FC<SoundTutorialProps> = ({ onNext, onBack }) => {
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
      alignItems="center"
      justifyContent="center"
      minH="calc(100vh - 220px)"
      maxH="calc(100vh - 220px)"
      overflow="hidden"
    >
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        gap={6}
        maxW="640px"
      >
        {/* Icon */}
        <Flex
          align="center"
          justify="center"
          w={20}
          h={20}
          borderRadius="full"
          bg="purple.100"
          _dark={{ bg: 'purple.900' }}
        >
          <Icon
            as={FiInfo}
            boxSize={10}
            color="purple.500"
            _dark={{ color: 'purple.300' }}
          />
        </Flex>

        {/* Title */}
        <Text
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="800"
          color="gray.800"
          _dark={{ color: 'gray.100' }}
          lineHeight="1.2"
        >
          How It Works
        </Text>

        {/* Placeholder description */}
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          color="gray.500"
          _dark={{ color: 'gray.400' }}
          lineHeight="1.7"
        >
          Tutorial content coming soon. This is where we'll walk you through
          the listening experience step by step before the story begins.
        </Text>
      </Flex>

      {/* Navigation */}
      <Flex justify="space-between" w="100%" mt="auto" pt={8}>
        <StageButton variantType="outline" onClick={onBack}>
          Back
        </StageButton>
        <StageButton variantType="primary" onClick={onNext}>
          Next
        </StageButton>
      </Flex>
    </Box>
  );
};

export default SoundTutorial;
