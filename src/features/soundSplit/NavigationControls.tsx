import React from "react";
import { Flex } from "@chakra-ui/react";
import StageButton from '../../components/StageButton';

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ onBack, onNext }) => {
  return (
    <Flex justify="space-between" w="100%">
      <StageButton variantType="outline" onClick={onBack}>
        Back
      </StageButton>
      <StageButton variantType="primary" onClick={onNext}>
        Next
      </StageButton>
    </Flex>
  );
};

export default NavigationControls;
