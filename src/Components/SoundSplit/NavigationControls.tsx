import React from "react";
import { Button, Flex } from "@chakra-ui/react";

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ onBack, onNext }) => {
  return (
    <Flex justify="flex-end" gap={3}>
      <Button variant="outline" colorPalette="purple" onClick={onBack}>
        Back
      </Button>
      <Button colorPalette="purple" onClick={onNext}>
        Next
      </Button>
    </Flex>
  );
};

export default NavigationControls;
