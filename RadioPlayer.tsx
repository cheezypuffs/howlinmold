import React, { memo } from 'react';

interface RadioPlayerProps {
  playlistId: string;
}

const RadioPlayer: React.FC<RadioPlayerProps> = memo(({ playlistId }) => {
  if (!playlistId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-slate-500">
        Select a channel to begin.
      </div>
    );
  }

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <iframe
      style={{ borderRadius: '12px' }}
      src={embedUrl}
      width="100%"
      height="100%"
      frameBorder="0"
      allowFullScreen={false}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title={`Spotify Player for playlist ${playlistId}`}
    ></iframe>
  );
});

export default RadioPlayer;
