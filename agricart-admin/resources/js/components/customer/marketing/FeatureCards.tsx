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
              className="group bg-white rounded-2xl border-2 border-green-200 p-10 shadow-sm transition-all duration-500 ease-in-out relative min-h-[280px] flex flex-col justify-center hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            >
              {/* Background image with zoom effect */}
              {card.backgroundImage && (
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-in-out group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${card.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}
              
              {/* Enhanced gradient overlay for better text contrast */}
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-2xl z-0 transition-all duration-500 ease-in-out group-hover:from-black/80 group-hover:via-black/50"></div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ease-in-out group-hover:bg-white/95 group-hover:shadow-xl">
                    <span className="text-3xl transition-all duration-500 ease-in-out group-hover:scale-110">{card.icon}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4 text-white transition-all duration-500 ease-in-out group-hover:text-white drop-shadow-lg">
                    {card.title}
                  </h3>
                  <p className="text-gray-100 leading-relaxed text-base transition-all duration-500 ease-in-out group-hover:text-white drop-shadow-md">
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
