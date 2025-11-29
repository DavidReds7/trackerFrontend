import React from 'react';
import '@/assets/css/auth.css';

const AuthScene = ({
  title,
  description,
  circlePosition = 'right',
  children,
  panelState = 'idle'
}) => (
  <section className={`auth-stage auth-stage--${panelState}`} aria-label={title}>
    <div className={`auth-circle auth-circle--${circlePosition}`} aria-hidden />
    <div className={`auth-panel-wrapper auth-panel-wrapper--${circlePosition}`}>
      <article className={`auth-panel auth-panel--${panelState}`}>
        <div className="auth-panel__content">
          <span className="auth-panel__eyebrow">Tracker QR</span>
          <h1>{title}</h1>
          {description && <p className="auth-panel__description">{description}</p>}
          {children}
        </div>
      </article>
    </div>
  </section>
);

export default AuthScene;

