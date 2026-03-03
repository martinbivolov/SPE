import React from "react";
import { Box, Button, Flex, Image, SimpleGrid, Text } from "@chakra-ui/react";

interface LifestyleImagePickerProps {
  onNext: () => void;
  onBack: () => void;
  selectedImages: string[];
  onSelectionChange: (values: string[]) => void;
}

const LifestyleImagePicker: React.FC<LifestyleImagePickerProps> = ({
  onNext,
  onBack,
  selectedImages,
  onSelectionChange,
}) => {
  const imageOptions = [
    { id: "one-on-one", label: "At Home Daily Sounds", src: "/PickYourStyle/AtHomeDailySounds.png" },
    { id: "small-group", label: "Public Space Shopping", src: "/PickYourStyle/PublicSpacesShopping.png" },
    { id: "large-group", label: "Outdoor Nature", src: "/PickYourStyle/OutdoorNature.png" },
    { id: "restaurants", label: "In The Car", src: "/PickYourStyle/InTheCar.png" },
    { id: "workplace", label: "Phone Call", src: "/PickYourStyle/PhoneCall.png" },
    { id: "music", label: "Listening To Music", src: "/PickYourStyle/MusicListening.png" },
  ];

  const handleToggle = (id: string) => {
    const isSelected = selectedImages.includes(id);
    const updated = isSelected
      ? selectedImages.filter((item) => item !== id)
      : [...selectedImages, id];

    onSelectionChange(updated);
  };

  return (
    <Box
      maxW="1280px"
      w="100%"
      mx="auto"
      bg="gray.100"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      p={{ base: 4, md: 8 }}
      border="1px solid"
      borderColor="gray.300"
      boxShadow="sm"
      display="flex"
      flexDirection="column"
      minH="calc(100vh - 220px)"
    >
      <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="700" textAlign="center" color="gray.800" _dark={{ color: 'gray.100' }} mb={{ base: 5, md: 8 }}>
        What about your daily life?
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4} mb={8}>
        {imageOptions.map((option) => {
          const selected = selectedImages.includes(option.id);

          return (
            <Box
              key={option.id}
              as="button"
              onClick={() => handleToggle(option.id)}
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
              <Image src={option.src} alt={option.label} w="100%" h={{ base: "170px", md: "200px" }} objectFit="cover" />
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
