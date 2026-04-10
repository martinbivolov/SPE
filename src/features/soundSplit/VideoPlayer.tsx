import React, { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton } from "@chakra-ui/react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { useVolume } from "../../contexts/VolumeContext";

interface VideoPlayerProps {
  src: string | null;
  isPlaying: boolean;
  onEnded: () => void;
  showProgress?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  isPlaying,
  onEnded,
  showProgress = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayFallback, setShowPlayFallback] = useState(false);
  const { volume } = useVolume();

  // Apply global volume to the video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.currentTime = 0;
    setProgressPct(0);
    setShowPlayFallback(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let cancelled = false;

    const syncPlayback = async () => {
      if (!isPlaying) {
        video.pause();
        return;
      }

      try {
        await video.play();
        if (!cancelled) {
          setShowPlayFallback(false);
        }
      } catch (error) {
        console.error("Video autoplay blocked", error);
        if (!cancelled) {
          setShowPlayFallback(true);
        }
      }
    };

    void syncPlayback();

    return () => {
      cancelled = true;
    };
  }, [isPlaying, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) {
        setProgressPct(0);
        return;
      }

      setProgressPct(Math.min(100, (video.currentTime / video.duration) * 100));
    };

    const handleEnded = () => {
      setProgressPct(100);
      onEnded();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onEnded, src]);

  return (
    <Box position="absolute" inset={0} zIndex={3} bg="black" w="100%" h="100%">
      <video
        ref={videoRef}
        src={src || undefined}
        preload="auto"
        playsInline
        muted={isMuted}
        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", background: "black" }}
      />

      <IconButton
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        position="absolute"
        right={4}
        bottom={4}
        zIndex={6}
        size="sm"
        borderRadius="full"
        bg="blackAlpha.700"
        color="white"
        _hover={{ bg: "blackAlpha.800" }}
        onClick={() => setIsMuted((value) => !value)}
      >
        {isMuted ? <FiVolumeX /> : <FiVolume2 />}
      </IconButton>

      {showPlayFallback && (
        <Button
          position="absolute"
          inset="auto auto 12px 12px"
          zIndex={6}
          size="sm"
          colorPalette="blue"
          onClick={async () => {
            const video = videoRef.current;
            if (!video) {
              return;
            }

            try {
              await video.play();
              setShowPlayFallback(false);
            } catch (error) {
              console.error("Manual play failed", error);
            }
          }}
        >
          Tap to play
        </Button>
      )}

      {showProgress && (
        <Box position="absolute" left={0} right={0} bottom={0} h="2px" bg="whiteAlpha.300" zIndex={5}>
          <Box h="100%" bg="cyan.300" w={`${progressPct}%`} transition="width 0.12s linear" />
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;
