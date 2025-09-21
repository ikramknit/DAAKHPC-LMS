
import React, { useState, useEffect, useRef } from 'react';
import type { VideoLink } from '../types';
import { BookOpenIcon, PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon, ExpandIcon, ShrinkIcon } from './Icons';

// FIX: Define VideoPlayerProps interface for the component's props.
interface VideoPlayerProps {
  video: VideoLink | null;
}

// --- YouTube API Loader ---
// This robust loader ensures the YouTube IFrame API is loaded only once.
const apiReadyCallbacks: (() => void)[] = [];
let isApiLoading = false;
let isApiReady = !!(window as any).YT && !!(window as any).YT.Player;

(window as any).onYouTubeIframeAPIReady = () => {
    isApiLoading = false;
    isApiReady = true;
    apiReadyCallbacks.forEach(cb => cb());
    apiReadyCallbacks.length = 0; // Clear callbacks after execution
};

const loadYouTubeAPI = (callback: () => void) => {
    if (isApiReady) {
        callback();
        return;
    }
    apiReadyCallbacks.push(callback);
    if (isApiLoading) {
        return;
    }
    isApiLoading = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
};
// --- End YouTube API Loader ---


const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadYouTubeAPI(() => {
      setIsApiReady(true);
    });
    
    // Cleanup timers on component unmount
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);
  
  useEffect(() => {
    const onFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (isApiReady && video && playerContainerRef.current) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      const player = new (window as any).YT.Player(playerContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId: video.videoId,
        playerVars: {
          'autoplay': 1,
          'controls': 0, // We use custom controls
          'rel': 0,
          'showinfo': 0,
          'modestbranding': 1,
          'iv_load_policy': 3,
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
        },
      });
      playerRef.current = player;
    }
  }, [isApiReady, video]);

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());
    setVolume(event.target.getVolume());
    setIsMuted(event.target.isMuted());
    event.target.playVideo();
    handleMouseMove(); // Show controls on load
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    if (playerState === (window as any).YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);
    } else {
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    
    // Ensure time is updated on pause or end
    if (playerState === (window as any).YT.PlayerState.PAUSED || playerState === (window as any).YT.PlayerState.ENDED) {
        if(playerRef.current?.getCurrentTime) setCurrentTime(playerRef.current.getCurrentTime());
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const time = Number(e.target.value);
    setCurrentTime(time);
    playerRef.current.seekTo(time, true);
  };
  
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !progressContainerRef.current || duration === 0) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickPosition / width) * duration;
    
    setCurrentTime(newTime);
    playerRef.current.seekTo(newTime, true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };
  
  const toggleFullscreen = () => {
    if (!playerWrapperRef.current) return;

    if (!document.fullscreenElement) {
        playerWrapperRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const time = Math.round(timeInSeconds);
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="p-4 bg-sky-100 rounded-full mb-6">
          <BookOpenIcon className="w-10 h-10 sm:w-12 sm:h-12 text-sky-500" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Welcome to Your Course!</h2>
        <p className="mt-2 text-slate-500 max-w-md">
          Select a video from the course content list to begin your learning journey.
        </p>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume;

  return (
    <div className="w-full">
      <div
        ref={playerWrapperRef}
        className="aspect-16/9 bg-black rounded-xl overflow-hidden shadow-2xl relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
        aria-label="Video Player"
      >
        <div ref={playerContainerRef} className="w-full h-full" id="youtube-player-container"></div>
        <div className={`absolute bottom-0 left-0 right-0 p-2 sm:p-4 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          
          <div ref={progressContainerRef} onClick={handleSeekClick} className="w-full py-2 cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
              style={{ '--progress-percent': `${progressPercent}%` } as React.CSSProperties}
              aria-label="Video progress"
            />
          </div>

          <div className="flex items-center justify-between mt-0 text-white text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <PauseIcon className="w-7 h-7 sm:w-8 sm:h-8"/> : <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8"/>}
              </button>
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted || volume === 0 ? <VolumeOffIcon className="w-5 h-5 sm:w-6 sm:h-6"/> : <VolumeUpIcon className="w-5 h-5 sm:w-6 sm:h-6"/>}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm transition-all duration-300"
                  style={{'--progress-percent': `${volumePercent}%`} as React.CSSProperties}
                  aria-label="Volume control"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="font-mono" aria-live="off">
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                  {isFullscreen ? <ShrinkIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <ExpandIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
          .range-sm {
            background: linear-gradient(to right, #0ea5e9 var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%));
            transition: background 0.1s ease-out;
          }
          .range-sm::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
          }
           .range-sm:hover::-webkit-slider-thumb {
            transform: scale(1.1);
           }
          .range-sm::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
          }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
