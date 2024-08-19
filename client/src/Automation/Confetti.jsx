import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

export const Confetti = () => {
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isConfettiRunning, setIsConfettiRunning] = useState(true);

  const detectSize = () => {
    setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    window.addEventListener('resize', detectSize);
    return () => {
      window.removeEventListener('resize', detectSize);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConfettiRunning(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div >
      {isConfettiRunning && (
        <ReactConfetti 
          width={windowDimensions.width}
          height={windowDimensions.height}
        />
      )}
    </div>
  );
};