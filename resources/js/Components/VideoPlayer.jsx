import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const VideoPlayer = ({ source, autoPlay = false, onEnded }) => {
    const containerRef = useRef(null);
    const playerRef = useRef(null);

    const src = source?.sources?.[0]?.src || source?.src;
    const poster = source?.poster || source?.sources?.[0]?.poster;

    useEffect(() => {
        if (!containerRef.current || !src) return;

        // Clear container DOM cleanly for React 19 safety
        containerRef.current.innerHTML = '';

        const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
        const isVimeo = src.includes('vimeo.com');

        let videoElement;

        if (isYouTube) {
            const getYouTubeId = (url) => {
                const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = String(url).match(regExp);
                return match && match[2].length === 11 ? match[2] : null;
            };
            const videoId = getYouTubeId(src);

            videoElement = document.createElement('div');
            videoElement.setAttribute('data-plyr-provider', 'youtube');
            videoElement.setAttribute('data-plyr-embed-id', videoId);
            if (poster) {
                videoElement.setAttribute('data-poster', poster);
            }
        } else if (isVimeo) {
            const getVimeoId = (url) => {
                const regExp = /(?:vimeo\.com\/)(?:video\/)?([0-9]+)/;
                const match = String(url).match(regExp);
                return match ? match[1] : null;
            };
            const vimeoId = getVimeoId(src);

            videoElement = document.createElement('div');
            videoElement.setAttribute('data-plyr-provider', 'vimeo');
            videoElement.setAttribute('data-plyr-embed-id', vimeoId);
            if (poster) {
                videoElement.setAttribute('data-poster', poster);
            }
        } else {
            videoElement = document.createElement('video');
            videoElement.src = src;
            videoElement.playsInline = true;
            if (poster) {
                videoElement.poster = poster;
                videoElement.setAttribute('data-poster', poster);
            }
        }

        containerRef.current.appendChild(videoElement);

        const player = new Plyr(videoElement, {
            autoplay: autoPlay,
            muted: false,
            volume: 1,
            poster: poster,
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
            hideControls: true,
            clickToPlay: true,
            youtube: {
                noCookie: true,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                modestbranding: 1,
            },
        });

        playerRef.current = player;

        if (onEnded) {
            player.on('ended', onEnded);
        }

        return () => {
            try {
                if (playerRef.current) {
                    playerRef.current.destroy();
                    playerRef.current = null;
                }
            } catch (e) {
                // Ignore cleanup error if already destroyed
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [src, poster, autoPlay, onEnded]);

    if (!src) {
        return (
            <div className="flex h-full items-center justify-center bg-black text-white">
                <p>No video available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full video-player-wrapper">
            <style>{`
                .video-player-wrapper,
                .video-player-wrapper .plyr,
                .video-player-wrapper .plyr--video,
                .video-player-wrapper .plyr__video-wrapper,
                .video-player-wrapper .plyr__video-embed {
                    height: 100% !important;
                    width: 100% !important;
                }
                @keyframes plyr-play-pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        box-shadow: 0 0 0 12px rgba(255, 255, 255, 0);
                        transform: translate(-50%, -50%) scale(1.05);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                .video-player-wrapper .plyr__control--overlaid {
                    background: rgba(255, 255, 255, 0.95) !important;
                    color: #0f172a !important;
                    border-radius: 9999px !important;
                    width: 48px !important;
                    height: 48px !important;
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.4) !important;
                    animation: plyr-play-pulse 2s infinite !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    border: 2px solid rgba(255, 255, 255, 0.8) !important;
                }
                .video-player-wrapper .plyr__control--overlaid svg {
                    fill: #0f172a !important;
                    width: 18px !important;
                    height: 18px !important;
                    margin-left: 2px !important;
                }
                .video-player-wrapper .plyr__control--overlaid:hover {
                    background: #ffffff !important;
                    transform: translate(-50%, -50%) scale(1.1) !important;
                    box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.8) !important;
                }
                .video-player-wrapper .plyr__controls {
                    position: absolute !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    z-index: 20 !important;
                    transition: opacity 0.3s ease, visibility 0.3s ease !important;
                }
                .video-player-wrapper .plyr:not(.plyr--playing):not(:hover) .plyr__controls {
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }
                .video-player-wrapper .plyr.plyr--playing .plyr__controls,
                .video-player-wrapper .plyr:hover .plyr__controls {
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: auto !important;
                }
            `}</style>
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};

export default VideoPlayer;
