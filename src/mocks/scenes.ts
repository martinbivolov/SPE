import type { SessionConfig } from "../features/soundSplit/types";

export const mockSession: SessionConfig = {
  sceneA: {
    id: "scene-a",
    side: "A",
    name: "Version 1",
    backgroundImageUrl: "/PickYourStyle/kitchen_copilot_3.2 1.png",
    audioLabel: "World A Ambience",
    audioUrl: "/Audio/Scenses/Audio Scene B - Kitchen/WSA_AudioSceneB_OptionA.wav",
    videoUrl: "/Video/Kitchen/kitchen_A.mp4",
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
  sceneB: {
    id: "scene-b",
    side: "B",
    name: "Version 2",
    backgroundImageUrl: "/PickYourStyle/kitchen_copilot_3.2 1.png",
    audioLabel: "World B Ambience",
    audioUrl: "/Audio/Scenses/Audio Scene B - Kitchen/WSA_AudioSceneB_OptionB.wav",
    videoUrl: "/Video/Kitchen/kitchen_B.mp4",
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
};
