import React from "react";
import {
  Box,
  Stack,
  Input,
  Flex,
  Text,
  NativeSelect,
} from "@chakra-ui/react";
import StageButton from '../../components/StageButton';

interface ProfileFormProps {
  onNext?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onNext }) => {
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
    >
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={6} color="gray.800" _dark={{ color: 'gray.100' }}>
        Profile
      </Text>

      <Stack gap={4}>
        <Box>
          <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
            Name
          </Text>
          <Input w="100%" variant="outline" placeholder="Steven Blank" />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
            Age
          </Text>
          <Input
            w="100%"
            variant="outline"
            type="number"
            placeholder="65"
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
            Email
          </Text>
          <Input
            w="100%"
            variant="outline"
            type="email"
            placeholder="steven@example.com"
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
            Are you a first time user?
          </Text>

          <NativeSelect.Root>
            <NativeSelect.Field placeholder="Select option">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
            Preferred language
          </Text>

          <NativeSelect.Root>
            <NativeSelect.Field placeholder="Select language">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Box>
      </Stack>

      <Flex justify="flex-end" mt={6} gap={3}>
        <StageButton variantType="outline">
          Back
        </StageButton>
        <StageButton variantType="primary" onClick={onNext}>
          Next
        </StageButton>
      </Flex>
    </Box>
  );
};

export default ProfileForm;