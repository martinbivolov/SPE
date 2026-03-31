import React from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Flex h="calc(100vh - 220px)" align="center" justify="center">
          <Box
            maxW="480px"
            w="100%"
            p={8}
            border="1px solid"
            borderColor="red.200"
            borderRadius="lg"
            bg="red.50"
            _dark={{ bg: 'gray.800', borderColor: 'red.700' }}
            textAlign="center"
          >
            <Text fontSize="lg" fontWeight="700" color="red.600" _dark={{ color: 'red.400' }} mb={2}>
              {this.props.fallbackMessage ?? 'Something went wrong'}
            </Text>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} mb={6}>
              {this.state.message}
            </Text>
            <Button colorPalette="purple" size="sm" onClick={this.handleReset}>
              Try again
            </Button>
          </Box>
        </Flex>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
