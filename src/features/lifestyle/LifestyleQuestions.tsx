import React, { useState } from 'react';
import {
  Box,
  Stack,
  Input,
  Button,
  Flex,
  Text,
  NativeSelect,
} from "@chakra-ui/react";
import { useSaveBackgroundInfo } from '../../hooks/useSaveBackgroundInfo';

interface LifestyleQuestionsProps {
  onNext: () => void;
  onBack: () => void;
  userId: string;
}

const LifestyleQuestions: React.FC<LifestyleQuestionsProps> = ({
  onNext,
  onBack,
  userId,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { loading, error, saveBackgroundInfo } = useSaveBackgroundInfo();

  const setAnswer = (key: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
  };

  const handleNext = async () => {
    const ok = await saveBackgroundInfo(userId, answers);
    if (ok) {
      onNext();
    }
  };

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
        Lifestyle Exploration
      </Text>

      {error && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          Could not save background information: {error}
        </Text>
      )}

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
              Is there a history of hearing loss in your family?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={answers.family_history ?? ''} onChange={(event) => setAnswer('family_history', event.target.value)}>
                <option value="" disabled></option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
             Have you ever experienced loud noise for an extended period of time?
            </Text>
           <NativeSelect.Root>
              <NativeSelect.Field value={answers.extended_noise_exposure ?? ''} onChange={(event) => setAnswer('extended_noise_exposure', event.target.value)}>
                <option value="" disabled></option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
             If yes where:
            </Text>
           <NativeSelect.Root>
              <NativeSelect.Field value={answers.noise_exposure_where ?? ''} onChange={(event) => setAnswer('noise_exposure_where', event.target.value)}>
                <option value="" disabled></option>
                <option value="workplace">Workplace</option>
                <option value="military">Military service</option>
                <option value="music">Music or concerts</option>
                <option value="other">Other</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>


          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Please list any medications or current medical conditions for which you are currently being treated for:
            </Text>
            <Input
              w="100%"
              variant="outline"
              placeholder="e.g., Hypertension, Diabetes, etc."
              value={answers.medical_conditions ?? ''}
              onChange={(event) => setAnswer('medical_conditions', event.target.value)}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Do you currently wear hearing aids?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={answers.wearing_hearing_aids ?? ''} onChange={(event) => setAnswer('wearing_hearing_aids', event.target.value)}>
                <option value="" disabled></option>
                <option value="currently">Currently Wearing</option>
                <option value="notWearing">Not Wearing</option>
                <option value="previouslyWore">Previously Wore</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              If yes, how long have you had them?
            </Text>
            <Input
              w="100%"
              variant="outline"
              placeholder="e.g., 3 months, 1 year, etc."
              value={answers.hearing_aids_duration ?? ''}
              onChange={(event) => setAnswer('hearing_aids_duration', event.target.value)}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              If yes, describe your experience with current hearing aids 
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={answers.hearing_aid_experience ?? ''} onChange={(event) => setAnswer('hearing_aid_experience', event.target.value)}>
                <option value="" disabled></option>
                        <option value="currently">Satfisfied</option>
                        <option value="notWearing">Hate It</option>
                        <option value="previouslyWore">Meh</option>
                </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              If you use a SMART (cell) phone, what type of phone?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={answers.phone_type ?? ''} onChange={(event) => setAnswer('phone_type', event.target.value)}>
                <option value="" disabled></option>
                <option value="currently">Android</option>
                <option value="notWearing">Apple</option>
                <option value="previouslyWore">Don't know </option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

              <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              If new hearing aids are recommended, are you ready to move forward today
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={answers.ready_to_move_forward ?? ''} onChange={(event) => setAnswer('ready_to_move_forward', event.target.value)}>
                <option value="" disabled></option>
                <option value="currently">Yes</option>
                <option value="notWearing">No</option>
                <option value="previouslyWore">Not sure </option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>


        </Stack>
      </Box>

      
      <Flex justify="flex-end" gap={3}>
        <Button variant="outline" colorPalette="purple" onClick={onBack}>
          Back
        </Button>
        <Button colorPalette="purple" loading={loading} onClick={() => void handleNext()}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default LifestyleQuestions;
