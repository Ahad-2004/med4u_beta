import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

const AnimatedHeadline = ({ text }) => {
  const headlineRef = useRef(null);

  useEffect(() => {
    if (headlineRef.current) {
      anime({
        targets: headlineRef.current.querySelectorAll('.letter'),
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(60),
        easing: 'easeOutExpo',
        duration: 1200,
      });
    }
  }, [text]);

  return (
    <h1
      ref={headlineRef}
      className="text-4xl md:text-6xl font-extrabold text-center text-blue-600 tracking-widest mb-4 drop-shadow-xl"
      style={{ letterSpacing: '0.1em', userSelect: 'none' }}
    >
      {text.split('').map((char, i) => (
        <span key={i} className="letter inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
};

export default AnimatedHeadline;
