import React from "react";
import { Box, Image } from "@chakra-ui/react";
import ClickableElement from "./ClickableElement";
import type { SceneData } from "./types";

interface SceneAProps {
  scene: SceneData;
  dividerX: number;
  isInteractive?: boolean;
  isAnimating?: boolean;
  shouldWiggleObjects?: boolean;
  onHoldChange: (id: string, isHeld: boolean) => void;
  tutorialObjectId?: string;
  tutorialObjectRef?: React.RefObject<HTMLDivElement | null>;
}

const SceneA: React.FC<SceneAProps> = ({
  scene,
  dividerX,
  isInteractive = true,
  shouldWiggleObjects = false,
  onHoldChange,
  tutorialObjectId,
  tutorialObjectRef,
}) => {
  console.log('[sceneA] elements received:', scene.elements);
  return (
    <Box position="absolute" inset={0} zIndex={0} overflow="hidden">
      <Image src={scene.backgroundImageUrl} alt={scene.name} w="100%" h="100%" objectFit="cover" />

      {scene.elements.map((element) => (
        <ClickableElement
          key={element.id}
          element={element}
          sceneSide="A"
          dividerX={dividerX}
          isInteractive={isInteractive}
          shouldWiggle={shouldWiggleObjects}
          onHoldChange={onHoldChange}
          elementRef={element.id === tutorialObjectId ? tutorialObjectRef : undefined}
        />
      ))}
    </Box>
  );
};

export default SceneA;
