import React, { useMemo, useState } from 'react';
import { Box, Button, Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import { useLifestyleQuestions } from '../../hooks/useLifestyleQuestions';
import { useSaveLifestyleAnswers } from '../../hooks/useSaveLifestyleAnswers';
import QuotesQuestion from './QuotesQuestion';
import type { LifestyleQuestion } from '../../types/supabase.types';

interface LifestyleSelectionSectionProps {
  onNext: () => void;
  onBack: () => void;
  userId: string;
  selectedOptionIds: string[];
  onSelectionChange: (values: string[]) => void;
}

const LifestyleSelectionSection: React.FC<LifestyleSelectionSectionProps> = ({
  onNext,
  onBack,
  userId,
  selectedOptionIds,
  onSelectionChange,
}) => {
  const { data: groups, loading, error } = useLifestyleQuestions();
  const { loading: saving, error: saveError, saveAnswers } = useSaveLifestyleAnswers();

  const [visibleQuestionCount, setVisibleQuestionCount] = useState(9);

  const questionByOption = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((group) => {
      group.lifestyle_questions?.forEach((question) => {
        question.answer_options?.forEach((option) => {
          map.set(option.id, question.id);
        });
      });
    });
    return map;
  }, [groups]);

  // Only quotes-type questions are rendered here; single/multi questions are
  // handled in the previous step (SoundPreferenceQuestions) as dropdowns.
  const quotesQuestions = useMemo(() => {
    const quotes: LifestyleQuestion[] = [];
    groups.forEach((group) => {
      (group.lifestyle_questions ?? []).forEach((q) => {
        if (q.type === 'quotes') quotes.push(q);
      });
    });
    return quotes;
  }, [groups]);

  const handleOptionToggle = (optionId: string) => {
    if (!optionId) {
      return;
    }

    const isSelected = selectedOptionIds.includes(optionId);
    const updatedSelections = isSelected
      ? selectedOptionIds.filter((item) => item !== optionId)
      : [...selectedOptionIds, optionId];

    onSelectionChange(updatedSelections);
  };

  const handleNext = async () => {
    const answers = selectedOptionIds
      .map((optionId) => ({
        questionId: questionByOption.get(optionId),
        answerOptionId: optionId,
      }))
      .filter((answer): answer is { questionId: string; answerOptionId: string } => Boolean(answer.questionId));

    const ok = await saveAnswers(userId, answers);
    if (ok) {
      onNext();
    }
  };

  if (loading) {
    return (
      <Flex direction="column" align="center" justify="center" minH="420px" gap={3}>
        <Spinner size="lg" color="purple.500" />
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          Loading lifestyle questions...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50">
        <Text color="red.600" fontWeight="600">
          Could not load lifestyle questions: {error}
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
      display="flex"
      flexDirection="column"
      minH={{ base: "auto", md: "calc(100vh - 220px)" }}
      maxH="calc(100vh - 220px)"
      overflow="hidden"
    >
      <Text
        fontSize={{ base: "xl", md: "4xl" }}
        fontWeight="700"
        textAlign="center"
        color="gray.800"
        _dark={{ color: 'gray.100' }}
        mb={{ base: 4, md: 10 }}
      >
        Everyone listens differently. Let’s understand your world.
      </Text>

      {saveError && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          Could not save selected answers: {saveError}
        </Text>
      )}

      {saving && (
        <Text mb={4} color="gray.600" _dark={{ color: 'gray.300' }} fontSize="sm">
          Saving selected answers...
        </Text>
      )}

      {/* ── Quotes questions — full-width speech-bubble grid ──────────────── */}
      {quotesQuestions.length > 0 && (
        <Box
          mb={8}
          borderRadius="md"
          p={{ base: 4, md: 7 }}
          bg="gray.100"
          _dark={{ bg: 'gray.700' }}
          overflowY="auto"
          maxH={{ base: 'auto', md: 'calc(100vh - 400px)' }}
        >
          <Stack gap={{ base: 10, md: 12 }}>
            {quotesQuestions.slice(0, visibleQuestionCount).map((question) => (
              <QuotesQuestion
                key={question.id}
                question={question}
                selectedOptionIds={selectedOptionIds}
                onToggle={handleOptionToggle}
              />
            ))}
          </Stack>

          {visibleQuestionCount < quotesQuestions.length && (
            <Flex justifyContent="center" mt={6}>
              <Button
                colorPalette="purple"
                variant="outline"
                onClick={() => setVisibleQuestionCount((prev) => Math.min(prev + 9, quotesQuestions.length))}
              >
                Show more quotes ({Math.min(quotesQuestions.length - visibleQuestionCount, 9)} remaining)
              </Button>
            </Flex>
          )}

          {visibleQuestionCount >= quotesQuestions.length && quotesQuestions.length > 9 && (
            <Flex justifyContent="center" mt={6}>
              <Button
                colorPalette="purple"
                variant="ghost"
                onClick={() => setVisibleQuestionCount(9)}
              >
                Collapse back to first 9
              </Button>
            </Flex>
          )}
        </Box>
      )}

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

export default LifestyleSelectionSection;
