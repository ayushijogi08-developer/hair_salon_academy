import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <main
      id="main-content"
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1.25rem, 4.5vw, 4rem)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(6rem, 20vw, 14rem)',
          lineHeight: 1,
          color: 'var(--color-border)',
          display: 'block',
          marginBottom: '1.5rem',
        }}
        aria-hidden="true"
      >
        404
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          marginBottom: '1rem',
        }}
      >
        Page not found
      </h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: '2.5rem', maxWidth: '38ch' }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <span>Back to home</span>
        <span className="btn-arrow">→</span>
      </Link>
    </main>
  );
};
