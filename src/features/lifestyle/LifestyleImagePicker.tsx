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
  const { loading: saveLoading, error: saveError, initializeUserTagWeights, saveSelections } = useSaveImagePick();

  useEffect(() => {
    void initializeUserTagWeights(userId);
  }, [initializeUserTagWeights, userId]);

  const handleToggle = (id: string) => {
    const isSelected = selectedImages.includes(id);
    const updated = isSelected
      ? selectedImages.filter((item) => item !== id)
      : [...selectedImages, id];
    onSelectionChange(updated);
  };

  const handleNext = async () => {
    const selectedOptions = selectedImages
      .map((id) => options.find((o) => o.id === id))
      .filter((o): o is NonNullable<typeof o> => o != null);

    const ok = await saveSelections(userId, selectedOptions);
    if (ok) onNext();
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
          Could not save your picks: {saveError}
        </Text>
      )}

      <Box
        overflowY="auto"
        flex="1"
        mb={8}
        p={{ base: 4, md: 6 }}
        css={{
          '&::-webkit-scrollbar': { width: '10px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgb(168, 85, 247)', borderRadius: '999px' },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgb(147, 51, 234)' },
        }}
      >
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          {options.map((option) => {
          const selected = selectedImages.includes(option.id);

          return (
            <Box
              key={option.id}
              as="button"
              onClick={() => handleToggle(option.id)}
              position="relative"
              overflow="hidden"
              borderRadius="xl"
              border="2px solid"
              borderColor={selected ? "purple.400" : "gray.200"}
              _dark={{ borderColor: selected ? 'purple.300' : 'gray.600' }}
              bg={selected ? 'purple.50' : 'gray.50'}
              boxShadow={selected ? "md" : "sm"}
              _hover={{ boxShadow: "lg", borderColor: "purple.300" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "purple.400" }}
            >
              <Image src={option.image_url} alt={option.label ?? ''} w="100%" h={{ base: "170px", md: "200px" }} objectFit="cover" />
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
        <Button colorPalette="purple" loading={saveLoading} onClick={() => void handleNext()}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default LifestyleImagePicker;
