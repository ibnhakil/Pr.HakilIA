import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Play } from 'lucide-react';
import { Button } from '../ui/Button';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: "Bienvenue dans",
      subtitle: "MathisChess",
      description: "L'expérience d'échecs la plus intelligente",
      icon: Crown,
    },
    {
      title: "Rencontrez",
      subtitle: "Pr.HakilIA",
      description: "Votre coach personnel qui vous accompagne à chaque coup",
      icon: Sparkles,
    },
    {
      title: "Prêt à jouer ?",
      subtitle: "C'est parti !",
      description: "La stratégie, c'est l'art de ne pas paniquer.",
      icon: Play,
    }
  ];

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length]);

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center">
      <div className="text-center text-white animate-fade-in">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full mb-6 animate-float">
            <IconComponent className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-light text-white mb-2 animate-slide-up">
            {currentStepData.title}
          </h1>
          
          <h2 className="text-5xl font-bold font-playfair text-white mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {currentStepData.subtitle}
          </h2>
          
          <p className="text-xl text-white opacity-90 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {currentStepData.description}
          </p>
        </div>

        {currentStep === steps.length - 1 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Button
              onClick={handleComplete}
              size="lg"
              className="bg-white text-primary-900 hover:bg-opacity-90 font-semibold px-8 py-4 text-lg"
            >
              Commencer l'aventure
            </Button>
          </div>
        )}

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};