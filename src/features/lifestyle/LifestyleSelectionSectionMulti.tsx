import React, { useMemo, useState } from 'react';
import { Box, Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import StageButton from '../../components/StageButton';
import { useLifestyleQuestions } from '../../hooks/useLifestyleQuestions';
import { useSaveLifestyleAnswers } from '../../hooks/useSaveLifestyleAnswers';
import QuotesQuestion from './QuotesQuestion';

interface LifestyleSelectionSectionMultiProps {
  onNext: () => void;
  onBack: () => void;
  userId: string;
  selectedOptionIds: string[];
  onSelectionChange: (values: string[]) => void;
}

const LifestyleSelectionSectionMulti: React.FC<LifestyleSelectionSectionMultiProps> = ({
  onNext,
  onBack,
  userId,
  selectedOptionIds,
  onSelectionChange,
}) => {
  const { data: groups, loading, error } = useLifestyleQuestions();
  const { loading: saving, error: saveError, saveAnswers } = useSaveLifestyleAnswers();

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

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

  // Groups that contain at least one multi-type question
  const multiGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          lifestyle_questions: (group.lifestyle_questions ?? []).filter(
            (q) => q.type === 'multi',
          ),
        }))
        .filter((g) => g.lifestyle_questions.length > 0),
    [groups],
  );

  const currentGroup = multiGroups[currentGroupIndex];
  const isLastGroup = currentGroupIndex === multiGroups.length - 1;

  const handleOptionToggle = (optionId: string) => {
    if (!optionId) return;
    const isSelected = selectedOptionIds.includes(optionId);
    const updatedSelections = isSelected
      ? selectedOptionIds.filter((item) => item !== optionId)
      : [...selectedOptionIds, optionId];
    onSelectionChange(updatedSelections);
  };

  const handleNextGroup = async () => {
    if (!isLastGroup) {
      setCurrentGroupIndex((i) => i + 1);
      return;
    }

    const answers = selectedOptionIds
      .map((optionId) => ({
        questionId: questionByOption.get(optionId),
        answerOptionId: optionId,
      }))
      .filter((a): a is { questionId: string; answerOptionId: string } => Boolean(a.questionId));

    const ok = await saveAnswers(userId, answers);
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
        Everyone listens differently. Let's understand your world.
      </Text>

      {currentGroup && (
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          textAlign="center"
          color="gray.500"
          _dark={{ color: 'gray.400' }}
          mb={4}
        >
          {currentGroup.title} &mdash; Step {currentGroupIndex + 1} of {multiGroups.length}
        </Text>
      )}

      {saveError && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          Could not save selected answers: {saveError}
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
          <Stack gap={{ base: 10, md: 12 }}>
            {currentGroup.lifestyle_questions.map((question) => (
              <QuotesQuestion
                key={question.id}
                question={question}
                selectedOptionIds={selectedOptionIds}
                onToggle={handleOptionToggle}
                hideQuestionTitle
              />
            ))}
          </Stack>
        )}
      </Box>

      <Flex justify="flex-end" gap={3}>
        <StageButton variantType="outline" onClick={handleBackGroup}>
          Back
        </StageButton>
        <StageButton
          variantType="primary"
          loading={saving}
          onClick={() => void handleNextGroup()}
        >
          Next
        </StageButton>
      </Flex>
    </Box>
  );
};

export default LifestyleSelectionSectionMulti;
