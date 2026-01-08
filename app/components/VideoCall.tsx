'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VideoCall() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const createRoom = () => {
    const id = Math.random().toString(36).substr(2, 9);
    router.push(`/room/${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Video Call</h1>
      <div className="space-y-4 w-96">
        <button
          onClick={createRoom}
          className="w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 text-lg"
        >
          Create Room
        </button>
        <div className="flex gap-2">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
          <Link href={`/room/${roomId}`} className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700">
            Join
          </Link>
        </div>
      </div>
    </div>
  );
}
