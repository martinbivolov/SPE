import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Input,
  NativeSelect,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import StageButton from '../../components/StageButton';
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

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [freeTexts, setFreeTexts] = useState<Record<string, string>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          lifestyle_questions: (group.lifestyle_questions ?? []).filter(
            (q) => q.type === 'single' || q.type === 'free_text',
          ),
        }))
        .filter((g) => g.lifestyle_questions.length > 0),
    [groups],
  );

  const currentGroup = visibleGroups[currentGroupIndex];
  const isLastGroup = currentGroupIndex === visibleGroups.length - 1;

  const handleSelect = (questionId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [questionId]: value }));
  };

  // Disable follow-up questions until their parent question has a relevant answer selected
  const isFollowUpEnabled = (question: typeof currentGroup.lifestyle_questions[number]) => {
    const text = question.text.toLowerCase();
    const questions = currentGroup?.lifestyle_questions ?? [];
    const idx = questions.indexOf(question);

    if (text.includes('if yes')) {
      if (idx <= 0) return true;
      const prevQuestion = questions[idx - 1];
      const selectedOptionId = selections[prevQuestion.id];
      if (!selectedOptionId) return false;
      const selectedOption = prevQuestion.answer_options?.find((o) => o.id === selectedOptionId);
      return selectedOption?.label?.toLowerCase() === 'yes';
    }

    if (text.includes('if you wear')) {
      if (idx <= 0) return true;
      const prevQuestion = questions[idx - 1];
      const selectedOptionId = selections[prevQuestion.id];
      if (!selectedOptionId) return false;
      const selectedOption = prevQuestion.answer_options?.find((o) => o.id === selectedOptionId);
      const label = selectedOption?.label?.toLowerCase() ?? '';
      return label !== 'no' && label !== '' && !label.includes('never');
    }

    return true;
  };

  const handleNextGroup = async () => {
    if (!isLastGroup) {
      setCurrentGroupIndex((i) => i + 1);
      return;
    }

    const entries: QuizAnswerEntry[] = [];

    for (const group of visibleGroups) {
      for (const question of group.lifestyle_questions) {
        if (question.type === 'free_text') {
          const text = freeTexts[question.id]?.trim();
          const answerOptionId = question.answer_options?.[0]?.id;
          if (text && answerOptionId) {
            entries.push({ questionId: question.id, questionType: 'free_text', answerOptionId, textValue: text });
          }
        } else {
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
    }

    const ok = await saveAnswers(userId, entries);
    if (ok) onNext();
  };

  const handleBackGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((i) => i - 1);
    } else {
      onBack();
    }
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
      maxW="1120px"
      w="100%"
      mx="auto"
      bg="white"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      p={{ base: 4, md: 10 }}
      border="1px solid"
      borderColor="gray.300"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      minH={{ base: 'auto', md: 'calc(100vh - 220px)' }}
      maxH="calc(100vh - 220px)"
      overflow="hidden"
    >
      <Text
        fontSize={{ base: 'xl', md: '4xl' }}
        fontWeight="700"
        textAlign="center"
        color="gray.800"
        _dark={{ color: 'gray.100' }}
        mb={2}
      >
        Getting to know you better
      </Text>

      {currentGroup && (
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          textAlign="center"
          color="gray.500"
          _dark={{ color: 'gray.400' }}
          mb={{ base: 4, md: 8 }}
        >
          {currentGroup.title} &mdash; Step {currentGroupIndex + 1} of {visibleGroups.length}
        </Text>
      )}

      {saveError && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          Could not save your answers: {saveError}
        </Text>
      )}

      <Box
        flex="1"
        overflowY="auto"
        mb={8}
        p={{ base: 4, md: 6 }}
        css={{
          '&::-webkit-scrollbar': { width: '10px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgb(168, 85, 247)', borderRadius: '999px' },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgb(147, 51, 234)' },
        }}
      >
        {currentGroup && (
          <Stack gap={{ base: 5, md: 6 }}>
            {currentGroup.lifestyle_questions.map((question) => {
              const enabled = isFollowUpEnabled(question);
              return (
              <Box key={question.id} opacity={enabled ? 1 : 0.4} pointerEvents={enabled ? 'auto' : 'none'}>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="500"
                  mb={2}
                  color="gray.700"
                  _dark={{ color: 'gray.200' }}
                >
                  {question.text}
                </Text>
                {question.type === 'free_text' ? (
                  <Input
                    placeholder="Type your answer..."
                    value={freeTexts[question.id] ?? ''}
                    onChange={(e) =>
                      setFreeTexts((prev) => ({ ...prev, [question.id]: e.target.value }))
                    }
                    bg="white"
                    _dark={{ bg: 'gray.700' }}
                    disabled={!enabled}
                  />
                ) : (
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
                )}
              </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Flex justify="flex-end" gap={3}>
        <StageButton variantType="outline" onClick={handleBackGroup}>
          Back
        </StageButton>
        <StageButton variantType="primary" loading={saving} onClick={() => void handleNextGroup()}>
          Next
        </StageButton>
      </Flex>
    </Box>
  );
};

export default SoundPreferenceQuestions;
