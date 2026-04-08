import React from "react";
import { Box, Image } from "@chakra-ui/react";
import ClickableElement from "./ClickableElement";
import type { SceneData } from "./types";

interface SceneBProps {
  scene: SceneData;
  dividerX: number;
  isInteractive?: boolean;
  isAnimating?: boolean;
  animationDurationMs?: number;
  shouldWiggleObjects?: boolean;
  onHoldChange: (id: string, isHeld: boolean) => void;
}

const SceneB: React.FC<SceneBProps> = ({
  scene,
  dividerX,
  isInteractive = true,
  isAnimating = false,
  animationDurationMs = 1200,
  shouldWiggleObjects = false,
  onHoldChange,
}) => {
  console.log('[sceneB] elements received:', scene.elements);
  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={1}
      overflow="hidden"
      clipPath={`inset(0 0 0 ${dividerX}%)`}
      transition={isAnimating ? `clip-path ${animationDurationMs}ms ease-in-out` : "clip-path 0.05s linear"}
    >
      <Image src={scene.backgroundImageUrl} alt={scene.name} w="100%" h="100%" objectFit="cover" />

      {scene.elements.map((element) => (
        <ClickableElement
          key={element.id}
          element={element}
          sceneSide="B"
          dividerX={dividerX}
          isInteractive={isInteractive}
          shouldWiggle={shouldWiggleObjects}
          onHoldChange={onHoldChange}
        />
      ))}
    </Box>
  );
};

export default SceneB;
