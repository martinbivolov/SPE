// import React from 'react';
// import { Box, Flex, Text, Icon } from '@chakra-ui/react';
// import { FiInfo } from 'react-icons/fi';
// import StageButton from './StageButton';

// interface SoundTutorialProps {
//   onNext: () => void;
//   onBack: () => void;
// }

// const SoundTutorial: React.FC<SoundTutorialProps> = ({ onNext, onBack }) => {
//   return (
//     <Box
//       maxW="1120px"
//       w="100%"
//       mx="auto"
//       bg="white"
//       _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
//       p={{ base: 6, md: 10 }}
//       border="1px solid"
//       borderColor="gray.300"
//       boxShadow="lg"
//       display="flex"
//       flexDirection="column"
//       alignItems="center"
//       justifyContent="center"
//       minH="calc(100vh - 220px)"
//       maxH="calc(100vh - 220px)"
//       overflow="hidden"
//     >
//       <Flex
//         direction="column"
//         align="center"
//         textAlign="center"
//         gap={6}
//         maxW="640px"
//       >
//         {/* Icon */}
//         <Flex
//           align="center"
//           justify="center"
//           w={20}
//           h={20}
//           borderRadius="full"
//           bg="purple.100"
//           _dark={{ bg: 'purple.900' }}
//         >
//           <Icon
//             as={FiInfo}
//             boxSize={10}
//             color="purple.500"
//             _dark={{ color: 'purple.300' }}
//           />
//         </Flex>

//         {/* Title */}
//         <Text
//           fontSize={{ base: '2xl', md: '4xl' }}
//           fontWeight="800"
//           color="gray.800"
//           _dark={{ color: 'gray.100' }}
//           lineHeight="1.2"
//         >
//           How It Works
//         </Text>

//         {/* Placeholder description */}
//         <Text
//           fontSize={{ base: 'md', md: 'lg' }}
//           color="gray.500"
//           _dark={{ color: 'gray.400' }}
//           lineHeight="1.7"
//         >
//           Tutorial content coming soon. This is where we'll walk you through
//           the listening experience step by step before the story begins.
//         </Text>
//       </Flex>

//       {/* Navigation */}
//       <Flex justify="space-between" w="100%" mt="auto" pt={8}>
//         <StageButton variantType="outline" onClick={onBack}>
//           Back
//         </StageButton>
//         <StageButton variantType="primary" onClick={onNext}>
//           Next
//         </StageButton>
//       </Flex>
//     </Box>
//   );
// };

// export default SoundTutorial;

import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Splitter, Text } from '@chakra-ui/react';
import StageButton from './StageButton';

interface SoundTutorialProps {
  onNext: () => void;
  onBack: () => void;
}

const tutorialSteps = [
  "You’re about to move through a series of everyday moments…\nlike passing through parts of your day.",
  "As you listen, the sounds may begin to shift.",
  "Notice how the environment feels—\nhow sounds stand out, how they blend,\nand how the space is perceived.",
  "After each moment, you can explore the sounds more closely.\nThis isn’t about understanding speech,\nbut about how the sounds feel to you. Choose\nthe version that best reflects how your world sounds.",
];

const SoundTutorial: React.FC<SoundTutorialProps> = ({ onNext, onBack }) => {
  const [phase, setPhase] = useState<'intro' | 'tutorial'>('intro');
  const [step, setStep] = useState(0);
  const [sizes, setSizes] = useState<[number, number]>([50, 50]);
  const [animateCircles, setAnimateCircles] = useState(false);

  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const isLastStep = step === tutorialSteps.length - 1;

  useEffect(() => {
    if (phase !== 'tutorial') return;

    setAnimateCircles(false);

    if (animationRef.current) {
      window.clearInterval(animationRef.current);
      animationRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (step === 0) {
      setSizes([50, 50]);
      return;
    }

    // Step 2 text:
    // start from middle -> go right -> pause -> go left -> pause -> back to middle
    if (step === 1) {
      setSizes([50, 50]);

      const RIGHT_TARGET = 82;
      const LEFT_TARGET = 18;
      const CENTER_TARGET = 50;
      const STEP_SIZE = 1;
      const TICK_MS = 45;
      const PAUSE_MS = 450;

      const startMove = (direction: 'right' | 'left' | 'center') => {
        animationRef.current = window.setInterval(() => {
          setSizes((prev) => {
            const left = prev[0];

            if (direction === 'right') {
              if (left >= RIGHT_TARGET) {
                if (animationRef.current) {
                  window.clearInterval(animationRef.current);
                  animationRef.current = null;
                }
                timeoutRef.current = window.setTimeout(() => {
                  startMove('left');
                }, PAUSE_MS);
                return [RIGHT_TARGET, 100 - RIGHT_TARGET];
              }

              const nextLeft = Math.min(left + STEP_SIZE, RIGHT_TARGET);
              return [nextLeft, 100 - nextLeft];
            }

            if (direction === 'left') {
              if (left <= LEFT_TARGET) {
                if (animationRef.current) {
                  window.clearInterval(animationRef.current);
                  animationRef.current = null;
                }
                timeoutRef.current = window.setTimeout(() => {
                  startMove('center');
                }, PAUSE_MS);
                return [LEFT_TARGET, 100 - LEFT_TARGET];
              }

              const nextLeft = Math.max(left - STEP_SIZE, LEFT_TARGET);
              return [nextLeft, 100 - nextLeft];
            }

            // center
            if (left >= CENTER_TARGET) {
              const nextLeft = Math.max(left - STEP_SIZE, CENTER_TARGET);
              if (nextLeft === CENTER_TARGET && animationRef.current) {
                window.clearInterval(animationRef.current);
                animationRef.current = null;
              }
              return [nextLeft, 100 - nextLeft];
            } else {
              const nextLeft = Math.min(left + STEP_SIZE, CENTER_TARGET);
              if (nextLeft === CENTER_TARGET && animationRef.current) {
                window.clearInterval(animationRef.current);
                animationRef.current = null;
              }
              return [nextLeft, 100 - nextLeft];
            }
          });
        }, TICK_MS);
      };

      timeoutRef.current = window.setTimeout(() => {
        startMove('right');
      }, 120);

      return () => {
        if (animationRef.current) {
          window.clearInterval(animationRef.current);
          animationRef.current = null;
        }
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    if (step >= 2) {
      setAnimateCircles(true);
      setSizes([50, 50]);
    }

    return () => {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
        animationRef.current = null;
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [phase, step]);

  return (
    <Box
      maxW="1120px"
      w="100%"
      mx="auto"
      bg="white"
      p={8}
      border="1px solid #ddd"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      minH="calc(100vh - 220px)"
      position="relative"
      overflow="hidden"
    >
      {phase === 'intro' && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          flex="1"
          textAlign="center"
        >
          <Box
            w="88px"
            h="88px"
            borderRadius="50%"
            bg="#efe2ff"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={6}
          >
            <Text fontSize="42px" color="#9b4dff" fontWeight="700">
              i
            </Text>
          </Box>

          <Text fontSize="42px" fontWeight="800" mb={4} color="#222">
            How It Works
          </Text>

          <Text color="#777" maxW="640px" fontSize="18px" lineHeight="1.8">
            This is where we’ll walk you through the listening experience step by step before the story begins.
          </Text>
        </Flex>
      )}

      {phase === 'tutorial' && step < tutorialSteps.length && (
        <>
          <Splitter.Root
            panels={[
              { id: 'left', minSize: 8 },
              { id: 'right', minSize: 8 },
            ]}
            size={sizes}
            onResize={(details) => {
              if (step === 3) {
                const next = details.size as number[];
                if (next.length >= 2) {
                  setSizes([next[0], next[1]]);
                }
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
            }}
          >
            <Splitter.Panel
              id="left"
              style={{
                background: '#f6f0ff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {animateCircles && (
                <>
                  {[
                    { top: '74%', left: '16%' },
                    { top: '52%', left: '62%' },
                  ].map((pos, i) => (
                    <Box
                      key={`left-${i}`}
                      style={{
                        position: 'absolute',
                        top: pos.top,
                        left: pos.left,
                        width: 84,
                        height: 84,
                        borderRadius: '50%',
                        border: '3px solid #6e1cff',
                        animation: 'pulse 2.2s infinite ease-out',
                        opacity: 0.75,
                      }}
                    />
                  ))}
                </>
              )}
            </Splitter.Panel>

            <Splitter.ResizeTrigger id="left:right" disabled={step !== 3}>
              <Splitter.ResizeTriggerSeparator />
              <Splitter.ResizeTriggerIndicator />
            </Splitter.ResizeTrigger>

            <Splitter.Panel
              id="right"
              style={{
                background: '#d9d9d9',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {animateCircles && (
                <>
                  {[
                    { top: '28%', left: '28%' },
                    { top: '72%', left: '64%' },
                  ].map((pos, i) => (
                    <Box
                      key={`right-${i}`}
                      style={{
                        position: 'absolute',
                        top: pos.top,
                        left: pos.left,
                        width: 84,
                        height: 84,
                        borderRadius: '50%',
                        border: '3px solid #6e1cff',
                        animation: 'pulse 2.2s infinite ease-out',
                        opacity: 0.75,
                      }}
                    />
                  ))}
                </>
              )}
            </Splitter.Panel>
          </Splitter.Root>

          <Box
            style={{
              position: 'absolute',
              top: 32,
              left: 32,
              width: 520,
              maxWidth: 'calc(100% - 64px)',
              background: '#d8d8d8',
              borderRadius: 14,
              padding: 20,
              zIndex: 10,
            }}
          >
            <Box
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: '#b8d4e3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Text fontWeight="700" fontSize="28px" color="#3f4b57">
                i
              </Text>
            </Box>

            <Text
              style={{
                color: '#555',
                fontSize: 18,
                lineHeight: 1.45,
                whiteSpace: 'pre-line',
              }}
            >
              {tutorialSteps[step]}
            </Text>

            <Box mt={4}>
              <StageButton
                variantType="subtle"
                onClick={() => {
                  if (!isLastStep) {
                    setStep((prev) => prev + 1);
                  }
                }}
              >
                ok
              </StageButton>
            </Box>
          </Box>

          <style>
            {`
              @keyframes pulse {
                0% {
                  transform: scale(0.65);
                  opacity: 0.75;
                }
                100% {
                  transform: scale(2.25);
                  opacity: 0;
                }
              }
            `}
          </style>
        </>
      )}

      <Flex justify="space-between" mt="auto" zIndex={20}>
        <StageButton
          variantType="outline"
          onClick={
            phase === 'tutorial' && step > 0
              ? () => setStep((prev) => prev - 1)
              : onBack
          }
        >
          Back
        </StageButton>

        {phase === 'intro' ? (
          <StageButton
            variantType="primary"
            onClick={() => {
              setPhase('tutorial');
              setStep(0);
              setSizes([50, 50]);
            }}
          >
            Next
          </StageButton>
        ) : (
          <StageButton
            variantType={isLastStep ? 'primary' : 'disabled'}
            onClick={isLastStep ? onNext : undefined}
          >
            Next
          </StageButton>
        )}
      </Flex>
    </Box>
  );
};

export default SoundTutorial;