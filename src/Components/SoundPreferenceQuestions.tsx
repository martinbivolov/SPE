import React from "react";
import {
  Box,
  Stack,
  Input,
  Button,
  Flex,
  Text,
  NativeSelect,
} from "@chakra-ui/react";

interface SoundPreferenceQuestionsProps {
  onNext: () => void;
  onBack: () => void;
}

const SoundPreferenceQuestions: React.FC<SoundPreferenceQuestionsProps> = ({
  onNext,
  onBack,
}) => {
  return (
    <Box
      maxW="800px"
      w="100%"
      mx="auto"
      bg="white"
      p={10}
      border="1px solid"
      borderColor="gray.200"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      boxShadow="md"
      display="flex"
      flexDirection="column"
      maxH="calc(100vh - 200px)"
    >
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={6} color="gray.800" _dark={{ color: 'gray.100' }}>
        Getting to know you better
      </Text>

      <Box
        flex="1"
        overflowY="auto"
        px={4}
        py={0}
        mb={6}
        bgGradient="linear(to-r, white 0%, white 98%, rgb(168, 85, 247) 100%)"
        _dark={{ bg: 'gray.700' }}
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgb(168, 85, 247)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgb(147, 51, 234)",
          },
        }}
      >
        <Stack gap={4}>
          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              What was your primary reason for coming in today?
            </Text>
            <Input
              w="100%"
              variant="outline"
              placeholder="I want to hear my grandchildren talking to me again."
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Who is attending with you today?
            </Text>
            <Input w="100%" variant="outline" placeholder="My daughter" />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              How long have you been experiencing hearing loss?
            </Text>
            <Input w="100%" variant="outline" placeholder="5 years" />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Do you have hearing loss in one or both ears?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field>
                <option value="" disabled selected></option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="both">Both</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Is there a history of hearing loss in your family?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field>
                <option value="" disabled selected>-</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>
        </Stack>
      </Box>

      <Flex justify="flex-end" gap={3}>
        <Button variant="outline" colorPalette="purple" onClick={onBack}>
          Back
        </Button>
        <Button colorPalette="purple" onClick={onNext}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default SoundPreferenceQuestions;
