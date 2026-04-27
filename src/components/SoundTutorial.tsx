import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Splitter, Text } from '@chakra-ui/react';
import { FiMusic } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import StageButton from './StageButton';

interface SoundTutorialProps {
  onNext: () => void;
  onBack: () => void;
}

const MusicBubble: React.FC<{
  style?: React.CSSProperties;
  highlighted?: boolean;
}> = ({ style, highlighted }) => (
  <Box style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    {[84, 60, 40].map((size, i) => (
      <Box key={i} style={{
        position: 'absolute', width: size, height: size,
        borderRadius: '50%',
        border: highlighted ? '2.5px solid #7c3aed' : '2px solid #6e1cff',
        animation: `pulse 2.2s infinite ease-out ${i * 0.4}s`,
        opacity: highlighted ? 0.9 : 0.4,
        transition: 'opacity 0.4s ease, border-color 0.4s ease',
      }} />
    ))}
    <Box style={{
      width: 36, height: 36, borderRadius: '50%',
      background: highlighted ? '#7c3aed' : '#ede9fe',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
      boxShadow: highlighted
        ? '0 0 0 4px rgba(124,58,237,0.3), 0 2px 8px rgba(110,28,255,0.4)'
        : '0 2px 8px rgba(110, 28, 255, 0.25)',
      transition: 'background 0.4s ease, box-shadow 0.4s ease',
    }}>
      <FiMusic size={18} color={highlighted ? 'white' : '#6e1cff'} />
    </Box>
  </Box>
);

const SoundTutorial: React.FC<SoundTutorialProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const stepTitles = [
    t('sound.tutorial.step1Title'),
    t('sound.tutorial.step2Title'),
    t('sound.tutorial.step3Title'),
    t('sound.tutorial.step4Title'),
  ];
  const tutorialSteps = [
    t('sound.tutorial.step1'),
    t('sound.tutorial.step2'),
    t('sound.tutorial.step3'),
    t('sound.tutorial.step4'),
  ];
  const [phase, setPhase] = useState<'intro' | 'journey' | 'tutorial'>('tutorial');
  const [journeyStep, setJourneyStep] = useState(-1);
  const [step, setStep] = useState(0);
  const [sizes, setSizes] = useState<[number, number]>([50, 50]);
  const [animateCircles, setAnimateCircles] = useState(false);

  const [cardVisible, setCardVisible] = useState(true);
  const [highlightSide, setHighlightSide] = useState<'left' | 'right' | null>(null);
  const [highlightBubble, setHighlightBubble] = useState<0 | 1 | null>(null);

  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const animationCompleteRef = useRef(false);
  const journeyTimeoutsRef = useRef<number[]>([]);

  const isLastStep = step === tutorialSteps.length - 1;

  useEffect(() => {
    if (phase !== 'tutorial') return;

    setAnimateCircles(false);
    setHighlightSide(null);
    setHighlightBubble(null);
    setJourneyStep(-1);

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
      timeoutRef.current = window.setTimeout(() => {
        setJourneyStep(0);
        timeoutRef.current = window.setTimeout(() => {
          setJourneyStep(1);
          timeoutRef.current = window.setTimeout(() => {
            setJourneyStep(2);
            timeoutRef.current = window.setTimeout(() => {
              setJourneyStep(3);
            }, 500);
          }, 500);
        }, 500);
      }, 400);
      return;
    }

    if (step === 1) {
      setSizes([50, 50]);
      animationCompleteRef.current = false;

      const TICK_MS = 30;
      const STEP_SIZE = 0.5;
      const PAUSE_MS = 2000;
      const RIGHT_TARGET = 85;
      const LEFT_TARGET = 15;
      const CENTER_TARGET = 50;

      const startMove = (
        direction: 'right' | 'left' | 'center',
        onComplete?: () => void,
      ) => {
        if (animationRef.current) {
          window.clearInterval(animationRef.current);
        }
        animationRef.current = window.setInterval(() => {
          setSizes((prev) => {
            const left = prev[0];
            if (direction === 'right') {
              if (left >= RIGHT_TARGET) {
                window.clearInterval(animationRef.current!);
                onComplete?.();
                return [RIGHT_TARGET, 100 - RIGHT_TARGET];
              }
              const next = Math.min(left + STEP_SIZE, RIGHT_TARGET);
              return [next, 100 - next];
            }
            if (direction === 'left') {
              if (left <= LEFT_TARGET) {
                window.clearInterval(animationRef.current!);
                onComplete?.();
                return [LEFT_TARGET, 100 - LEFT_TARGET];
              }
              const next = Math.max(left - STEP_SIZE, LEFT_TARGET);
              return [next, 100 - next];
            }
            // center
            const dist = Math.abs(left - CENTER_TARGET);
            if (dist <= STEP_SIZE) {
              window.clearInterval(animationRef.current!);
              animationCompleteRef.current = true;
              onComplete?.();
              setTimeout(() => setSizes([50, 50]), 0);
              return [CENTER_TARGET, CENTER_TARGET];
            }
            const next = left > CENTER_TARGET ? left - STEP_SIZE : left + STEP_SIZE;
            return [next, 100 - next];
          });
        }, TICK_MS);
      };

      timeoutRef.current = window.setTimeout(() => {
        startMove('right', () => {
          setHighlightSide('right');
          timeoutRef.current = window.setTimeout(() => {
            setHighlightSide(null);
            startMove('left', () => {
              setHighlightSide('left');
              timeoutRef.current = window.setTimeout(() => {
                setHighlightSide(null);
                startMove('center');
              }, PAUSE_MS);
            });
          }, PAUSE_MS);
        });
      }, 500);

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

    if (step === 2) {
      setAnimateCircles(true);
      setSizes([50, 50]);
      setHighlightBubble(0);
    }

    if (step === 3) {
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

  useEffect(() => {
    if (phase !== 'tutorial') return;
    setCardVisible(false);
    const id = window.setTimeout(() => setCardVisible(true), 150);
    return () => window.clearTimeout(id);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'journey') return;
    setJourneyStep(-1);
    journeyTimeoutsRef.current.forEach(window.clearTimeout);
    journeyTimeoutsRef.current = [
      window.setTimeout(() => setJourneyStep(0), 400),
      window.setTimeout(() => setJourneyStep(1), 900),
      window.setTimeout(() => setJourneyStep(2), 1400),
      window.setTimeout(() => setJourneyStep(3), 1900),
      window.setTimeout(() => { setPhase('tutorial'); setStep(0); }, 3200),
    ];
    return () => {
      journeyTimeoutsRef.current.forEach(window.clearTimeout);
      journeyTimeoutsRef.current = [];
    };
  }, [phase]);

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
      {phase === "journey" && (
        <Flex direction="column" align="center" justify="center" flex="1">
          <Flex align="center">
            {stepTitles.map((_, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <Box style={{
                    width: 60, height: 2,
                    background: i <= journeyStep ? '#7c3aed' : '#e5e7eb',
                    transition: 'background 0.3s ease',
                  }} />
                )}
                <Box style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: i <= journeyStep ? '#7c3aed' : 'white',
                  border: `2px solid ${i <= journeyStep ? '#7c3aed' : '#e5e7eb'}`,
                  boxShadow: i <= journeyStep ? '0 0 0 4px rgba(124,58,237,0.2)' : 'none',
                  transform: i === journeyStep ? 'scale(1.3)' : 'scale(1)',
                  transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                }} />
              </React.Fragment>
            ))}
          </Flex>
        </Flex>
      )}

      {phase === 'tutorial' && step < tutorialSteps.length && (
        <>
          {/* Journey dots — step 0 only */}
          {step === 0 && (
            <Box
              position="absolute"
              inset={0}
              zIndex={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{ pointerEvents: 'none' }}
            >
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                {stepTitles.map((_, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <Box style={{
                        width: 90, height: 2,
                        background: i <= journeyStep ? '#7c3aed' : '#e5e7eb',
                        transition: 'background 0.3s ease',
                      }} />
                    )}
                    <Box style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: i <= journeyStep ? '#7c3aed' : 'white',
                      border: `2px solid ${i <= journeyStep ? '#7c3aed' : '#e5e7eb'}`,
                      boxShadow: i <= journeyStep ? '0 0 0 4px rgba(124,58,237,0.2)' : 'none',
                      transform: i === journeyStep ? 'scale(1.3)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                    }} />
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          )}

          {/* Pure CSS split — no Chakra Splitter, no internal state */}
          {step !== 0 && <Box
            position="absolute"
            inset={0}
            zIndex={1}
            display="flex"
            style={{ pointerEvents: 'none' }}
          >
            {step === 2 && (
              <Box style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 4, pointerEvents: 'none',
              }} />
            )}

            {/* Left panel — width driven by sizes[0] */}
            <Box
              style={{
                width: `${sizes[0]}%`,
                background: '#f6f0ff',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'width 0.04s linear',
              }}
            >
              <Box position="absolute" inset={0}
                bg={highlightSide === 'right' ? 'rgba(0,0,0,0.45)' : 'transparent'}
                style={{ transition: 'background 0.5s ease', pointerEvents: 'none', zIndex: 2 }}
              />
              {highlightSide === 'left' && (
                <Box position="absolute" top={4} right={4} zIndex={3}
                  bg="purple.500" color="white" px={3} py={1}
                  borderRadius="full" fontSize="sm" fontWeight="700"
                  style={{ pointerEvents: 'none' }}
                >
                  {t('sound.tutorial.versionTwo')}
                </Box>
              )}
              {animateCircles && (
                <>
                  {step === 2 && highlightBubble === 0 ? (
                    <Box style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
                      <MusicBubble style={{ top: '68%', left: '12%' }} highlighted />
                    </Box>
                  ) : (
                    <MusicBubble style={{ top: '68%', left: '12%' }} highlighted={step === 2 && highlightBubble === 0} />
                  )}
                  <MusicBubble style={{ top: '42%', left: '55%' }} highlighted={step === 2 && highlightBubble === 1} />
                </>
              )}
            </Box>

            {/* Divider line — visual only */}
            <Box
              style={{
                width: '2px',
                background: '#a78bfa',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'white',
                  border: '2px solid #a78bfa',
                }}
              />
            </Box>

            {/* Right panel — takes remaining width */}
            <Box
              style={{
                flex: 1,
                background: '#d9d9d9',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box position="absolute" inset={0}
                bg={highlightSide === 'left' ? 'rgba(0,0,0,0.45)' : 'transparent'}
                style={{ transition: 'background 0.5s ease', pointerEvents: 'none', zIndex: 2 }}
              />
              {highlightSide === 'right' && (
                <Box position="absolute" top={4} left={4} zIndex={3}
                  bg="purple.500" color="white" px={3} py={1}
                  borderRadius="full" fontSize="sm" fontWeight="700"
                  style={{ pointerEvents: 'none' }}
                >
                  {t('sound.tutorial.versionOne')}
                </Box>
              )}
              {animateCircles && (
                <>
                  {step === 2 && highlightBubble === 0 ? (
                    <Box style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
                      <MusicBubble style={{ top: '22%', left: '22%' }} highlighted />
                    </Box>
                  ) : (
                    <MusicBubble style={{ top: '22%', left: '22%' }} highlighted={step === 2 && highlightBubble === 0} />
                  )}
                  <MusicBubble style={{ top: '65%', left: '58%' }} highlighted={step === 2 && highlightBubble === 1} />
                </>
              )}
            </Box>
          </Box>}

          {/* Chakra Splitter ONLY for step 3 where user drags */}
          {step === 3 && (
            <Splitter.Root
              panels={[
                { id: 'left', minSize: 8 },
                { id: 'right', minSize: 8 },
              ]}
              defaultSize={[50, 50]}
              onResize={(details) => {
                const next = details.size as number[];
                if (next.length >= 2) {
                  setSizes([next[0], next[1]]);
                }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
              }}
            >
              <Splitter.Panel
                id="left"
                style={{ background: '#f6f0ff' }}
              />
              <Splitter.ResizeTrigger id="left:right">
                <Splitter.ResizeTriggerSeparator />
                <Splitter.ResizeTriggerIndicator />
              </Splitter.ResizeTrigger>
              <Splitter.Panel
                id="right"
                style={{ background: '#d9d9d9' }}
              />
            </Splitter.Root>
          )}

          {/* Info card — TutorialOverlay tooltip style */}
          <Box
            style={{
              position: 'absolute',
              top: 32,
              left: 32,
              width: 280,
              background: 'white',
              borderRadius: 12,
              padding: '16px',
              zIndex: 10,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid #e5e7eb',
              opacity: cardVisible ? 1 : 0,
              transition: 'opacity 150ms ease',
            }}
          >
            <Flex gap="8px" mb={2}>
              {stepTitles.map((_, i) => (
                <Box key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === step ? '#7c3aed' : '#e5e7eb',
                  transition: 'background 0.3s ease',
                }} />
              ))}
            </Flex>

            <Text
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 6,
              }}
            >
              {stepTitles[step]}
            </Text>

            <Text
              style={{
                color: '#111',
                fontSize: 15,
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
                marginBottom: 12,
              }}
            >
              {tutorialSteps[step]}
            </Text>

            <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>
              {isLastStep ? '' : t('sound.tutorial.clickToContinue')}
            </Text>

            <StageButton
              variantType="subtle"
              onClick={() => {
                if (isLastStep) {
                  onNext();
                } else {
                  setStep((prev) => prev + 1);
                }
              }}
            >
              {isLastStep ? t('common.start') : t('common.ok')}
            </StageButton>
          </Box>

          <style>
            {`
              @keyframes pulse {
                0% {
                  transform: scale(0.8);
                  opacity: 0.6;
                }
                100% {
                  transform: scale(1.8);
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
          {t('common.back')}
        </StageButton>

        <StageButton
          variantType={isLastStep ? 'primary' : 'disabled'}
          onClick={isLastStep ? onNext : undefined}
        >
          {t('common.next')}
        </StageButton>
      </Flex>
    </Box>
  );
};

export default SoundTutorial;