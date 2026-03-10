import React from "react";
import { Box, Image, Switch, Text } from "@chakra-ui/react";
import ClickableElement from "./ClickableElement";
import type { SceneData } from "./types";

interface SceneBProps {
  scene: SceneData;
  dividerX: number;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  showOverlay?: boolean;
  onHoldChange: (id: string, isHeld: boolean) => void;
}

const SceneB: React.FC<SceneBProps> = ({
  scene,
  dividerX,
  isAudioEnabled,
  onToggleAudio,
  showOverlay = true,
  onHoldChange,
}) => {
  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={1}
      overflow="hidden"
      clipPath={`inset(0 0 0 ${dividerX}%)`}
      transition="clip-path 0.05s linear"
    >
      <Image src={scene.backgroundImageUrl} alt={scene.name} w="100%" h="100%" objectFit="cover" />

      {showOverlay && <Box position="absolute" inset={0} zIndex={2} bg="rgba(0, 0, 0, 0.45)" pointerEvents="none" />}

      <Box position="absolute" top={4} right={4} zIndex={8} bg="blackAlpha.600" borderRadius="md" px={3} py={2}>
        <Text color="white" fontSize="xs" mb={1}>
          World B Audio
        </Text>
        <Switch.Root checked={isAudioEnabled} onCheckedChange={onToggleAudio}>
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
          sceneSide="B"
          dividerX={dividerX}
          onHoldChange={onHoldChange}
        />
      ))}
    </Box>
  );
};

export default SceneB;
