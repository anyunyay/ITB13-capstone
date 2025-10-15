import React from 'react';
import styles from './FeatureCards.module.css';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface FeatureCardsProps {
  cards: FeatureCard[];
  className?: string;
}

export function FeatureCards({ cards, className = '' }: FeatureCardsProps) {
  return (
    <div className={`${styles.featureSection} ${className}`}>
      <div className={styles.featureContainer}>
        <div className={styles.featureGrid}>
          {cards.map((card, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureCardContent}>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureIconText}>{card.icon}</span>
                  </div>
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>
                    {card.title}
                  </h3>
                  <p className={styles.featureDescription}>
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
