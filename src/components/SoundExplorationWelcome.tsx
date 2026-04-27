import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { FiHeadphones } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import StageButton from './StageButton';

interface SoundExplorationWelcomeProps {
  onStart: () => void;
  onBack: () => void;
}

const SoundExplorationWelcome: React.FC<SoundExplorationWelcomeProps> = ({ onStart, onBack }) => {
  const { t } = useTranslation();
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
            as={FiHeadphones}
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
          {t('sound.welcome.title')}
        </Text>

        {/* Description */}
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          color="gray.500"
          _dark={{ color: 'gray.400' }}
          lineHeight="1.7"
        >
          {t('sound.welcome.description')}
        </Text>

        {/* Start card / button */}
        <Box
          as="button"
          onClick={onStart}
          mt={4}
          px={10}
          py={5}
          borderRadius="xl"
          bg="purple.500"
          color="white"
          fontWeight="700"
          fontSize={{ base: 'lg', md: 'xl' }}
          boxShadow="0 4px 14px rgba(128, 90, 213, 0.45)"
          transition="all 0.25s ease"
          _hover={{
            bg: 'purple.600',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(128, 90, 213, 0.55)',
          }}
          _active={{
            bg: 'purple.700',
            transform: 'translateY(0)',
          }}
        >
          {t('sound.welcome.start')}
        </Box>
      </Flex>

      {/* Back */}
      <Flex justify="flex-start" w="100%" mt="auto" pt={8}>
        <StageButton variantType="outline" onClick={onBack}>
          {t('common.back')}
        </StageButton>
      </Flex>
    </Box>
  );
};

export default SoundExplorationWelcome;
