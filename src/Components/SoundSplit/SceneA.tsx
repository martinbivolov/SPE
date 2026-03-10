import React from "react";
import { Box, Image, Switch, Text } from "@chakra-ui/react";
import ClickableElement from "./ClickableElement";
import type { SceneData } from "./types";

interface SceneAProps {
  scene: SceneData;
  dividerX: number;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onHoldChange: (id: string, isHeld: boolean) => void;
}

const SceneA: React.FC<SceneAProps> = ({
  scene,
  dividerX,
  isAudioEnabled,
  onToggleAudio,
  onHoldChange,
}) => {
  return (
    <Box position="absolute" inset={0} zIndex={0} overflow="hidden">
      <Image src={scene.backgroundImageUrl} alt={scene.name} w="100%" h="100%" objectFit="cover" />

      <Box position="absolute" top={4} left={4} zIndex={8} bg="blackAlpha.600" borderRadius="md" px={3} py={2}>
        <Text color="white" fontSize="xs" mb={1}>
          World A Audio
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
          sceneSide="A"
          dividerX={dividerX}
          onHoldChange={onHoldChange}
        />
      ))}
    </Box>
  );
};

export default SceneA;
