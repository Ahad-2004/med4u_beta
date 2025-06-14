import React, { useEffect, useRef } from 'react';
import * as anime from 'animejs';

const AnimatedHeadline = ({ text }) => {
  const headlineRef = useRef(null);

  useEffect(() => {
    if (headlineRef.current) {
      anime.default({
        targets: headlineRef.current.querySelectorAll('.letter'),
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.default.stagger(60),
        easing: 'easeOutExpo',
        duration: 1200,
      });
    }
  }, [text]);

  return (
    <h1
      ref={headlineRef}
      className="text-5xl md:text-7xl font-extrabold text-center text-blue-600 tracking-widest mb-4 drop-shadow-xl"
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
