/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/static-components */
import { memo } from "react";
import CustomVideoPlayer from "../CustomVideoPlayer";
import { MicIcon, UserIcon } from "./Icons";

const SimpleVideoGrid = ({
  players,
  highlightedPlayerId,
  onPlayerClick,
  myId,
  className = "",
  isAudioEnabled,
  selectedAudioOutput,
}:{
  players: any | null;
  highlightedPlayerId?: any;
  onPlayerClick?: (playerId: string) => void;
  myId: string;
  className?: string;
  isAudioEnabled: boolean;
  selectedAudioOutput?: string;
}) => {
  const playerEntries:any = Object.entries(players || {});
  const highlightedPlayer = highlightedPlayerId
    ? players[highlightedPlayerId]
    : null;
  const otherPlayers = playerEntries.filter(
    ([id]:any[]) => id !== highlightedPlayerId
  );

  const getGridCols = (count:number) => {
    if (count === 1) return "md:grid-cols-1";
    if (count === 2) return "md:grid-cols-2";
    if (count === 3) return "md:grid-cols-3";
    if (count <= 4) return "md:grid-cols-2";
    return "md:grid-cols-3";
  };

  // Calculate optimal video sizes based on participant count
  const getVideoSize = (count:number, isHighlighted = false) => {

    return {
       minHeight: "425px",
        maxHeight: "calc(100dvh - 90px)",
    }

    if (isHighlighted) {
      return {
        minHeight: "400px",
        maxHeight: "60vh",
      };
    }

    // Dynamic sizing based on participant count
    if (count === 1) {
      return {
        minHeight: "300px",
        maxHeight: "50vh",
      };
    } else if (count === 2) {
      return {
        minHeight: "250px",
        maxHeight: "40vh",
      };
    } else if (count <= 4) {
      return {
        minHeight: "200px",
        maxHeight: "30vh",
      };
    } else {
      return {
        minHeight: "150px",
        maxHeight: "25vh",
      };
    }
  };

  // Memoized PlayerCard component for stability during dynamic changes
  const PlayerCard = memo(
    ({
      playerId,
      player,
      isHighlighted = false,
      totalCount = 1,
      isAudioEnabled,
    }:{
      playerId: any;
      player: any;
      isHighlighted?: boolean;
      totalCount?: number;
      isAudioEnabled: boolean;
    }) => {
      const isMe = playerId === myId;
      const videoSize = getVideoSize(totalCount, isHighlighted);

      return (
        <div
          className={`relative cursor-pointer ${
            isHighlighted ? "col-span-full" : ""
          }`}
          onClick={() => onPlayerClick?.(playerId)}
        >
          {/* Video Container */}
          <div
            className={`relative overflow-hidden backdrop-blur-sm ${
              isHighlighted
                ? "rounded-2xl border-2 border-gradient-to-r from-red-400 via-purple-400 to-blue-400 shadow-2xl bg-white/10"
                : "rounded-2xl border border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
            } ${
              !player.playing
                ? "bg-gradient-to-br from-slate-500 to-blue-900"
                : "bg-black"
            }`}
            style={{
              minHeight: videoSize.minHeight,
              maxHeight: videoSize.maxHeight,
              width: "100%",
              height: "100%",
            }}
          >
            {player.playing ? (
              <CustomVideoPlayer
                src={player.url}
                muted={player.muted}
                playing={player.playing}
                className="object-cover"
                selectedAudioOutput={selectedAudioOutput}
                minHeight={videoSize.minHeight}
                maxHeight={videoSize.maxHeight}
              />
            ) : (
              <div
                className="relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slat-300 to-blue-500 backdrop-blur-sm"
                style={{
                  minHeight: videoSize.minHeight,
                  maxHeight: videoSize.maxHeight,
                  width: "100%",
                  height: "100%",
                }}
              >
                  <div
                    className="text-white"
                  >
                    <UserIcon
                      size={130}
                      className=""
                    />
                  </div>

              </div>
            )}

            {/* User Info Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Mic Status */}
                <div
                  className={`p-1.5 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                    // For your own video, use actual audio state; for others, use audioEnabled or fallback to muted
                    (
                      isMe
                        ? !isAudioEnabled
                        : !(player.audioEnabled ?? !player.muted)
                    )
                      ? "bg-red-500/90 text-white shadow-lg"
                      : "bg-green-500/90 text-white shadow-lg"
                  }`}
                >
                  {(
                    isMe
                      ? !isAudioEnabled
                      : !(player.audioEnabled ?? !player.muted)
                  ) ? (
                    <MicIcon size={isHighlighted ? 16 : 12} />
                  ) : (
                    <MicIcon size={isHighlighted ? 16 : 12} />
                  )}
                </div>

                {/* User Label */}
                <div className={`px-2 py-1 ${isMe?'bg-blue-500':'bg-white/10'} backdrop-blur-lg border border-white/20 rounded-xl text-white text-xs font-medium shadow-lg`}>
                  {isMe ? "You" : `User ${playerId.slice(0, 6)}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison for memoization stability
      return (
        prevProps.playerId === nextProps.playerId &&
        prevProps.player.url === nextProps.player.url &&
        prevProps.player.muted === nextProps.player.muted &&
        prevProps.player.playing === nextProps.player.playing &&
        prevProps.isHighlighted === nextProps.isHighlighted &&
        prevProps.totalCount === nextProps.totalCount &&
        prevProps.isAudioEnabled === nextProps.isAudioEnabled // Add isAudioEnabled to comparison
      );
    }
  );

  PlayerCard.displayName = "PlayerCard";

  return (
    <div
      className={`w-full h-full flex flex-col justify-center items-center ${className}`}
    >
      {/* Main Video Area */}
      {highlightedPlayer && (
        <div className="mb-6 flex justify-center items-center w-full">
          <div className="w-full max-w-4xl mx-auto">
            <PlayerCard
              key={`${highlightedPlayerId}-${highlightedPlayer.url}`}
              playerId={highlightedPlayerId}
              player={highlightedPlayer}
              isHighlighted={true}
              totalCount={playerEntries.length}
              isAudioEnabled={isAudioEnabled} // Pass the prop
            />
          </div>
        </div>
      )}

      {/* Participant Grid */}
      {otherPlayers.length > 0 && (
        <div className="flex justify-center items-center w-full p-2">
          <div
            className={`grid gap-4 grid-cols-full ${getGridCols(
              otherPlayers.length
            )} w-full items-center`}
          >
            {otherPlayers.map(([playerId, player]:any[]) => (
              <PlayerCard
                key={`${playerId}-${player?.url}`}
                playerId={playerId}
                player={player}
                isHighlighted={false}
                totalCount={playerEntries.length}
                isAudioEnabled={isAudioEnabled} // Pass the prop
              />
            ))}
          </div>
        </div>
      )}

      {/* Single player view (when no highlighted player) */}
      {!highlightedPlayer &&
        otherPlayers.length === 0 &&
        playerEntries.length === 1 && (
          <div className="flex justify-center items-center w-full">
            <div className="w-full max-w-3xl mx-auto">
              <PlayerCard
                key={`${playerEntries[0][0]}-${playerEntries[0][1].url}`}
                playerId={playerEntries[0][0]}
                player={playerEntries[0][1]}
                isHighlighted={false}
                totalCount={1}
                isAudioEnabled={isAudioEnabled} // Pass the prop
              />
            </div>
          </div>
        )}

      {/* Empty State */}
      {playerEntries.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <UserIcon size={60} className="text-purple-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">
              Waiting for participants
            </h3>
            <p className="text-gray-300 text-sm">
              Share the room link to invite others
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SimpleVideoGrid, (prevProps, nextProps) => {
  // Memoization for rendering stability during dynamic participant changes
  const prevPlayerIds = Object.keys(prevProps.players || {}).sort();
  const nextPlayerIds = Object.keys(nextProps.players || {}).sort();

  return (
    prevPlayerIds.length === nextPlayerIds.length &&
    prevPlayerIds.every((id, index) => id === nextPlayerIds[index]) &&
    prevProps.highlightedPlayerId === nextProps.highlightedPlayerId &&
    prevProps.myId === nextProps.myId &&
    prevProps.isAudioEnabled === nextProps.isAudioEnabled && // Add this
    JSON.stringify(prevProps.players) === JSON.stringify(nextProps.players)
  );
});