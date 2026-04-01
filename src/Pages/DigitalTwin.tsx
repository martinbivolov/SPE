import {
  Box,
  Text,
  Flex,
  Collapsible,
} from "@chakra-ui/react";

const DigitalTwinSection = () => {
  return (
    <Box p={6}>

      {/* -------- LIFESTYLE -------- */}
      <Text fontSize="2xl" fontWeight="700" mb={4}>
        Lifestyle Results
      </Text>

      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger
          asChild
        >
          <Box
            bg="gray.100"
            px={4}
            py={3}
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: "gray.200" }}
          >
            <Flex justify="space-between">
              <Text fontWeight="600">Profile</Text>
              <Text color="gray.500">Expand</Text>
            </Flex>
          </Box>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <Box bg="white" p={4} mt={2} borderRadius="md">
            <Flex justify="space-between" mb={2}>
              <Text color="gray.500">Category</Text>
              <Text color="gray.500">User Selection</Text>
            </Flex>

            <Flex justify="space-between">
              <Text>Dona Jona</Text>
              <Text>First time user</Text>
            </Flex>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* -------- SOUND PREF -------- */}
      <Text fontSize="2xl" fontWeight="700" mt={8} mb={4}>
        Sound Preference Results
      </Text>

      {[1, 2, 3].map((item) => (
        <Collapsible.Root key={item}>
          <Collapsible.Trigger asChild>
            <Box
              bg="gray.100"
              px={4}
              py={3}
              borderRadius="md"
              cursor="pointer"
              mb={2}
              _hover={{ bg: "gray.200" }}
            >
              <Flex justify="space-between">
                <Text fontWeight="600">Scene #{item}</Text>
                <Text color="gray.500">Expand</Text>
              </Flex>
            </Box>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <Box bg="white" p={4} mb={2} borderRadius="md">
              <Flex justify="space-between" mb={2}>
                <Text color="gray.500">Preference</Text>
                <Text>Strong</Text>
              </Flex>

              <Flex justify="space-between" mb={2}>
                <Text color="gray.500">Variant</Text>
                <Text>Prefer first variant</Text>
              </Flex>

              <Flex justify="space-between">
                <Text color="gray.500">Scene</Text>
                <Text>Walk in the Park</Text>
              </Flex>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      ))}

      {/* -------- AUDIO -------- */}
      <Box mt={8} bg="gray.200" p={10} borderRadius="md" textAlign="center">
        <Text color="gray.600">
          Audio will be placed here
        </Text>
      </Box>

    </Box>
  );
};

export default DigitalTwinSection;