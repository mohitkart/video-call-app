/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { MaximizeIcon, MinimizeIcon, ShareIcon } from "./Icons";

const SimpleCallLayout = ({
  children,
  roomId,
  participants = [],
  isFullscreen = false,
  onToggleFullscreen,
  onShare,
  className = "",
}:{
  children: React.ReactNode;
  roomId: string;
  participants?: any[];
  isFullscreen?: boolean;
  onToggleFullscreen?: (isFullscreen: boolean) => void;
  onShare?: () => void;
  className?: string;
}) => {
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      if (isCurrentlyFullscreen !== isFullscreen && onToggleFullscreen) {
        onToggleFullscreen(isCurrentlyFullscreen);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen, onToggleFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my video call",
          text: "Join me for a video call on this link:",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
        // Fallback to copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          alert("Room link copied to clipboard!");
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert("Room link copied to clipboard!");
      } else {
        // Final fallback
        onShare?.();
      }
    }
  };

  return (
    <div
      className={`relative h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-slate-500 via-blue-500 to-slate-500 ${className}`}
    >
      {/* Top Bar */}
      <div className="top-0 left-0 right-0 z-40 relative">
        <div className="flex items-center justify-between p-4">
          {/* Room Info */}
          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white font-medium text-sm">
                  Room: {roomId}
                </span>
                <div className="flex items-center space-x-1 text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-[14px]">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
</svg>

                  <span className="text-xs">{participants.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Button and Fullscreen Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-gray-200 hover:text-white hover:bg-white/20 shadow-lg"
              title="Share room link"
            >
              <ShareIcon size={16} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-gray-200 hover:text-white hover:bg-white/20 shadow-lg"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="simpleCallLayoutChildren">{children}</div>
    </div>
  );
};

export default SimpleCallLayout;
