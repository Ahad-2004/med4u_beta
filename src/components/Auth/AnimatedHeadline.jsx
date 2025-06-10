import React, { useEffect, useRef } from 'react';

const AnimatedHeadline = ({ text }) => {
  const headlineRef = useRef(null);

  useEffect(() => {
    if (headlineRef.current) {
      // No animation, just static rendering
    }
  }, [text]);

  return (
    <h1
      ref={headlineRef}
      className="text-4xl md:text-6xl font-extrabold text-center text-blue-600 tracking-widest mb-4 drop-shadow-xl"
      style={{ letterSpacing: '0.1em', userSelect: 'none' }}
    >
      {text}
    </h1>
  );
};

export default AnimatedHeadline;
