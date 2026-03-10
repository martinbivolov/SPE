import React, { useState } from "react";
import { Box } from "@chakra-ui/react";

interface DividerControlProps {
  dividerX: number;
  onDividerChange: (value: number) => void;
}

const DividerControl: React.FC<DividerControlProps> = ({ dividerX, onDividerChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const toPercent = (clientX: number, host: HTMLDivElement) => {
    const rect = host.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, next));
    onDividerChange(clamped);
  };

  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={10}
      pointerEvents="none"
    >
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={`${dividerX}%`}
        transform="translateX(-50%)"
        w="40px"
        pointerEvents="auto"
        cursor="ew-resize"
        touchAction="none"
        onPointerMove={(event) => {
          if (!isDragging) {
            return;
          }

          const host = event.currentTarget.parentElement as HTMLDivElement;
          toPercent(event.clientX, host);
        }}
        onPointerUp={(event) => {
          setIsDragging(false);

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={(event) => {
          setIsDragging(false);

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          toPercent(event.clientX, event.currentTarget.parentElement as HTMLDivElement);
        }}
      >
        <Box
          position="absolute"
          top={0}
          bottom={0}
          left="50%"
          transform="translateX(-50%)"
          w="3px"
          h="100%"
          bg="purple.500"
          _dark={{ bg: "purple.300" }}
        />

        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="24px"
          h="24px"
          borderRadius="full"
          bg="white"
          border="2px solid"
          borderColor="purple.500"
          _dark={{ bg: "gray.800", borderColor: "purple.300" }}
          boxShadow="md"
        />
      </Box>
    </Box>
  );
};

export default DividerControl;
