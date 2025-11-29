import { useEffect, useState } from 'react';
import { Howler } from 'howler'; // ✅ add this
import { CONTRACT_ADDRESS } from '../contract';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';


export default function Footer() {
  const [time, setTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false); // ✅ mute state

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
  }).replace(',', '');

  const handleHomeClick = (e) => {
    e.preventDefault();
    const sound = new Audio('/home.wav');
    sound.volume = 0.2;
    sound.play().catch(() => {});
    setTimeout(() => {
      window.location.href = '/menu';
    }, 800);
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    Howler.mute(newMute); // ✅ global mute toggle
  };

  return (
    <div className="wii-footer">
      <div className="footer-left" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
  <a
    href="/menu"
    className="footer-bubble wii-hover-effect"
    onClick={handleHomeClick}
  >
    <span className="footer-label">Home</span>
  </a>

  <button
    onClick={toggleMute}
    className="footer-bubble wii-hover-effect"
    title={isMuted ? 'Unmute Music' : 'Mute Music'}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.3rem' }}
  >
    {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
  </button>
</div>


      <div className="footer-center">
        <div className="clock">{formattedTime}</div>
        <div className="date">{formattedDate}</div>
      </div>

      <div className="footer-right" style={{ display: 'flex', gap: '1rem' }}>
        <a
          href="https://x.com/i/communities/1984329801017278747/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-bubble wii-hover-effect"
        >
          <span style={{ fontSize: '1.8rem' }}>𝕏</span>
        </a>
        <a
          href={`https://pump.fun/coin/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-bubble wii-hover-effect"
        >
          <img src="/pumpfun.png" alt="pump.fun" />
          <span className="footer-label">MiiCoin</span>
        </a>
      </div>
    </div>
  );
}
