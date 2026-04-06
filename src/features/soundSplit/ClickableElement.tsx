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
  20% { transform: translate(-50%, -50%) rotate(-2deg) scale(1.02); }
  40% { transform: translate(-50%, -50%) rotate(2deg) scale(1.04); }
  60% { transform: translate(-50%, -50%) rotate(-1deg) scale(1.03); }
  80% { transform: translate(-50%, -50%) rotate(1deg) scale(1.01); }
`;

const shake = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-1px, 1px) rotate(-1deg); }
  50% { transform: translate(1px, -1px) rotate(1deg); }
  75% { transform: translate(-1px, 0px) rotate(0deg); }
  100% { transform: translate(1px, 1px) rotate(1deg); }
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
    onHoldChange(element.id, true);
  };

  const stopHold = () => {
    if (!isHeld) {
      return;
    }

    setIsHeld(false);
    onHoldChange(element.id, false);
  };

  return (
    <Box
      ref={elementRef}
      position="absolute"
      left={`${element.x}%`}
      top={`${element.y}%`}
      transform="translate(-50%, -50%)"
      w={`${element.size}%`}
      h={`${element.size}%`}
      zIndex={5}
      opacity={isEnabled ? 1 : 0.35}
      cursor={isEnabled && isInteractive ? "grab" : "not-allowed"}
      pointerEvents={isEnabled && isInteractive ? "auto" : "none"}
      userSelect="none"
      touchAction="none"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      animation={
        isHeld
          ? `${shake} 0.28s linear infinite`
          : shouldWiggle
            ? `${attentionWiggle} 0.9s ease-in-out infinite`
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
