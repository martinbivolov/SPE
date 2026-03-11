import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

type TooltipSide = "above" | "below" | "left" | "right";
type CutoutShape = "rect" | "circle";

interface StepConfig {
  id: number;
  title: string;
  description: string;
  tooltipSide: TooltipSide;
  cutoutShape: CutoutShape;
  targetRef: React.RefObject<HTMLElement | null>;
  padding?: number;
  minWidth?: number;
  minHeight?: number;
}

interface TutorialOverlayProps {
  isActive: boolean;
  step: number;
  onAdvance: () => void;
  onComplete: () => void;
  iButtonRef: React.RefObject<HTMLElement | null>;
  dividerRef: React.RefObject<HTMLElement | null>;
  toggleRef: React.RefObject<HTMLElement | null>;
  objectRef: React.RefObject<HTMLElement | null>;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOOLTIP_WIDTH = 280;
const TOOLTIP_HEIGHT = 140;
const VIEWPORT_PADDING = 16;
const GAP = 14;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isActive,
  step,
  onAdvance,
  onComplete,
  iButtonRef,
  dividerRef,
  toggleRef,
  objectRef,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [cutoutRect, setCutoutRect] = useState<Rect | null>(null);

  const steps = useMemo<StepConfig[]>(
    () => [
      {
        id: 1,
        title: "Info button",
        description: "This opens the guided tutorial. You can run it again any time.",
        tooltipSide: "above",
        cutoutShape: "circle",
        targetRef: iButtonRef,
        padding: 8,
        minWidth: 42,
        minHeight: 42,
      },
      {
        id: 2,
        title: "Divider line",
        description: "Drag this line left or right to reveal more of either world.",
        tooltipSide: "right",
        cutoutShape: "rect",
        targetRef: dividerRef,
        padding: 10,
        minWidth: 44,
      },
      {
        id: 3,
        title: "Audio toggle",
        description: "Use this switch to turn that world's audio on or off.",
        tooltipSide: "below",
        cutoutShape: "rect",
        targetRef: toggleRef,
        padding: 10,
      },
      {
        id: 4,
        title: "Interactive object",
        description: "Press and hold objects like this to play their sound. Release to stop.",
        tooltipSide: "above",
        cutoutShape: "rect",
        targetRef: objectRef,
        padding: 10,
      },
    ],
    [iButtonRef, dividerRef, toggleRef, objectRef],
  );

  const activeStep = useMemo(() => steps.find((entry) => entry.id === step) ?? null, [steps, step]);

  useEffect(() => {
    if (!isActive) {
      setIsFadingOut(false);
      setCutoutRect(null);
      return;
    }

    if (step > steps.length) {
      setIsFadingOut(true);
      return;
    }

    setIsFadingOut(false);
  }, [isActive, step, steps.length]);

  useEffect(() => {
    if (!isActive || !activeStep || isFadingOut) {
      return;
    }

    const measure = () => {
      const target = activeStep.targetRef.current;

      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const padding = activeStep.padding ?? 8;
      const width = Math.max(activeStep.minWidth ?? 0, rect.width + padding * 2);
      const height = Math.max(activeStep.minHeight ?? 0, rect.height + padding * 2);
      const centeredLeft = rect.left + rect.width / 2 - width / 2;
      const centeredTop = rect.top + rect.height / 2 - height / 2;

      setCutoutRect({
        top: centeredTop,
        left: centeredLeft,
        width,
        height,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [activeStep, isActive, isFadingOut]);

  if (!isActive) {
    return null;
  }

  const getTooltipPosition = () => {
    if (!cutoutRect) {
      return { top: VIEWPORT_PADDING, left: VIEWPORT_PADDING };
    }

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const centerX = cutoutRect.left + cutoutRect.width / 2;
    const centerY = cutoutRect.top + cutoutRect.height / 2;

    const candidates: Record<TooltipSide, { top: number; left: number }> = {
      above: {
        top: cutoutRect.top - TOOLTIP_HEIGHT - GAP,
        left: centerX - TOOLTIP_WIDTH / 2,
      },
      below: {
        top: cutoutRect.top + cutoutRect.height + GAP,
        left: centerX - TOOLTIP_WIDTH / 2,
      },
      left: {
        top: centerY - TOOLTIP_HEIGHT / 2,
        left: cutoutRect.left - TOOLTIP_WIDTH - GAP,
      },
      right: {
        top: centerY - TOOLTIP_HEIGHT / 2,
        left: cutoutRect.left + cutoutRect.width + GAP,
      },
    };

    const preferred = activeStep?.tooltipSide ?? "above";
    const sideOrder: TooltipSide[] = [preferred, "above", "below", "right", "left"];

    for (const side of sideOrder) {
      const candidate = candidates[side];
      const fitsHorizontally =
        candidate.left >= VIEWPORT_PADDING &&
        candidate.left + TOOLTIP_WIDTH <= viewportW - VIEWPORT_PADDING;
      const fitsVertically =
        candidate.top >= VIEWPORT_PADDING &&
        candidate.top + TOOLTIP_HEIGHT <= viewportH - VIEWPORT_PADDING;

      if (fitsHorizontally && fitsVertically) {
        return candidate;
      }
    }

    return {
      top: clamp(candidates[preferred].top, VIEWPORT_PADDING, viewportH - TOOLTIP_HEIGHT - VIEWPORT_PADDING),
      left: clamp(candidates[preferred].left, VIEWPORT_PADDING, viewportW - TOOLTIP_WIDTH - VIEWPORT_PADDING),
    };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={100}
      onClick={onAdvance}
      cursor="pointer"
      opacity={isFadingOut ? 0 : 1}
      transition="opacity 220ms ease"
      onTransitionEnd={() => {
        if (isFadingOut) {
          onComplete();
        }
      }}
    >
      {cutoutRect && (
        <Box
          position="fixed"
          top={`${cutoutRect.top}px`}
          left={`${cutoutRect.left}px`}
          width={`${cutoutRect.width}px`}
          height={`${cutoutRect.height}px`}
          borderRadius={activeStep?.cutoutShape === "circle" ? "9999px" : "12px"}
          boxShadow="0 0 0 9999px rgba(7, 10, 18, 0.72)"
          transition="top 180ms ease, left 180ms ease, width 180ms ease, height 180ms ease"
          pointerEvents="none"
        />
      )}

      {activeStep && (
        <Box
          position="fixed"
          top={`${tooltipPosition.top}px`}
          left={`${tooltipPosition.left}px`}
          width={`${TOOLTIP_WIDTH}px`}
          minH={`${TOOLTIP_HEIGHT}px`}
          bg="white"
          color="gray.800"
          borderRadius="lg"
          boxShadow="2xl"
          border="1px solid"
          borderColor="gray.200"
          px={4}
          py={3}
          pointerEvents="none"
        >
          <VStack align="stretch" gap={2}>
            <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.08em">
              Step {activeStep.id} of {steps.length}
            </Text>
            <Text fontSize="lg" fontWeight="700" lineHeight="1.2">
              {activeStep.title}
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="1.45">
              {activeStep.description}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Click anywhere to continue
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default TutorialOverlay;