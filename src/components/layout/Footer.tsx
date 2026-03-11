import React from 'react';
import { Box, Text, Image } from '@chakra-ui/react';

const Footer: React.FC = () => (
  <Box as="footer" py={4} px={4} textAlign="center" bg="gray.100" _dark={{ bg: 'gray.900', borderTop: '1px solid', borderColor: 'gray.700' }} position="relative">
    <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.300' }}>
      WSA Sound Preference Tool by Reka Meszaros and Martin Bivolov
    </Text>
    <Image
      src="/WSA---Wonderful---Loud-Indigo-&-Grey---RGB.png"
      alt="WSA Audiology"
      position="absolute"
      right={{ base: 2, md: 4 }}
      bottom={{ base: 2, md: 3 }}
      h={{ base: '18px', md: '24px' }}
      w="auto"
      objectFit="contain"
    />
  </Box>
);

export default Footer;
