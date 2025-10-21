import React from 'react';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  backgroundImage?: string;
}

interface FeatureCardsProps {
  cards: FeatureCard[];
  className?: string;
}

export function FeatureCards({ cards, className = '' }: FeatureCardsProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full px-8 max-w-none">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border-2 border-green-200 p-10 shadow-sm transition-all duration-300 ease-in-out relative min-h-[280px] flex flex-col justify-center hover:shadow-2xl hover:-translate-y-1"
              style={card.backgroundImage ? {
                backgroundImage: `url(${card.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : {}}
            >
              {/* Gradient overlay for better text readability */}
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 rounded-2xl z-0"></div>
              <div className="flex items-start gap-6 relative z-10">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4 text-gray-800">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
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
