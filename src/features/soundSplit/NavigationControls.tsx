import React from "react";
import { Flex } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import StageButton from '../../components/StageButton';

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ onBack, onNext }) => {
  const { t } = useTranslation();
  return (
    <Flex justify="space-between" w="100%">
      <StageButton variantType="outline" onClick={onBack}>
        {t('common.back')}
      </StageButton>
      <StageButton variantType="primary" onClick={onNext}>
        {t('common.next')}
      </StageButton>
    </Flex>
  );
};

export default NavigationControls;
