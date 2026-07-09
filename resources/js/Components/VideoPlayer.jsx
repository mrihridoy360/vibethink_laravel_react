import React, { useRef, useEffect, useMemo } from 'react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

const VideoPlayer = ({ source, autoPlay = false, onEnded }) => {
    // Common Plyr options for all video types
    const plyrOptions = useMemo(() => ({
        autoplay: autoPlay,
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'settings',
            'fullscreen',
        ],
        settings: ['quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        resetOnEnd: true,
        keyboard: { focused: true, global: true },
        displayDuration: true,
        tooltips: { controls: true, seek: true },
        i18n: {
            restart: 'Restart',
            rewind: 'Rewind {seektime}s',
            play: 'Play',
            pause: 'Pause',
            forward: 'Forward {seektime}s',
            played: 'Played',
            buffered: 'Buffered',
            currentTime: 'Current time',
            duration: 'Duration',
            volume: 'Volume',
            toggleMute: 'Toggle Mute',
            toggleCaptions: 'Toggle Captions',
            toggleFullscreen: 'Toggle Fullscreen',
        },
        youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
        },
    }), [autoPlay]);

    // Process the source for YouTube URLs
    const src = source.sources[0]?.src;
    const processedSource = useMemo(() => {
        if (!src) return null;

        // Check if it's a YouTube URL
        const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
        if (!isYouTube) return source;

        // Extract video ID from YouTube URL
        const getYouTubeId = (url) => {
            const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return match && match[2].length === 11 ? match[2] : null;
        };

        const videoId = getYouTubeId(src);
        if (!videoId) return null;

        return {
            type: 'video',
            sources: [
                {
                    src: videoId,
                    provider: 'youtube',
                },
            ],
        };
    }, [src, source]);

    if (!processedSource) {
        return (
            <div className="flex h-full items-center justify-center bg-black text-white">
                <p>No video available</p>
            </div>
        );
    }

    const isYouTube = processedSource.sources?.[0]?.provider === 'youtube';

    const ref = useRef(null);
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    useEffect(() => {
        let intervalId;
        let cleanupFn;

        const handleEnded = () => {
            if (onEndedRef.current) {
                onEndedRef.current();
            }
        };

        const tryAttach = () => {
            const player = ref.current?.plyr;
            // Check if player is the actual Plyr instance with the .on method
            if (player && typeof player.on === 'function') {
                try {
                    player.on('ended', handleEnded);
                    cleanupFn = () => {
                        try {
                            // Ensure player still has .off method during cleanup
                            if (typeof player.off === 'function') {
                                player.off('ended', handleEnded);
                            }
                        } catch (e) {
                            // Ignore cleanup errors
                        }
                    };
                    return true;
                } catch (e) {
                    console.error("Error attaching Plyr listener:", e);
                }
            }
            return false;
        };

        // Try to attach immediately
        if (!tryAttach()) {
            // If not available yet, poll until it is
            // This handles the async initialization of Plyr or re-creation of instance
            intervalId = setInterval(() => {
                if (tryAttach()) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }, 200);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (cleanupFn) cleanupFn();
        };
    }, [processedSource]); // Re-bind if source changes

    return (
        <div className="relative w-full h-full group video-player-wrapper">
            <Plyr ref={ref} options={plyrOptions} source={processedSource} />
            {isYouTube && (
                <div
                    className="absolute top-0 left-0 w-full h-16 z-[1] bg-transparent"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    style={{ pointerEvents: 'auto' }}
                />
            )}
        </div>
    );
};

export default VideoPlayer;
