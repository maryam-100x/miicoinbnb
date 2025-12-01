// src/pages/MiiMaker.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import { Howl } from 'howler';
import { Link } from 'react-router-dom';

export default function MiiMaker() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

const menuMusicRef = useRef(null);

useEffect(() => {
  if (!menuMusicRef.current) {
    menuMusicRef.current = new Howl({
      src: ['/miieditor.mp3'],
      volume: 0.2,
      loop: true
    });
    menuMusicRef.current.play();
  }
}, []);


  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Audio system
  const playSound = (sound, options = {}) => {
    const sfx = new Howl({
      src: [`/sounds/${sound}.mp3`],
      volume: options.volume || 0.4,
      rate: options.rate || 1,
      stereo: options.pan || 0,
      onend: options.onEnd,
      html5: true
    });
    sfx.play();
  };

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f && f.type.match('image.*')) {
      if (f.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        playSound('error', { pan: -0.5, volume: 0.6 });
        return;
      }
      
      playSound('click', { volume: 0.5, rate: 1.3 });
      if (preview) URL.revokeObjectURL(preview);
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setGenerated(null);
      setError(null);
    } else {
      setError('Please select a valid image file (JPG, PNG)');
      playSound('error', { pan: 0.5, volume: 0.6 });
    }
  }, [preview]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.match('image.*')) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: fileInputRef.current });
    } else {
      setError('Please drop a valid image file');
      playSound('error', { pan: 0, volume: 0.7 });
    }
  }, [handleFileChange]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleGenerate = async () => {
  if (!file) {
    setError('Please select an image first');
    playSound('error', { pan: 0, volume: 0.7 });
    return;
  }

  setLoading(true);
  setProgress(0);
  playSound('startup', { volume: 0.5 });

  const interval = setInterval(() => {
    setProgress(prev => {
      const newVal = prev + Math.random() * 8;
      return newVal > 85 ? 85 : newVal;
    });
  }, 400);

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Image = reader.result.split(',')[1];

    const endpoint = import.meta.env.PROD 
      ? '/api/generate-mii' 
      : 'http://localhost:3001/api/generate-mii';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      const data = await response.json();

      if (!response.ok || !data.miiImage) {
        throw new Error(
          data?.error?.includes("moderation") || data?.details?.includes("safety system")
            ? "Image rejected due to safety filters. Try using a different picture."
            : data?.error || "Failed to generate Mii."
        );
      }

      setProgress(100);
      setTimeout(() => {
        setGenerated(data.miiImage);
        playSound('success', { volume: 0.6, rate: 1.2 });
      }, 500);
    } catch (err) {
      console.error('Mii generation error:', err);
      setError(err.message || 'Failed to generate Mii. Please try again.');
      playSound('error', { volume: 0.8, rate: 0.8 });
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  reader.readAsDataURL(file);
};



  const resetForm = () => {
    playSound('back', { pan: -0.3, volume: 0.5 });
    setFile(null);
    setPreview(null);
    setGenerated(null);
    setError(null);
    fileInputRef.current.value = '';
  };

  const handleSaveMii = () => {
    if (!generated) return;
    
    playSound('click', { volume: 0.5, rate: 1.4 });
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generated}`;
    link.download = 'my-mii-avatar.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  

  return (
    <div className="mii-maker-container">
      <div className="mii-maker-content">
        <motion.div 
          className="mii-maker-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header Section */}
          <div className="mii-maker-header">
            <motion.div 
              className="logo-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
            </motion.div>
            <motion.h1
              className="mii-title"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Mii Avatar Generator (AI)
            </motion.h1>
            <motion.p
              className="mii-subtitle"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Transform your photo into a Nintendo-style Mii
            </motion.p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="error-icon">⚠️</div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          

          {/* Main Content Flow */}
          <div className="mii-maker-flow">
            {!generated ? (
              <>
                {/* Upload Area */}
                <motion.div 
                  ref={dropZoneRef}
                  className={`upload-container ${isDragging ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current.click()}
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-input"
                  />
                  
                  {preview ? (
                    <div className="preview-wrapper">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="preview-image" 
                      />
                      <div className="preview-overlay">
                        <span>Click to change photo</span>
                        <div className="change-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 16L8.586 11.414C8.961 11.039 9.47 10.828 10 10.828C10.53 10.828 11.039 11.039 11.414 11.414L16 16M14 14L15.586 12.414C15.961 12.039 16.47 11.828 17 11.828C17.53 11.828 18.039 12.039 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-content">
                      <div className="upload-icon-container">
                        <div className="upload-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 16C4.79086 16 3 14.2091 3 12C3 9.79086 4.79086 8 7 8C7.5726 8 8.11442 8.12796 8.6 8.35448M12 4V20M15.4 15.6455C15.8856 15.872 16.4274 16 17 16C19.2091 16 21 14.2091 21 12C21 9.79086 19.2091 8 17 8C16.4274 8 15.8856 8.12796 15.4 8.35448M8.6 15.6455L15.4 8.35448M8.6 8.35448L15.4 15.6455" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {!isDragging && (
                          <div className="pulse-ring"></div>
                        )}
                      </div>
                      {isDragging ? (
                        <motion.p 
                          className="upload-text"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                        >
                          Drop your photo here
                        </motion.p>
                      ) : (
                        <>
                          <p className="upload-text">Drag & drop your photo</p>
                          <p className="upload-subtext">or click to browse files</p>
                        </>
                      )}
                      <p className="upload-requirements">JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </motion.div>


                {/* Loading State */}
                {loading && (
                  <motion.div 
                    className="loading-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="loading-header">
                      <h3 className="loading-title">Creating your Mii</h3>
                      <span className="loading-percent">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-track">
                      <motion.div 
                        className="progress-bar"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', damping: 15 }}
                      />
                    </div>
                    <div className="loading-details">
                      <div className="loading-spinner">
                        <div className="spinner-dot"></div>
                        <div className="spinner-dot"></div>
                        <div className="spinner-dot"></div>
                      </div>
                      <p className="loading-text">
                        Analyzing facial features{progress < 30 ? '...' : progress < 70 ? '...applying Mii style...' : '...finalizing details...'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                {preview && !loading && (
                  <motion.div 
                    className="action-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      className="generate-button"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                    >
                      <span className="button-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 3H12C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12V11M21 3H11M21 3V13M21 3L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      Generate Mii
                    </motion.button>

                    <motion.button
                      className="secondary-button"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                    >
                      Start Over
                    </motion.button>
                  </motion.div>
                )}
              </>
            ) : (
              /* Results Display */
              <motion.div 
                className="result-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="result-header">
                  <h2 className="result-title">Your Mii Character</h2>
                  <div className="result-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15V17M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56995 17.3333 3.53225 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    NEW
                  </div>
                </div>
                
                <div className="mii-display">
                  <div className="mii-frame">
                    <img
                      src={`data:image/png;base64,${generated}`}
                      alt="Generated Mii"
                      className="generated-image"
                    />
                    <div className="frame-decoration"></div>
                    <div className="mii-shine"></div>
                  </div>
                </div>

                <div className="share-section">
                  <h3 className="share-title">Share Your Creation</h3>
                  <div className="share-buttons">
                    <motion.button
                      className="save-button"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveMii}
                    >
                      <span className="button-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12H16C16.5523 12 17 11.5523 17 11C17 10.4477 16.5523 10 16 10H8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 14C7.44772 14 7 14.4477 7 15C7 15.5523 7.44772 16 8 16H13C13.5523 16 14 15.5523 14 15C14 14.4477 13.5523 14 13 14H8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      Save Mii
                      
                    </motion.button>
                    
                    <motion.a
  className="twitter-button"
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  href="https://x.com/i/communities/1995633082704019903"
  target="_blank"
  rel="noopener noreferrer"
  style={{ textDecoration: 'none' }}
>
  <span className="button-icon" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>𝕏</span>
  Post in Community
</motion.a>

                  </div>
                </div>

                <motion.button
                  className="create-another-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetForm}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create Another
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer premium={true} />
    </div>
  );
}



