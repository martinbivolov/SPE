import React from 'react';
import { Flex, Text, Box, IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { FiGrid, FiMenu, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  onSignOut?: () => void;
  userName?: string | null;
  userEmail?: string | null;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onSignOut, userName, userEmail }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail
      ? userEmail[0].toUpperCase()
      : '?';

  return (
    <Flex
      as="header"
      position="relative"
      height="60px"
      align="center"
      justify="center"
      px={6}
      bg="gray.600"
      _dark={{ bg: 'gray.900' }}
      color="white"
    >
      <IconButton
        aria-label="App menu"
        variant="ghost"
        color="white"
        position="absolute"
        left={6}
        display={{ base: "none", md: "flex" }}
      >
        <FiGrid />
      </IconButton>
      
      <IconButton
        aria-label="Toggle menu"
        variant="ghost"
        color="white"
        position="absolute"
        left={6}
        display={{ base: "flex", md: "none" }}
        onClick={onMenuClick}
      >
        <FiMenu />
      </IconButton>

      <Text fontSize="xl" fontWeight="bold">
        {title}
      </Text>
      <Flex
        align="center"
        position="absolute"
        right={6}
        gap={2}
      >
        <Text mr={2}>{userName ?? userEmail ?? 'Guest'}</Text>
        <Box
          w="32px"
          h="32px"
          bg="gray.400"
          _dark={{ bg: 'gray.700' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="sm"
          fontWeight="bold"
        >
          {initials}
        </Box>
        <IconButton
          aria-label="Toggle dark mode"
          variant="ghost"
          color="white"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <FiSun /> : <FiMoon />}
        </IconButton>
        {onSignOut && (
          <IconButton
            aria-label="Sign out"
            variant="ghost"
            color="white"
            onClick={onSignOut}
          >
            <FiLogOut />
          </IconButton>
        )}
      </Flex>
    </Flex>
  );
};

export default Header;
