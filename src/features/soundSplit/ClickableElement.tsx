import React, { useMemo, useState } from "react";
import { Box, Image } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import type { SceneElement, SceneSide } from "./types";

interface ClickableElementProps {
  element: SceneElement;
  sceneSide: SceneSide;
  dividerX: number;
  isInteractive?: boolean;
  shouldWiggle?: boolean;
  onHoldChange: (id: string, isHeld: boolean) => void;
  elementRef?: React.RefObject<HTMLDivElement | null>;
}

const attentionWiggle = keyframes`
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
  25% { transform: translate(-50%, -50%) rotate(-1deg) scale(1.04); }
  75% { transform: translate(-50%, -50%) rotate(1deg) scale(1.04); }
`;

const shake = keyframes`
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  20% { transform: translate(-51%, -49%) rotate(-0.5deg); }
  40% { transform: translate(-49%, -51%) rotate(0.5deg); }
  60% { transform: translate(-51%, -50%) rotate(-0.5deg); }
  80% { transform: translate(-49%, -50%) rotate(0.5deg); }
`;

const glowPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 3px rgba(167, 139, 250, 0)); }
  50% { filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.8)); }
`;

const ClickableElement: React.FC<ClickableElementProps> = ({
  element,
  sceneSide,
  dividerX,
  isInteractive = true,
  shouldWiggle = false,
  onHoldChange,
  elementRef,
}) => {
  const [isHeld, setIsHeld] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isEnabled = useMemo(() => {
    if (sceneSide === "A") {
      return element.x <= dividerX;
    }

    return element.x >= dividerX;
  }, [sceneSide, element.x, dividerX]);

  const startHold = () => {
    if (!isEnabled || !isInteractive) {
      return;
    }

    setIsHeld(true);
    setIsPressed(true);
    onHoldChange(element.id, true);
  };

  const stopHold = () => {
    if (!isHeld) {
      return;
    }

    setIsHeld(false);
    setIsPressed(false);
    onHoldChange(element.id, false);
  };

  return (
    <Box
      ref={elementRef}
      position="absolute"
      left={`${element.x}%`}
      top={`${element.y}%`}
      transform={`translate(-50%, -50%) scale(${isPressed ? 0.92 : 1})`}
      w={`${element.size}%`}
      h={`${element.size}%`}
      zIndex={5}
      opacity={isEnabled ? 1 : 0.35}
      cursor={isEnabled && isInteractive ? "grab" : "not-allowed"}
      pointerEvents={isEnabled && isInteractive ? "auto" : "none"}
      userSelect="none"
      touchAction="none"
      transition="transform 0.15s ease, filter 0.15s ease"
      filter={isHeld ? "drop-shadow(0 0 6px rgba(167, 139, 250, 1))" : undefined}
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      animation={
        isHeld
          ? `${shake} 0.28s linear infinite`
          : shouldWiggle
            ? `${attentionWiggle} 1.4s ease-in-out infinite`
            : isEnabled && isInteractive
              ? `${glowPulse} 2s ease-in-out infinite`
              : "none"
      }
    >
      <Image
        src={element.imageUrl}
        alt={element.label}
        w="100%"
        h="100%"
        objectFit="contain"
        draggable={false}
        pointerEvents="none"
        filter={isEnabled ? "none" : "grayscale(1)"}
      />
    </Box>
  );
};

export default ClickableElement;
