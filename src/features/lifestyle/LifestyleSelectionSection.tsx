import React, { useMemo } from 'react';
import { Box, Stack, Button, Flex, Spinner, Text, SimpleGrid } from '@chakra-ui/react';
import { useLifestyleQuestions } from '../../hooks/useLifestyleQuestions';
import { useSaveLifestyleAnswers } from '../../hooks/useSaveLifestyleAnswers';

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

  const questionByOption = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((group) => {
      group.lifestyle_questions.forEach((question) => {
        question.answer_options.forEach((option) => {
          map.set(option.id, question.id);
        });
      });
    });
    return map;
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
      display={{ base: "block", md: "flex" }}
      flexDirection={{ base: "unset", md: "column" }}
      minH={{ base: "auto", md: "calc(100vh - 220px)" }}
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

      <Box
        mb={8}
        border="none"
        borderRadius="md"
        p={{ base: 4, md: 7 }}
        bg="gray.100"
        _dark={{ bg: 'gray.700' }}
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 6, md: 6 }} alignItems={{ base: "start", md: "stretch" }}>
          {groups.map((group) => (
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
                color={{ base: "gray.600", md: "gray.400" }}
                _dark={{ color: 'gray.200' }}
                fontSize={{ base: "lg", md: "2xl" }}
                fontWeight="500"
                mb={{ base: 4, md: 6 }}
                lineHeight="1.2"
                minH={{ base: "auto", md: "76px" }}
              >
                {group.title}
              </Text>

              <Stack gap={{ base: 3, md: 3 }}>
                {group.lifestyle_questions.map((question) =>
                  question.answer_options.map((option) => {
                    const selected = selectedOptionIds.includes(option.id);

                  return (
                    <Button
                      key={option.id}
                      h="auto"
                      minH="44px"
                      py={{ base: 2.5, md: 2 }}
                      fontSize={{ base: "14px", md: "13px" }}
                      fontWeight="500"
                      whiteSpace="normal"
                      lineHeight="1.35"
                      wordBreak="break-word"
                      textAlign="center"
                      px={3}
                      borderRadius="sm"
                      border="1px solid"
                      borderColor={selected ? "green.400" : "gray.300"}
                      bg={selected ? "green.300" : "gray.200"}
                      color={selected ? "green.800" : "gray.600"}
                      _hover={{
                        bg: selected ? "green.300" : "gray.300",
                      }}
                      cursor="pointer"
                      onClick={() => handleOptionToggle(option.id)}
                    >
                      {option.label}
                    </Button>
                  );
                  })
                )}
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

export default LifestyleSelectionSection;
