import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  NativeSelect,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useLifestyleQuestions } from '../../hooks/useLifestyleQuestions';
import { useSaveQuizAnswers } from '../../hooks/useSaveQuizAnswers';
import type { QuizAnswerEntry } from '../../hooks/useSaveQuizAnswers';

interface SoundPreferenceQuestionsProps {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

const SoundPreferenceQuestions: React.FC<SoundPreferenceQuestionsProps> = ({
  userId,
  onNext,
  onBack,
}) => {
  const { data: groups, loading, error } = useLifestyleQuestions();
  const { loading: saving, error: saveError, saveAnswers } = useSaveQuizAnswers();

  // Map from question_id → selected answer_option_id
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Only show groups whose questions are single or multi type (not quotes).
  // Quotes questions have their own speech-bubble UI in the next step.
  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          lifestyle_questions: (group.lifestyle_questions ?? []).filter(
            (q) => q.type === 'single' || q.type === 'multi',
          ),
        }))
        .filter((g) => g.lifestyle_questions.length > 0),
    [groups],
  );

  const handleSelect = (questionId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    const entries: QuizAnswerEntry[] = [];

    for (const group of visibleGroups) {
      for (const question of group.lifestyle_questions) {
        const selected = selections[question.id];
        if (selected) {
          entries.push({
            questionId: question.id,
            questionType: question.type as 'single' | 'multi',
            answerOptionId: selected,
          });
        }
      }
    }

    const ok = await saveAnswers(userId, entries);
    if (ok) onNext();
  };

  if (loading) {
    return (
      <Flex direction="column" align="center" justify="center" minH="420px" gap={3}>
        <Spinner size="lg" color="purple.500" />
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          Loading questions...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50">
        <Text color="red.600" fontWeight="600">
          Could not load questions: {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="1280px"
      w="100%"
      mx="auto"
      bg="gray.100"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      p={{ base: 4, md: 10 }}
      border="1px solid"
      borderColor="gray.300"
      boxShadow="sm"
      display={{ base: 'block', md: 'flex' }}
      flexDirection={{ base: 'unset', md: 'column' }}
      minH={{ base: 'auto', md: 'calc(100vh - 220px)' }}
    >
      <Text
        fontSize={{ base: 'xl', md: '4xl' }}
        fontWeight="700"
        textAlign="center"
        color="gray.800"
        _dark={{ color: 'gray.100' }}
        mb={{ base: 4, md: 10 }}
      >
        Getting to know you better
      </Text>

      {saveError && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          Could not save your answers: {saveError}
        </Text>
      )}

      <Box mb={8}>
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          gap={{ base: 6, md: 6 }}
          alignItems={{ base: 'start', md: 'stretch' }}
        >
          {visibleGroups.map((group) => (
            <Box
              key={group.id}
              border="1px solid"
              borderColor="gray.200"
              _dark={{ borderColor: 'gray.600', bg: 'gray.800' }}
              borderRadius="md"
              p={{ base: 4, md: 5 }}
              bg="gray.50"
              overflow="hidden"
            >
              <Text
                textAlign="center"
                color={{ base: 'gray.600', md: 'gray.400' }}
                _dark={{ color: 'gray.200' }}
                fontSize={{ base: 'lg', md: '2xl' }}
                fontWeight="500"
                mb={{ base: 4, md: 6 }}
                lineHeight="1.2"
                minH={{ base: 'auto', md: '76px' }}
              >
                {group.title}
              </Text>

              <Stack gap={{ base: 4, md: 4 }}>
                {group.lifestyle_questions.map((question) => (
                  <Box key={question.id}>
                    <Text
                      fontSize={{ base: 'sm', md: 'sm' }}
                      fontWeight="500"
                      mb={2}
                      color="gray.700"
                      _dark={{ color: 'gray.200' }}
                    >
                      {question.text}
                    </Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={selections[question.id] ?? ''}
                        onChange={(e) => handleSelect(question.id, e.target.value)}
                        bg="white"
                        _dark={{ bg: 'gray.700' }}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {(question.answer_options ?? []).map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Flex justify="flex-end" gap={3}>
        <Button variant="outline" colorPalette="purple" onClick={onBack}>
          Back
        </Button>
        <Button colorPalette="purple" loading={saving} onClick={() => void handleNext()}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default SoundPreferenceQuestions;
