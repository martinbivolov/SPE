import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Text } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import SceneA from './SceneA';
import SceneB from './SceneB';
import DividerControl from './DividerControl';
import AudioEngine from './AudioEngine';
import NavigationControls from './NavigationControls';
import TutorialOverlay from './TutorialOverlay';
import VideoPlayer from './VideoPlayer';
import { PreferenceModal, ReplayOptionsModal, StrengthModal } from './PreferenceModals';
import type { SessionConfig, SessionPhase } from './types';

interface SoundPreferenceSplitScreenProps {
	onBack: () => void;
	onNext: () => void;
	sessionConfig: SessionConfig;
	onSubmitPreference: (preferredVersion: 'A' | 'B', preferenceStrength: number) => Promise<boolean>;
	isSubmittingPreference?: boolean;
	submitError?: string | null;
}

const SWEEP_MS = 600;
const REPLAY_SWEEP_MS = 400;

type SequenceMode = 'intro' | 'singleA' | 'singleB' | 'both';

const SoundPreferenceSplitScreen: React.FC<SoundPreferenceSplitScreenProps> = ({
	onBack,
	onNext,
	sessionConfig,
	onSubmitPreference,
	isSubmittingPreference = false,
	submitError,
}) => {
	const [dividerX, setDividerX] = useState(50);
	const [dividerAnimationMs, setDividerAnimationMs] = useState(SWEEP_MS);
	const [isDividerAnimating, setIsDividerAnimating] = useState(false);
	const [activeElements, setActiveElements] = useState<string[]>([]);
	const [sessionPhase, setSessionPhase] = useState<SessionPhase>('intro');
	const [caption, setCaption] = useState('In this adventure you will first watch Version 1.');
	const [videoSrc, setVideoSrc] = useState(sessionConfig.sceneA.videoUrl);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [sequenceMode, setSequenceMode] = useState<SequenceMode>('intro');
	const [objectsInteractive, setObjectsInteractive] = useState(false);
	const [wiggleObjects, setWiggleObjects] = useState(false);
	const [isTutorialActive, setIsTutorialActive] = useState(false);
	const [tutorialStep, setTutorialStep] = useState(1);
	const [preferredVersion, setPreferredVersion] = useState<'A' | 'B' | null>(null);
	const [strengthRating, setStrengthRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

	const infoButtonRef = useRef<HTMLButtonElement | null>(null);
	const dividerRef = useRef<HTMLDivElement | null>(null);
	const objectRef = useRef<HTMLDivElement | null>(null);
	const timeoutIdsRef = useRef<number[]>([]);

	const sceneA = useMemo(() => sessionConfig.sceneA, [sessionConfig.sceneA]);
	const sceneB = useMemo(() => sessionConfig.sceneB, [sessionConfig.sceneB]);
	const scenes = useMemo(() => [sceneA, sceneB], [sceneA, sceneB]);
	const isVideoPhase = sessionPhase === 'videoA' || sessionPhase === 'videoB';
	const isInteractivePhase = sessionPhase === 'replay' || sessionPhase === 'exploration';
	const canInteractWithScene = isInteractivePhase && !isTutorialActive && objectsInteractive;

	const clearTimers = useCallback(() => {
		timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
		timeoutIdsRef.current = [];
	}, []);

	const schedule = useCallback((delayMs: number, callback: () => void) => {
		const timeoutId = window.setTimeout(callback, delayMs);
		timeoutIdsRef.current.push(timeoutId);
	}, []);

	const preloadInteractiveImage = useCallback(() => {
		const image = new Image();
		image.src = sceneA.backgroundImageUrl;
	}, [sceneA.backgroundImageUrl]);

	const animateDividerTo = useCallback(
		(targetX: number, durationMs: number, onDone: () => void) => {
			setDividerAnimationMs(durationMs);
			setIsDividerAnimating(true);
			setDividerX(targetX);
			schedule(durationMs, () => {
				setIsDividerAnimating(false);
				onDone();
			});
		},
		[schedule]
	);

	const beginWiggleWindow = useCallback(() => {
		setWiggleObjects(true);
		setObjectsInteractive(false);
		schedule(800, () => {
			setWiggleObjects(false);
			setObjectsInteractive(true);
		});
	}, [schedule]);

	const snapToInteractiveReplay = useCallback(() => {
		setIsVideoPlaying(false);
		setSessionPhase('replay');
		setCaption('Replay options: Version 1, Version 2, or both.');
		setDividerX(50);
		setActiveElements([]);
		setIsTutorialActive(false);
		beginWiggleWindow();
	}, [beginWiggleWindow]);

	const startVideoA = useCallback(
		(mode: SequenceMode, sweepDurationMs: number) => {
			setSequenceMode(mode);
			setIsVideoPlaying(false);
			animateDividerTo(100, sweepDurationMs, () => {
				setSessionPhase('videoA');
				setVideoSrc(sceneA.videoUrl);
				setCaption('Watch Version 1');
				setIsVideoPlaying(true);
			});
		},
		[animateDividerTo, sceneA.videoUrl]
	);

	const startVideoB = useCallback(
		(mode: SequenceMode, sweepDurationMs: number) => {
			setSequenceMode(mode);
			setIsVideoPlaying(false);
			setCaption('Now watch Version 2.');
			preloadInteractiveImage();
			animateDividerTo(0, sweepDurationMs, () => {
				setSessionPhase('videoB');
				setVideoSrc(sceneB.videoUrl);
				setIsVideoPlaying(true);
			});
		},
		[animateDividerTo, preloadInteractiveImage, sceneB.videoUrl]
	);

	const handleHoldChange = (elementId: string, isHeld: boolean) => {
		setActiveElements((previous) => {
			if (isHeld) {
				if (previous.includes(elementId)) {
					return previous;
				}
				return [...previous, elementId];
			}
			return previous.filter((entry) => entry !== elementId);
		});
	};

	useEffect(() => {
		if (!isTutorialActive || !isInteractivePhase) {
			return;
		}
		setActiveElements([]);
	}, [isInteractivePhase, isTutorialActive]);

	useEffect(() => {
		if (sessionPhase !== 'videoB') {
			return;
		}
		preloadInteractiveImage();
	}, [preloadInteractiveImage, sessionPhase]);

	useEffect(() => {
		clearTimers();
		setActiveElements([]);
		setDividerX(50);
		setIsDividerAnimating(false);
		setIsVideoPlaying(false);
		setIsTutorialActive(false);
		setPreferredVersion(null);
		setStrengthRating(null);

		setSessionPhase('intro');
		setCaption('In this adventure you will first watch Version 1.');
		setObjectsInteractive(false);
		setWiggleObjects(false);
		setVideoSrc(sceneA.videoUrl);

		schedule(500, () => {
			startVideoA('intro', SWEEP_MS);
		});

		return () => {
			clearTimers();
		};
	}, [clearTimers, schedule, sceneA.videoUrl, startVideoA]);

	const handleVideoEnded = useCallback(() => {
		if (sessionPhase === 'videoA') {
			if (sequenceMode === 'singleA') {
				setIsVideoPlaying(false);
				setSessionPhase('replay');
				setCaption('Replay options: Version 1, Version 2, or both.');
				setDividerX(50);
				setSequenceMode('intro');
				beginWiggleWindow();
				return;
			}

			startVideoB(sequenceMode === 'both' ? 'both' : 'intro', SWEEP_MS);
			return;
		}

		if (sessionPhase === 'videoB') {
			snapToInteractiveReplay();
		}
	}, [beginWiggleWindow, sequenceMode, sessionPhase, snapToInteractiveReplay, startVideoB]);

	const startTutorial = () => {
		if (!isInteractivePhase) {
			return;
		}
		setIsTutorialActive(true);
		setTutorialStep(1);
	};

	const handleAdvanceTutorial = () => {
		setTutorialStep((value) => value + 1);
	};

	const handleTutorialComplete = () => {
		setIsTutorialActive(false);
		setTutorialStep(0);
	};

	const handleContinueFlow = async () => {
		if (sessionPhase === 'replay') {
			setSessionPhase('preference');
			setCaption('Which version did you prefer?');
			return;
		}

		if (sessionPhase === 'exploration') {
			onNext();
		}
	};

	const handleSkipReplay = () => {
		setSessionPhase('preference');
		setCaption('Which version did you prefer?');
	};

	const handleBackFlow = () => {
		if (sessionPhase === 'exploration') {
			setSessionPhase('strength');
			setCaption('How strong was that preference?');
			setObjectsInteractive(false);
			setWiggleObjects(false);
			return;
		}

		onBack();
	};

	const versionLabel = sessionPhase === 'videoA' ? 'Version 1' : 'Version 2';
	const versionLabelPosition = sessionPhase === 'videoA' ? { top: 4, right: 4 } : { top: 4, left: 4 };

	return (
		<Box
			maxW="1280px"
			w="100%"
			mx="auto"
			bg="white"
			_dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
			p={{ base: 4, md: 8 }}
			border="1px solid"
			borderColor="gray.200"
			boxShadow="md"
			display="flex"
			flexDirection="column"
		>
			<Box position="relative" borderRadius="lg" overflow="hidden" bg="black" h="calc(100vh - 220px)" mb={6}>
				{!isVideoPhase && (
					<>
						<SceneA
							scene={sceneA}
							dividerX={dividerX}
							isInteractive={canInteractWithScene}
							shouldWiggleObjects={wiggleObjects}
							onHoldChange={handleHoldChange}
							tutorialObjectId={sceneA.elements[0]?.id}
							tutorialObjectRef={objectRef}
						/>
						<SceneB
							scene={sceneB}
							dividerX={dividerX}
							isInteractive={canInteractWithScene}
							isAnimating={isDividerAnimating}
							animationDurationMs={dividerAnimationMs}
							showOverlay={false}
							shouldWiggleObjects={wiggleObjects}
							onHoldChange={handleHoldChange}
						/>
					</>
				)}

				{isVideoPhase && <VideoPlayer src={videoSrc} isPlaying={isVideoPlaying} onEnded={handleVideoEnded} showProgress />}

				<DividerControl
					dividerX={dividerX}
					isInteractive={!isVideoPhase && !isTutorialActive}
					isAnimating={isDividerAnimating}
					animationDurationMs={dividerAnimationMs}
					onDividerChange={setDividerX}
					dividerRef={dividerRef}
				/>

				{isVideoPhase && (
					<Box
						position="absolute"
						zIndex={12}
						bg="blackAlpha.600"
						color="white"
						fontSize="xs"
						fontWeight="600"
						px={3}
						py={1.5}
						borderRadius="full"
						{...versionLabelPosition}
					>
						{versionLabel}
					</Box>
				)}

				<IconButton
					ref={infoButtonRef}
					aria-label="Open tutorial"
					position="absolute"
					left={4}
					bottom={4}
					zIndex={11}
					size="sm"
					borderRadius="full"
					colorScheme="blue"
					disabled={isVideoPhase || sessionPhase === 'intro'}
					onClick={startTutorial}
				>
					<FiInfo />
				</IconButton>

				<Box
					position="absolute"
					left={0}
					right={0}
					bottom={0}
					zIndex={15}
					bg="blackAlpha.700"
					color="white"
					px={{ base: 3, md: 4 }}
					py={{ base: 2.5, md: 3 }}
				>
					<Text fontSize={{ base: 'sm', md: 'md' }} mb={sessionPhase === 'replay' ? 3 : 0}>
						{caption}
					</Text>
				</Box>
			</Box>

			<AudioEngine scenes={scenes} activeElements={activeElements} />

			<NavigationControls onBack={handleBackFlow} onNext={() => void handleContinueFlow()} />

			<TutorialOverlay
				isActive={isTutorialActive}
				step={tutorialStep}
				onAdvance={handleAdvanceTutorial}
				onComplete={handleTutorialComplete}
				iButtonRef={infoButtonRef}
				dividerRef={dividerRef}
				objectRef={objectRef}
			/>

			<PreferenceModal
				isOpen={sessionPhase === 'preference'}
				selectedVersion={preferredVersion}
				onSelect={(version) => {
					setPreferredVersion(version);
					setSessionPhase('strength');
					setCaption('How strong was that preference?');
				}}
			/>

			<StrengthModal
				isOpen={sessionPhase === 'strength'}
				preferredVersion={preferredVersion}
				selectedStrength={strengthRating}
				onSubmit={async (strength) => {
					setStrengthRating(strength);
					if (!preferredVersion) return;
					const saved = await onSubmitPreference(preferredVersion, strength);
					if (!saved) return;
					setSessionPhase('exploration');
					setCaption('Explore the scene and interact with objects.');
					setWiggleObjects(false);
					setObjectsInteractive(true);
				}}
				isSubmitting={isSubmittingPreference}
				submitError={submitError}
			/>

			<ReplayOptionsModal
				isOpen={sessionPhase === 'replay'}
				onReplayFirst={() => startVideoA('singleA', REPLAY_SWEEP_MS)}
				onReplaySecond={() => startVideoB('singleB', REPLAY_SWEEP_MS)}
				onReplayBoth={() => startVideoA('both', REPLAY_SWEEP_MS)}
				onSkipReplay={handleSkipReplay}
			/>
		</Box>
	);
};

export default SoundPreferenceSplitScreen;
