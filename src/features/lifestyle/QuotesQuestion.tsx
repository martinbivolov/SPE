import React from 'react';
import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import type { LifestyleQuestion } from '../../types/supabase.types';

interface QuotesQuestionProps {
  question: LifestyleQuestion;
  selectedOptionIds: string[];
  onToggle: (optionId: string) => void;
  hideQuestionTitle?: boolean;
}

const QuotesQuestion: React.FC<QuotesQuestionProps> = ({
  question,
  selectedOptionIds,
  onToggle,
  hideQuestionTitle = false,
}) => {
  const options = question.answer_options ?? [];

  return (
    <Box w="100%">
      {!hideQuestionTitle && (
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          fontWeight="600"
          color="gray.700"
          _dark={{ color: 'gray.200' }}
          mb={{ base: 4, md: 6 }}
          textAlign="center"
        >
          {question.text}
        </Text>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={{ base: 3, md: 4 }}>
        {options.map((option) => {
          const selected = selectedOptionIds.includes(option.id);

          return (
            <Box
              key={option.id}
              as="button"
              onClick={() => onToggle(option.id)}
              textAlign="left"
              p={{ base: 3, md: 4 }}
              borderRadius="xl"
              border="2px solid"
              borderColor={selected ? 'purple.400' : 'gray.200'}
              bg={selected ? 'purple.50' : 'gray.50'}
              _dark={{
                bg: selected ? 'purple.900' : 'gray.800',
                borderColor: selected ? 'purple.300' : 'gray.600',
              }}
              cursor="pointer"
              transition="border-color 0.15s, background 0.15s, box-shadow 0.15s"
              boxShadow={selected ? 'sm' : 'none'}
              _hover={{
                borderColor: selected ? 'purple.500' : 'purple.300',
                boxShadow: 'sm',
              }}
              _focus={{ outline: 'none', boxShadow: 'outline' }}
              // Decorative speech-bubble tail via pseudo-element is not supported
              // in Chakra v3 pseudo props on arbitrary elements; the rounded card
              // conveys the speech-bubble feel without it.
            >
              {/* Large decorative opening quote */}
              <Text
                fontSize="4xl"
                lineHeight="0.6"
                color={selected ? 'green.300' : 'purple.200'}
                _dark={{
                  color: selected ? 'green.600' : 'purple.700',
                }}
                aria-hidden
                mb={2}
                display="block"
              >
                &ldquo;
              </Text>

              <Text
                fontSize={{ base: 'sm', md: 'sm' }}
                fontStyle="italic"
                lineHeight="1.6"
                color={selected ? 'green.800' : 'gray.700'}
                _dark={{
                  color: selected ? 'green.100' : 'gray.300',
                }}
                // The label already contains the full quoted string including
                // the opening and closing " characters. Strip them so they
                // don't double up with the decorative quote above and the
                // closing mark below.
              >
                {stripOuterQuotes(option.label)}
              </Text>

              {/* Closing quote */}
              <Text
                fontSize="4xl"
                lineHeight="0.6"
                color={selected ? 'green.300' : 'purple.200'}
                _dark={{
                  color: selected ? 'green.600' : 'purple.700',
                }}
                aria-hidden
                mt={2}
                textAlign="right"
                display="block"
              >
                &rdquo;
              </Text>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

// The seed labels are stored as `"I just want things to sound like they used
// to."` (the outer " chars are part of the label string). We strip them so
// the decorative large quote marks above/below don't duplicate them.
function stripOuterQuotes(label: string): string {
  const trimmed = label.trim();
  if (trimmed.startsWith('\u201c') && trimmed.endsWith('\u201d')) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export default QuotesQuestion;
