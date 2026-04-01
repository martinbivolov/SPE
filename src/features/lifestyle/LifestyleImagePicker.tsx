import React, { useEffect } from 'react';
import { Box, Button, Flex, Image, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import { useImagePickerOptions } from '../../hooks/useImagePickerOptions';
import { useSaveImagePick } from '../../hooks/useSaveImagePick';

interface LifestyleImagePickerProps {
  onNext: () => void;
  onBack: () => void;
  userId: string;
  selectedImages: string[];
  onSelectionChange: (values: string[]) => void;
}

const LifestyleImagePicker: React.FC<LifestyleImagePickerProps> = ({
  onNext,
  onBack,
  userId,
  selectedImages,
  onSelectionChange,
}) => {
  const { data: options, loading, error } = useImagePickerOptions();
  const {
    loading: saveLoading,
    error: saveError,
    initializeUserTagWeights,
    savePick,
  } = useSaveImagePick();

  useEffect(() => {
    void initializeUserTagWeights(userId);
  }, [initializeUserTagWeights, userId]);

  const handleToggle = async (id: string) => {
    const pickedOption = options.find((option) => option.id === id);
    if (!pickedOption) {
      return;
    }

    const priorSelectedId = selectedImages[selectedImages.length - 1];
    const rejectedOption = options.find((option) => option.id === priorSelectedId);

    const isSelected = selectedImages.includes(id);
    const updated = isSelected
      ? selectedImages.filter((item) => item !== id)
      : [...selectedImages, id];

    onSelectionChange(updated);

    if (!isSelected && rejectedOption && rejectedOption.id !== pickedOption.id) {
      await savePick(
        userId,
        pickedOption.id,
        rejectedOption.id,
        pickedOption.tag_id,
        rejectedOption.tag_id,
        pickedOption.weight
      );
    }
  };

  if (loading) {
    return (
      <Flex direction="column" align="center" justify="center" minH="420px" gap={3}>
        <Spinner size="lg" color="purple.500" />
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          Loading image options...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50">
        <Text color="red.600" fontWeight="600">
          Could not load image options: {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="1280px"
      w="100%"
      mx="auto"
      bg="white"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      p={{ base: 4, md: 8 }}
      border="1px solid"
      borderColor="gray.300"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      minH="calc(100vh - 220px)"
      maxH="calc(100vh - 220px)"
      overflow="hidden"
    >
      <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="700" textAlign="center" color="gray.800" _dark={{ color: 'gray.100' }} mb={{ base: 5, md: 8 }}>
        What about your daily life?
      </Text>

      {saveError && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          Could not save your last pick: {saveError}
        </Text>
      )}

      {saveLoading && (
        <Text mb={4} color="gray.600" _dark={{ color: 'gray.300' }} fontSize="sm">
          Saving your pick...
        </Text>
      )}

      <Box overflowY="auto" flex="1" mb={8}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          {options.map((option) => {
          const selected = selectedImages.includes(option.id);

          return (
            <Box
              key={option.id}
              as="button"
              onClick={() => void handleToggle(option.id)}
              position="relative"
              overflow="hidden"
              borderRadius="md"
              border="3px solid"
              borderColor={selected ? "purple.500" : "transparent"}
              _dark={{ borderColor: selected ? 'purple.300' : 'gray.600' }}
              boxShadow={selected ? "md" : "sm"}
              _hover={{ boxShadow: "md" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "purple.400" }}
            >
              <Image src={option.image_url} alt={option.label} w="100%" h={{ base: "170px", md: "200px" }} objectFit="cover" />
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.65) 100%)"
                pointerEvents="none"
              />
              <Text
                position="absolute"
                bottom={2}
                left={3}
                right={3}
                color="white"
                fontWeight="700"
                fontSize={{ base: "md", md: "2xl" }}
                textAlign="center"
                textShadow="0 1px 2px rgba(0,0,0,0.8)"
                pointerEvents="none"
              >
                {option.label}
              </Text>
            </Box>
          );
        })}
        </SimpleGrid>
      </Box>

      <Flex justify="flex-end" gap={3} mt="auto">
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

export default LifestyleImagePicker;
