import { useEffect, useState, useRef } from 'react';
import ChannelButton from './ChannelButton';
import Footer from '../Footer';
import { CONTRACT_ADDRESS } from '../../contract';
import { Howl } from 'howler';

export default function WiiMenu() {
  const [copied, setCopied] = useState(false);
  const musicRef = useRef(null);

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Howl({
        src: ['/wiimenu.mp3'],
        volume: 0.3,
        loop: true,
      });
      musicRef.current.play();
    }
  }, []);

  const baseChannels = [
    {
      name: 'Mii Maker',
      icon: '/miimaker.png',
      onClick: () => (window.location.href = '/miimaker'),
    },
    {
      name: 'Dexscreener',
      icon: '/dexscreener.png',
      onClick: () =>
        window.open(`https://dexscreener.com/bsc/${CONTRACT_ADDRESS}`, '_blank'),
    },
    {
      name: 'X Community',
      icon: '/xcom.png',
      onClick: () =>
        window.open('https://x.com/i/communities/1949866818450932120', '_blank'),
    },
    {
      name: copied ? 'Copied!' : 'CA (Click to Copy)',
      icon: '/ca.png',
      onClick: () => {
        navigator.clipboard.writeText(CONTRACT_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    },
  ];

  return (
    <div className="wii-menu">
      <div className="wii-grid">
        {baseChannels.map((ch, i) => (
          <ChannelButton key={i} {...ch} />
        ))}
      </div>
      <Footer />
    </div>
  );
}
