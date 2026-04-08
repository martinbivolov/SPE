import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Circle, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import SceneA from './SceneA';
import SceneB from './SceneB';
import DividerControl from './DividerControl';
import AudioEngine from './AudioEngine';
import NavigationControls from './NavigationControls';
import TutorialOverlay from './TutorialOverlay';
import VideoPlayer from './VideoPlayer';
import { PreferenceModal, ReplayOptionsModal, StrengthModal } from './PreferenceModals';
import type { SceneData, SessionPhase } from './types';
import type { LoadedStory } from '../../hooks/useStoryRecommendation';
import { useSaveSessionResult } from '../../hooks/useSaveSessionResult';
import { supabase } from '../../lib/supabase';

interface SoundPreferenceSplitScreenProps {
	userId: string;
	story: LoadedStory;
	onBack: () => void;
	onNext: () => void;
}

const SWEEP_MS = 600;
const REPLAY_SWEEP_MS = 400;

type SequenceMode = 'intro' | 'singleA' | 'singleB' | 'both';

const SoundPreferenceSplitScreen: React.FC<SoundPreferenceSplitScreenProps> = ({
	userId,
	story,
	onBack,
	onNext,
}) => {
	const [sceneIndex, setSceneIndex] = useState(0);
	const [dividerX, setDividerX] = useState(50);
	const [dividerAnimationMs, setDividerAnimationMs] = useState(SWEEP_MS);
	const [isDividerAnimating, setIsDividerAnimating] = useState(false);
	const [activeElements, setActiveElements] = useState<string[]>([]);
	const [sessionPhase, setSessionPhase] = useState<SessionPhase>('story-intro');
	const [caption, setCaption] = useState('');
	const [videoSrc, setVideoSrc] = useState<string | null>(null);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [sequenceMode, setSequenceMode] = useState<SequenceMode>('intro');
	const [objectsInteractive, setObjectsInteractive] = useState(false);
	const [wiggleObjects, setWiggleObjects] = useState(false);
	const [isTutorialActive, setIsTutorialActive] = useState(false);
	const [tutorialStep, setTutorialStep] = useState(1);
	const [preferredVersion, setPreferredVersion] = useState<'A' | 'B' | null>(null);
	const [strengthRating, setStrengthRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
	const [postPreference, setPostPreference] = useState<'A' | 'B' | null>(null);
	const [postStrength, setPostStrength] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

	const infoButtonRef = useRef<HTMLButtonElement | null>(null);
	const dividerRef = useRef<HTMLDivElement | null>(null);
	const objectRef = useRef<HTMLDivElement | null>(null);
	const timeoutIdsRef = useRef<number[]>([]);
	const hasPlayedIntro = useRef(false);
	const hasUsedReplay = useRef(false);

	const { saveResult, loading: resultLoading, error: resultError } = useSaveSessionResult();

	const currentScene = story.scenes[sceneIndex] ?? null;
	const currentVersion = currentScene?.version ?? null;

	const sceneA = useMemo<SceneData>(() => ({
		id: `${currentVersion?.id ?? 'none'}-a`,
		side: 'A',
		name: `${currentScene?.name ?? ''} - Version 1`,
		backgroundImageUrl: currentVersion?.background_image_url ?? '',
		audioLabel: 'Version 1',
		audioUrl: currentVersion?.video_a_url ?? null,
		videoUrl: currentVersion?.video_a_url ?? null,
		elements: currentVersion?.interactive_enabled
			? (currentVersion.scene_objects ?? []).map((obj) => ({
					id: `a-${obj.id}`,
					label: obj.label,
					imageUrl: obj.image_url,
					sfxUrl: obj.sfx_url,
					x: obj.x,
					y: obj.y,
					size: obj.size,
				}))
			: [],
	}), [currentScene?.name, currentVersion]);

	console.log('[splitscreen] currentVersion:', JSON.stringify(currentVersion, null, 2));
	console.log('[splitscreen] sceneA elements:', sceneA.elements);

	const sceneB = useMemo<SceneData>(() => ({
		id: `${currentVersion?.id ?? 'none'}-b`,
		side: 'B',
		name: `${currentScene?.name ?? ''} - Version 2`,
		backgroundImageUrl: currentVersion?.background_image_url ?? '',
		audioLabel: 'Version 2',
		audioUrl: currentVersion?.video_b_url ?? null,
		videoUrl: currentVersion?.video_b_url ?? null,
		elements: currentVersion?.interactive_enabled
			? (currentVersion.scene_objects ?? []).map((obj) => ({
					id: `b-${obj.id}`,
					label: obj.label,
					imageUrl: obj.image_url,
					sfxUrl: obj.sfx_url,
					x: obj.x,
					y: obj.y,
					size: obj.size,
				}))
			: [],
	}), [currentScene?.name, currentVersion]);

	console.log('[splitscreen] sceneB elements:', sceneB.elements);
	console.log(
		'[splitscreen] interactive_enabled:', currentVersion?.interactive_enabled,
		'objectsInteractive:', objectsInteractive,
		'sessionPhase:', sessionPhase
	);

	const scenes = useMemo(() => [sceneA, sceneB], [sceneA, sceneB]);

	const isVideoPhase = sessionPhase === 'videoA' || sessionPhase === 'videoB';
	const isNarrationPhase =
		sessionPhase === 'story-intro' ||
		sessionPhase === 'scene-narration' ||
		sessionPhase === 'filler';
	const isInteractivePhase = sessionPhase === 'replay' || sessionPhase === 'exploration';
	const canInteractWithScene = isInteractivePhase && !isTutorialActive && objectsInteractive;

	// All media (narration audio + scene videos) routes through the single VideoPlayer.
	// This ensures handleVideoEnded can chain phases in the correct order without overlap.
	const isPlayerActive = isVideoPhase || isNarrationPhase;

	const clearTimers = useCallback(() => {
		timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
		timeoutIdsRef.current = [];
	}, []);

	const schedule = useCallback((delayMs: number, callback: () => void) => {
		const id = window.setTimeout(callback, delayMs);
		timeoutIdsRef.current.push(id);
	}, []);

	// Play a src through the VideoPlayer: stop first, then start after a tick
	// so the VideoPlayer element re-mounts / resets before playing the new src.
	const playSrc = useCallback((src: string | null) => {
		setIsVideoPlaying(false);
		setVideoSrc(src);
		schedule(50, () => setIsVideoPlaying(true));
	}, [schedule]);

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
		[schedule],
	);

	const beginWiggleWindow = useCallback(() => {
		setWiggleObjects(true);
		setObjectsInteractive(false);
		schedule(800, () => {
			setWiggleObjects(false);
			setObjectsInteractive(true);
		});
	}, [schedule]);

	const preloadInteractiveImage = useCallback(() => {
		if (!currentVersion?.background_image_url) return;
		const img = new Image();
		img.src = currentVersion.background_image_url;
	}, [currentVersion?.background_image_url]);

	const startVideoA = useCallback(
		(mode: SequenceMode, sweepDurationMs: number) => {
			setSequenceMode(mode);
			setIsVideoPlaying(false);
			animateDividerTo(100, sweepDurationMs, () => {
				setSessionPhase('videoA');
				setCaption('Watch Version 1');
				playSrc(sceneA.videoUrl);
			});
		},
		[animateDividerTo, playSrc, sceneA.videoUrl],
	);

	const startVideoB = useCallback(
		(mode: SequenceMode, sweepDurationMs: number) => {
			setSequenceMode(mode);
			setIsVideoPlaying(false);
			setCaption('Now watch Version 2.');
			preloadInteractiveImage();
			animateDividerTo(0, sweepDurationMs, () => {
				setSessionPhase('videoB');
				playSrc(sceneB.videoUrl);
			});
		},
		[animateDividerTo, preloadInteractiveImage, playSrc, sceneB.videoUrl],
	);

	const snapToInteractiveReplay = useCallback(() => {
		setIsVideoPlaying(false);
		setDividerX(50);
		setActiveElements([]);
		setIsTutorialActive(false);
		beginWiggleWindow();

		console.log('[replay] hasUsedReplay:', hasUsedReplay.current);
		if (hasUsedReplay.current) {
			// Replay already used — skip straight to preference
			setSessionPhase('preference');
			setCaption('Which version did you prefer?');
		} else {
			// First time — show replay options
			setSessionPhase('replay');
			setCaption('Replay options: Version 1, Version 2, or both.');
		}
	}, [beginWiggleWindow]);

	// ── Step functions — defined before handleVideoEnded so they can be referenced ──

	const doVideoA = useCallback(() => {
		schedule(300, () => startVideoA('intro', SWEEP_MS));
	}, [schedule, startVideoA]);

	const doSceneNarration = useCallback(() => {
		const scene = story.scenes[sceneIndex];
		const narrationUrl = scene?.narration_url;
		if (narrationUrl) {
			setSessionPhase('scene-narration');
			setCaption('');
			playSrc(narrationUrl);
		} else {
			doVideoA();
		}
	}, [story, sceneIndex, playSrc, doVideoA]);

	// ── Mark onboarding complete and exit ──
	const completeSession = useCallback(async () => {
		try {
			await supabase
				.from('profiles')
				.update({ onboarding_complete: true })
				.eq('id', userId);
		} catch (err) {
			console.error('Could not mark onboarding complete:', err);
		}
		onNext();
	}, [userId, onNext]);

	// ── Advance to the next scene, or finish the session ──
	const advanceScene = useCallback(() => {
		const nextIndex = sceneIndex + 1;
		if (nextIndex >= story.scenes.length) {
			setSessionPhase('complete');
			return;
		}
		setSceneIndex(nextIndex);
	}, [sceneIndex, story.scenes.length]);

	// ── Single handler for ALL media end events ──────────────────────────────
	const handleVideoEnded = useCallback(() => {
		// Story intro finished → play scene narration
		if (sessionPhase === 'story-intro') {
			doSceneNarration();
			return;
		}
		// Scene narration finished → play video A
		if (sessionPhase === 'scene-narration') {
			doVideoA();
			return;
		}
		// Filler finished → advance to next scene
		if (sessionPhase === 'filler') {
			advanceScene();
			return;
		}
		// Video A finished
		if (sessionPhase === 'videoA') {
			if (sequenceMode === 'singleA') {
				setSequenceMode('intro');
				snapToInteractiveReplay();
				return;
			}
			// 6 second pause between video A and video B
			setIsVideoPlaying(false);
			setSessionPhase('between-videos');
			setCaption('');
			schedule(6000, () => {
				startVideoB(sequenceMode === 'both' ? 'both' : 'intro', SWEEP_MS);
			});
			return;
		}
		// Video B finished → go to replay
		if (sessionPhase === 'videoB') {
			snapToInteractiveReplay();
			return;
		}
	}, [
		sessionPhase,
		sequenceMode,
		doSceneNarration,
		doVideoA,
		advanceScene,
		startVideoB,
		snapToInteractiveReplay,
		beginWiggleWindow,
	]);

	const handleHoldChange = (elementId: string, isHeld: boolean) => {
		setActiveElements((prev) => {
			if (isHeld) {
				return prev.includes(elementId) ? prev : [...prev, elementId];
			}
			return prev.filter((e) => e !== elementId);
		});
	};

	// After exploration: play filler through VideoPlayer, then advance
	const handleContinueFromExploration = useCallback(() => {
		const fillerUrl = currentScene?.filler_url ?? null;
		if (fillerUrl) {
			setSessionPhase('filler');
			setCaption('');
			playSrc(fillerUrl);
		} else {
			advanceScene();
		}
	}, [currentScene?.filler_url, playSrc, advanceScene]);

	const handleContinueFlow = useCallback(() => {
		if (sessionPhase === 'replay') {
			setSessionPhase('preference');
			setCaption('Which version did you prefer?');
			return;
		}
		if (sessionPhase === 'exploration') {
			setSessionPhase('post-preference');
			setCaption('After exploring — which version do you still prefer?');
			return;
		}
	}, [sessionPhase]);

	const handleSkipReplay = () => {
		hasUsedReplay.current = true;
		setSessionPhase('preference');
		setCaption('Which version did you prefer?');
	};

	// ── Scene init: runs on mount (sceneIndex=0) and each time sceneIndex advances ──
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		// Always reset intro flag at sceneIndex 0 so a fresh mount plays the intro.
		if (sceneIndex === 0) {
			hasPlayedIntro.current = false;
		}

		clearTimers();
		setIsVideoPlaying(false);
		setActiveElements([]);
		setDividerX(50);
		setIsDividerAnimating(false);
		setIsTutorialActive(false);
		setPreferredVersion(null);
		setStrengthRating(null);
		setPostPreference(null);
		setPostStrength(null);
		setObjectsInteractive(false);
		setWiggleObjects(false);
		hasUsedReplay.current = false;

		if (!hasPlayedIntro.current) {
			hasPlayedIntro.current = true;
			const introUrl = story.narration_url ?? null;
			if (introUrl) {
				setSessionPhase('story-intro');
				setCaption('');
				playSrc(introUrl);
				// handleVideoEnded('story-intro') → doSceneNarration → doVideoA
			} else {
				doSceneNarration();
			}
		} else {
			doSceneNarration();
		}

		return () => {
			clearTimers();
			setIsVideoPlaying(false);
		};
	}, [sceneIndex]); // re-run only when scene advances

	// Fire completeSession when all scenes are done
	useEffect(() => {
		if (sessionPhase === 'complete') {
			void completeSession();
		}
	}, [sessionPhase, completeSession]);

	useEffect(() => {
		if (!isTutorialActive || !isInteractivePhase) return;
		setActiveElements([]);
	}, [isInteractivePhase, isTutorialActive]);

	useEffect(() => {
		if (sessionPhase !== 'videoB') return;
		preloadInteractiveImage();
	}, [preloadInteractiveImage, sessionPhase]);

	const startTutorial = () => {
		if (!isInteractivePhase) return;
		setIsTutorialActive(true);
		setTutorialStep(1);
	};

	const handleAdvanceTutorial = () => setTutorialStep((v) => v + 1);
	const handleTutorialComplete = () => {
		setIsTutorialActive(false);
		setTutorialStep(0);
	};

	const versionLabel = sessionPhase === 'videoA' ? 'Version 1' : 'Version 2';
	const versionLabelPosition =
		sessionPhase === 'videoA' ? { top: 4, right: 4 } : { top: 4, left: 4 };
	const totalScenes = story.scenes.length;

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
			{/* Scene progress indicator */}
			<Flex justify="center" align="center" gap={3} mb={4}>
				<HStack gap={2}>
					{story.scenes.map((_, idx) => (
						<Circle
							key={idx}
							size="10px"
							bg={idx <= sceneIndex ? 'purple.500' : 'gray.300'}
							_dark={{ bg: idx <= sceneIndex ? 'purple.400' : 'gray.600' }}
						/>
					))}
				</HStack>
				<Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
					Scene {sceneIndex + 1} of {totalScenes}
				</Text>
			</Flex>

			<Box
				position="relative"
				borderRadius="lg"
				overflow="hidden"
				bg="black"
				h="calc(100vh - 280px)"
				mb={6}
			>
				{/* Scene split view — interactive phases only */}
				{!isPlayerActive && (
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

				{/* Single VideoPlayer handles narration audio + scene videos + filler.
				    Narration phases (story-intro, scene-narration, filler) show a text
				    overlay on top of the player — the audio plays underneath. */}
				{isPlayerActive && (
					<VideoPlayer
						src={videoSrc}
						isPlaying={isVideoPlaying}
						onEnded={handleVideoEnded}
						showProgress={isVideoPhase}
					/>
				)}

				{/* Text overlay for narration phases */}
				{isNarrationPhase && (
					<Flex
						position="absolute"
						inset={0}
						align="center"
						justify="center"
						zIndex={5}
					>
					</Flex>
				)}

				{sessionPhase === 'between-videos' && (
					<Flex
						position="absolute"
						inset={0}
						align="center"
						justify="center"
						zIndex={10}
						bg="blackAlpha.800"
						direction="column"
						gap={4}
					>
						<Text
							color="white"
							fontSize={{ base: 'xl', md: '3xl' }}
							fontWeight="600"
							textAlign="center"
							px={8}
						>
							Now listen to Version 2
						</Text>
						<Text
							color="whiteAlpha.700"
							fontSize={{ base: 'sm', md: 'md' }}
							textAlign="center"
						>
							Starting in a moment...
						</Text>
					</Flex>
				)}

				{!isNarrationPhase && (
					<DividerControl
						dividerX={dividerX}
						isInteractive={!isPlayerActive && !isTutorialActive && isInteractivePhase}
						isAnimating={isDividerAnimating}
						animationDurationMs={dividerAnimationMs}
						onDividerChange={setDividerX}
						dividerRef={dividerRef}
					/>
				)}

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
					disabled={!isInteractivePhase}
					onClick={startTutorial}
				>
					<FiInfo />
				</IconButton>

				{caption && (
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
						<Text
							fontSize={{ base: 'sm', md: 'md' }}
							mb={sessionPhase === 'replay' ? 3 : 0}
						>
							{caption}
						</Text>
					</Box>
				)}
			</Box>

			<AudioEngine scenes={scenes} activeElements={activeElements} />

			<NavigationControls onBack={onBack} onNext={handleContinueFlow} />

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
					if (!preferredVersion || !currentVersion?.id) return;
					const saved = await saveResult(
						userId,
						currentVersion.id,
						preferredVersion,
						strength,
						'pre',
					);
					if (!saved) return;
					setSessionPhase('exploration');
					setCaption('Explore the scene and interact with objects.');
					setWiggleObjects(false);
					setObjectsInteractive(!!currentVersion.interactive_enabled);
				}}
				isSubmitting={resultLoading}
				submitError={resultError}
			/>

			<ReplayOptionsModal
				isOpen={sessionPhase === 'replay'}
				onReplayFirst={() => {
					hasUsedReplay.current = true;
					startVideoA('singleA', REPLAY_SWEEP_MS);
				}}
				onReplaySecond={() => {
					hasUsedReplay.current = true;
					startVideoB('singleB', REPLAY_SWEEP_MS);
				}}
				onReplayBoth={() => {
					hasUsedReplay.current = true;
					startVideoA('both', REPLAY_SWEEP_MS);
				}}
				onSkipReplay={handleSkipReplay}
			/>

			<PreferenceModal
				isOpen={sessionPhase === 'post-preference'}
				selectedVersion={postPreference}
				onSelect={(version) => {
					setPostPreference(version);
					setSessionPhase('post-strength');
					setCaption('After exploring, how strong is your preference now?');
				}}
			/>

			<StrengthModal
				isOpen={sessionPhase === 'post-strength'}
				preferredVersion={postPreference}
				selectedStrength={postStrength}
				title="After exploring, how strong is your preference now?"
				onSubmit={async (strength) => {
					setPostStrength(strength);
					if (!postPreference || !currentVersion?.id) return;
					const saved = await saveResult(
						userId,
						currentVersion.id,
						postPreference,
						strength,
						'post',
					);
					if (!saved) return;
					handleContinueFromExploration();
				}}
				isSubmitting={resultLoading}
				submitError={resultError}
			/>
		</Box>
	);
};

export default SoundPreferenceSplitScreen;
