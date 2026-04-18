import { useState, useEffect, useCallback, useRef } from 'react';

interface Coordinate {
  lat: number;
  lng: number;
  timestamp: string;
}

export const useActiveTrail = (coordinates: Coordinate[]) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500); // ms
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = coordinates.length;

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(-1);
    setIsPlaying(false);
  }, []);

  const jumpToStep = useCallback((step: number) => {
    if (step >= -1 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  useEffect(() => {
    if (isPlaying) {
      if (currentStep < totalSteps - 1) {
        timerRef.current = setInterval(() => {
          nextStep();
        }, playbackSpeed);
      } else {
        setIsPlaying(false);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStep, totalSteps, nextStep, playbackSpeed]);

  const togglePlay = () => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  return {
    currentStep,
    totalSteps,
    isPlaying,
    nextStep,
    prevStep,
    reset,
    togglePlay,
    jumpToStep,
    playbackSpeed,
    setPlaybackSpeed,
    activeCoordinates: currentStep === -1 ? [] : coordinates.slice(0, currentStep + 1),
    lastCoordinate: currentStep === -1 ? null : coordinates[currentStep],
  };
};
