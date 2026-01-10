import { CallXIcon, MicIcon, VideoIcon } from "./Icons";

const FloatingControls = ({
  muted,
  playing,
  toggleAudio,
  toggleVideo,
  leaveRoom,
  onTroubleshoot,
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Main Control Bar */}
      <div className="flex items-center space-x-3">
        {/* Audio Control */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-2xl shadow-lg ${
            muted
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transform hover:scale-105"
              : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-gray-200 hover:text-white"
          }`}
          title={muted ? "Unmute microphone" : "Mute microphone"}
        >
          {muted ? <MicIcon size={18} /> : <MicIcon size={18} />}
        </button>

        {/* Video Control */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-2xl shadow-lg ${
            !playing
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transform hover:scale-105"
              : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-gray-200 hover:text-white"
          }`}
          title={!playing ? "Turn on camera" : "Turn off camera"}
        >
          {!playing ? <VideoIcon size={18} /> : <VideoIcon size={18} />}
        </button>

        {/* Leave Call */}
        <button
          onClick={leaveRoom}
          className="p-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg transform hover:scale-105"
          title="Leave call"
        >
          <CallXIcon size={18} />
        </button>

      </div>
    </div>
  );
};

export default FloatingControls;
