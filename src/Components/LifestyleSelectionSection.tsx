import React from "react";
import { Box, Stack, Button, Flex, Text, SimpleGrid } from "@chakra-ui/react";

interface LifestyleSelectionSectionProps {
  onNext: () => void;
  onBack: () => void;
  selectedStatements: string[];
  onSelectionChange: (values: string[]) => void;
}

const LifestyleSelectionSection: React.FC<LifestyleSelectionSectionProps> = ({
  onNext,
  onBack,
  selectedStatements,
  onSelectionChange,
}) => {
  const questionGroups = [
    {
      id: "group-1",
      title: "What Applies to You",
      items: [
        "Do you experience noises (ringing, buzzing, etc.) in your ears (tinnitus)?",
        "Do you have pain or discomfort or discharge in your ears?",
        "Have you had ear surgery or other medical problems in your ears?",
        "Have you had any dizziness or difficulties with your balance in the last 90 days?",
        "Do you currently wear hearing aids?",
      ],
    },
    {
      id: "group-2",
      title: "What Applies to You",
      items: [
        "Are you withdrawing from conversations?",
        "Do you feel frustrated trying to listen?",
        "Do you avoid places because you cannot hear well?",
        "Do you ask others to repeat?",
        "Do you use apps on your Smartphone?",
      ],
    },
    {
      id: "group-3",
      title: "What Matters Most to You in a Hearing Aid",
      items: [
        "Ease of Use",
        "Follow-up Care/ Maintenance",
        "Comfort",
        "Overall Sound Quality",
        "Style and Appearance",
        "Cost",
      ],
    },
  ];

  const handleStatementToggle = (statement: string) => {
    if (!statement) {
      return;
    }

    const isSelected = selectedStatements.includes(statement);
    const updatedSelections = isSelected
      ? selectedStatements.filter((item) => item !== statement)
      : [...selectedStatements, statement];

    onSelectionChange(updatedSelections);
  };

  const isStatementSelected = (statement: string) =>
    selectedStatements.includes(statement);

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

      <Box
        mb={8}
        border="none"
        borderRadius="md"
        p={{ base: 4, md: 7 }}
        bg="gray.100"
        _dark={{ bg: 'gray.700' }}
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 6, md: 6 }} alignItems={{ base: "start", md: "stretch" }}>
          {questionGroups.map((group) => (
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
                {group.items.map((statement) => {
                  const selected = isStatementSelected(statement);
                  const isPlaceholder = !statement;

                  return (
                    <Button
                      key={statement || `${group.id}-placeholder`}
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
                        bg: isPlaceholder
                          ? "gray.200"
                          : selected
                            ? "green.300"
                            : "gray.300",
                      }}
                      disabled={isPlaceholder}
                      cursor={isPlaceholder ? "default" : "pointer"}
                      onClick={() => handleStatementToggle(statement)}
                    >
                      {statement || " "}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
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

export default LifestyleSelectionSection;
