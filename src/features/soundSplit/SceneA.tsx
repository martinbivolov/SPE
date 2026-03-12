import React from "react";
import { Box, Image, Switch, Text } from "@chakra-ui/react";
import ClickableElement from "./ClickableElement";
import type { SceneData } from "./types";

interface SceneAProps {
  scene: SceneData;
  dividerX: number;
  isAudioEnabled: boolean;
  isInteractive?: boolean;
  isAnimating?: boolean;
  onToggleAudio: () => void;
  onHoldChange: (id: string, isHeld: boolean) => void;
  tutorialObjectId?: string;
  tutorialObjectRef?: React.RefObject<HTMLDivElement | null>;
}

const SceneA: React.FC<SceneAProps> = ({
  scene,
  dividerX,
  isAudioEnabled,
  isInteractive = true,
  isAnimating = false,
  onToggleAudio,
  onHoldChange,
  tutorialObjectId,
  tutorialObjectRef,
}) => {
  return (
    <Box position="absolute" inset={0} zIndex={0} overflow="hidden">
      <Image src={scene.backgroundImageUrl} alt={scene.name} w="100%" h="100%" objectFit="cover" />

      <Box position="absolute" top={4} left={4} zIndex={8} bg="blackAlpha.600" borderRadius="md" px={3} py={2}>
        <Text color="white" fontSize="xs" mb={1}>
          World A Audio
        </Text>
        <Switch.Root checked={isAudioEnabled} disabled={!isInteractive || isAnimating} onCheckedChange={onToggleAudio}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label color="white" fontSize="xs">
            {isAudioEnabled ? "On" : "Off"}
          </Switch.Label>
        </Switch.Root>
      </Box>

      {scene.elements.map((element) => (
        <ClickableElement
          key={element.id}
          element={element}
          sceneSide="A"
          dividerX={dividerX}
          isInteractive={isInteractive}
          onHoldChange={onHoldChange}
          elementRef={element.id === tutorialObjectId ? tutorialObjectRef : undefined}
        />
      ))}
    </Box>
  );
};

export default SceneA;
