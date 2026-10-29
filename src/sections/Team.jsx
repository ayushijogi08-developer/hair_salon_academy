import React, { useState, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { siteData, resolveTeamPhoto } from '../data/site';
import { SectionEyebrowRow } from '../components/MotionText';
import { isPreviewMode, getSampleTeam } from '../lib/preview';

const getInitials = (name) => {
  if (!name) return 'HC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const TeamMemberCard = ({ member }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(member.name);
  const photoSrc = resolveTeamPhoto(member.photo) || (typeof member.photo === 'string' && member.photo.startsWith('data:') ? member.photo : null);
  const showPhoto = Boolean(photoSrc && !imgFailed);

  return (
    <article className="team-card">
      <div className="team-photo-frame">
        {member.isSample && (
          <span className="team-sample-badge" aria-label="Sample team member">SAMPLE</span>
        )}
        {showPhoto ? (
          <img
            src={photoSrc}
            alt={member.name}
            width="400"
            height="500"
            className="team-photo-img"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="team-initials-fallback" aria-label={`Initials for ${member.name}`}>
            <span className="team-initials-text">{initials}</span>
          </div>
        )}
      </div>

      <div className="team-card-header">
        <span className="team-role">{member.role}</span>
        {member.experience && <span className="team-exp">{member.experience}</span>}
      </div>

      <h3 className="team-name">{member.name}</h3>
      {member.bio && <p className="team-bio">{member.bio}</p>}
    </article>
  );
};

export const Team = () => {
  const confirmed = siteData.team?.filter((item) => item.confirmed) || [];
  const preview = isPreviewMode();
  const displayTeam = confirmed.length > 0 ? confirmed : (preview ? getSampleTeam() : []);
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (displayTeam.length === 0) return;

    const mm = gsap.matchMedia(sectionRef.current);
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { reduceMotion } = context.conditions;
        if (reduceMotion) {
          gsap.set('.team-card', { opacity: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          '.team-card',
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              once: true
            }
          }
        );
      }
    );

    return () => mm.revert();
  }, [displayTeam.length]);

  if (displayTeam.length === 0) {
    return null;
  }

  return (
    <section id="team" className="section team-section" ref={sectionRef} aria-labelledby="team-title">
      <div className="container">
        <SectionEyebrowRow label="The Artists" />
        <div style={{ maxWidth: '640px', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <h2 id="team-title" style={{ marginBottom: '1rem' }}>
            Our Team
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Skilled stylists, colour technicians, and certified educators dedicated to personalized hair craft.
          </p>
        </div>

        <div className="team-grid">
          {displayTeam.map((member, idx) => (
            <TeamMemberCard key={member.id || idx} member={member} />
          ))}
        </div>
      </div>

      <style>{`
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.75rem;
        }

        .team-card {
          padding: 1.75rem;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border-radius: 8px;
          transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .team-card:hover {
          border-color: var(--color-accent);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(25, 22, 20, 0.08);
        }

        .team-photo-frame {
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          margin-bottom: 0.5rem;
          position: relative;
        }

        /* Editorial duotone-to-colour hover transition */
        .team-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(85%) sepia(18%) brightness(0.94) contrast(1.05);
          transition: filter 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .team-card:hover .team-photo-img {
          filter: grayscale(0%) sepia(0%) brightness(1) contrast(1.02);
          transform: scale(1.04);
        }

        .team-sample-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 4;
          background: #B34040;
          color: #FAF8F5;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .team-initials-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface) 100%);
        }

        .team-initials-text {
          font-family: var(--font-serif);
          font-size: clamp(2.5rem, 6vw, 3.75rem);
          font-weight: 500;
          color: var(--color-accent);
          letter-spacing: 0.05em;
          user-select: none;
        }

        .team-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .team-role {
          font-size: var(--size-micro);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-accent);
          font-weight: 600;
        }

        .team-exp {
          font-size: var(--size-micro);
          color: var(--color-muted);
        }

        .team-name {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--color-text);
          letter-spacing: -0.01em;
        }

        .team-bio {
          font-size: 0.9rem;
          color: var(--color-muted);
          line-height: 1.55;
        }
      `}</style>
    </section>
  );
};

export default Team;
