import React from "react";
import { Stack, Box, Button } from "@chakra-ui/react";

interface SidebarProps {
  activeItem: "Profile" | "Lifestyle" | "Sound" | "DigitalTwin";
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, isOpen, onClose, onOpen }) => {
  const items = [
    { label: "Profile", key: "Profile" },
    { label: "Lifestyle Exploration", key: "Lifestyle" },
    { label: "Sound Preference", key: "Sound" },
    { label: "Your Digital Twin", key: "DigitalTwin" },
  ] as const;

  return (
    <>
      {/* Mobile sidebar handle indicator (full height) */}
      {!isOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          left={0}
          top={0}
          w="4px"
          h="100vh"
          bg="linear-gradient(135deg, #7c3aed 0%, #9d4edd 100%)"
          zIndex={98}
          cursor="pointer"
          onClick={onOpen}
          _hover={{
            w: "6px",
          }}
          transition="width 0.2s ease"
        />
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={99}
          display={{ base: "block", md: "none" }}
          onClick={onClose}
        />
      )}

      <Box
        as="aside"
        w="220px"
        h="100vh"
        display={{ base: isOpen ? "flex" : "none", md: "flex" }}
        flexDirection="column"
        p={6}
        flexShrink={0}
        position={{ base: "fixed", md: "relative" }}
        left={0}
        top={0}
        zIndex={100}
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #9d4edd 100%)',
        }}
      >
        {/* Logo */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="50px"
          h="50px"
          bg="rgba(255, 255, 255, 0.2)"
          mb={8}
          fontSize="2xl"
          fontWeight="bold"
          color="white"
        >
          SP
        </Box>

        <Stack gap={3} align="stretch">
          {items.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              justifyContent="flex-start"
              color={
                item.key === activeItem
                  ? "white"
                  : "rgba(255, 255, 255, 0.7)"
              }
              bg={
                item.key === activeItem
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent"
              }
              _hover={{
                bg: "rgba(255, 255, 255, 0.2)",
                color: "white",
              }}
              fontSize="sm"
              fontWeight="500"
              p={3}
              onClick={onClose}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export default Sidebar;