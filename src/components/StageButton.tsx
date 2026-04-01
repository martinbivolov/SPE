import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

type VariantType = 'primary' | 'outline' | 'subtle' | 'disabled';

interface StageButtonProps extends ButtonProps {
  variantType?: VariantType;
}

const StageButton: React.FC<StageButtonProps> = ({
  variantType = 'primary',
  children,
  ...props
}) => {
  const baseStyles: ButtonProps = {
    px: 6,
    py: 5,
    borderRadius: 'md',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  };

  const variants: Record<VariantType, ButtonProps> = {
    primary: {
      bg: 'purple.500',
      color: 'white',
      _hover: {
        bg: 'purple.600',
        transform: 'translateY(-1px)',
        boxShadow: 'md',
      },
      _active: {
        bg: 'purple.700',
      },
    },

    outline: {
      bg: 'transparent',
      color: 'purple.500',
      border: '2px solid',
      borderColor: 'purple.400',
      _hover: {
        bg: 'purple.50',
      },
    },

    subtle: {
      bg: 'purple.100',
      color: 'purple.600',
      _hover: {
        bg: 'purple.200',
      },
    },

    disabled: {
      bg: 'purple.100',
      color: 'purple.300',
      cursor: 'not-allowed',
      _hover: {
        bg: 'purple.100',
      },
    },
  };

  return (
    <Button
      {...baseStyles}
      {...variants[variantType]}
      {...props}
      disabled={variantType === 'disabled' || props.disabled}
    >
      {children}
    </Button>
  );
};

export default StageButton;