import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Text } from "@chakra-ui/react";
import { FiInfo } from "react-icons/fi";
import SceneA from "./SceneA";
import SceneB from "./SceneB";
import DividerControl from "./DividerControl";
import AudioEngine from "./AudioEngine";
import NavigationControls from "./NavigationControls";
import TutorialOverlay from "./TutorialOverlay";
import type { SceneData } from "./types";

interface SoundPreferenceSplitScreenProps {
	onBack: () => void;
	onNext: () => void;
}

const placeholderScenes: SceneData[] = [
	{
		id: "scene-a",
		side: "A",
		name: "World A",
		backgroundImageUrl: "/PickYourStyle/kitchen_copilot_3.2 1.png",
		audioLabel: "World A Ambience",
		audioFrequency: 180,
		elements: [
			{
				id: "a-phone",
				label: "Phone",
				imageUrl: "/PickYourStyle/PhoneCall.png",
				x: 26,
				y: 48,
				size: 78,
				sfxFrequency: 420,
			},
			{
				id: "a-music",
				label: "Music",
				imageUrl: "/PickYourStyle/MusicListening.png",
				x: 58,
				y: 62,
				size: 70,
				sfxFrequency: 540,
			},
		],
	},
	{
		id: "scene-b",
		side: "B",
		name: "World B",
		backgroundImageUrl: "/PickYourStyle/kitchen_copilot_3.2 1.png",
		audioLabel: "World B Ambience",
		audioFrequency: 230,
		elements: [
			{
				id: "b-car",
				label: "Car",
				imageUrl: "/PickYourStyle/InTheCar.png",
				x: 68,
				y: 46,
				size: 74,
				sfxFrequency: 480,
			},
			{
				id: "b-outdoor",
				label: "Outdoor",
				imageUrl: "/PickYourStyle/OutdoorNature.png",
				x: 82,
				y: 62,
				size: 68,
				sfxFrequency: 620,
			},
		],
	},
];

const SoundPreferenceSplitScreen: React.FC<SoundPreferenceSplitScreenProps> = ({
	onBack,
	onNext,
}) => {
	const [dividerX, setDividerX] = useState(50);
	const [activeElements, setActiveElements] = useState<string[]>([]);
	const [isAudioAEnabled, setIsAudioAEnabled] = useState(true);
	const [isAudioBEnabled, setIsAudioBEnabled] = useState(true);
	const [scenes] = useState<SceneData[]>(placeholderScenes);
	const [isTutorialActive, setIsTutorialActive] = useState(true);
	const [tutorialStep, setTutorialStep] = useState(1);

	const infoButtonRef = useRef<HTMLButtonElement | null>(null);
	const dividerRef = useRef<HTMLDivElement | null>(null);
	const toggleRef = useRef<HTMLDivElement | null>(null);
	const objectRef = useRef<HTMLDivElement | null>(null);

	const sceneA = useMemo(() => scenes.find((scene) => scene.side === "A"), [scenes]);
	const sceneB = useMemo(() => scenes.find((scene) => scene.side === "B"), [scenes]);

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
		if (!isTutorialActive) {
			return;
		}

		setActiveElements([]);
	}, [isTutorialActive]);

	const startTutorial = () => {
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

	if (!sceneA || !sceneB) {
		return null;
	}

	return (
		<Box
			maxW="1280px"
			w="100%"
			mx="auto"
			bg="white"
			_dark={{ bg: "gray.700", borderColor: "gray.600" }}
			p={{ base: 4, md: 8 }}
			border="1px solid"
			borderColor="gray.200"
			boxShadow="md"
			display="flex"
			flexDirection="column"
			minH="calc(100vh - 220px)"
		>
			<Text
				fontSize={{ base: "2xl", md: "4xl" }}
				fontWeight="700"
				textAlign="center"
				color="gray.800"
				_dark={{ color: "gray.100" }}
				mb={2}
			>
				Sound Preference Exploration
			</Text>
			<Text fontSize={{ base: "sm", md: "md" }} textAlign="center" color="gray.600" _dark={{ color: "gray.300" }} mb={6}>
				Drag divider · Hold scene objects · Play each world independently
			</Text>

			<Box position="relative" borderRadius="lg" overflow="hidden" bg="black" minH={{ base: "380px", md: "520px" }} mb={6}>
				<SceneA
					scene={sceneA}
					dividerX={dividerX}
					isAudioEnabled={isAudioAEnabled}
					onToggleAudio={() => setIsAudioAEnabled((value) => !value)}
					onHoldChange={handleHoldChange}
					tutorialObjectId="a-phone"
					tutorialObjectRef={objectRef}
				/>
				<SceneB
					scene={sceneB}
					dividerX={dividerX}
					isAudioEnabled={isAudioBEnabled}
					onToggleAudio={() => setIsAudioBEnabled((value) => !value)}
					showOverlay
					onHoldChange={handleHoldChange}
					tutorialToggleRef={toggleRef}
				/>
				<DividerControl dividerX={dividerX} onDividerChange={setDividerX} dividerRef={dividerRef} />

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
					onClick={startTutorial}
				>
					<FiInfo />
				</IconButton>
			</Box>

			<AudioEngine
				scenes={scenes}
				activeElements={activeElements}
				isAudioAEnabled={isAudioAEnabled}
				isAudioBEnabled={isAudioBEnabled}
			/>

			<NavigationControls onBack={onBack} onNext={onNext} />

			<TutorialOverlay
				isActive={isTutorialActive}
				step={tutorialStep}
				onAdvance={handleAdvanceTutorial}
				onComplete={handleTutorialComplete}
				iButtonRef={infoButtonRef}
				dividerRef={dividerRef}
				toggleRef={toggleRef}
				objectRef={objectRef}
			/>
		</Box>
	);
};

export default SoundPreferenceSplitScreen;
