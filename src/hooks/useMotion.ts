import { useState, useEffect } from 'react';
import { getSettings } from '../lib/storage';
import { isLowPowerDevice, isSaveData } from '../lib/utils';

export function useMotion() {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = isLowPowerDevice();
    const saveData = isSaveData();

    getSettings().then(settings => {
      if (settings.animationOverride) {
        setShouldAnimate(true);
        return;
      }
      if (settings.reduceMotion || settings.liteMode || prefersReduced || saveData || lowPower) {
        setShouldAnimate(false);
      } else {
        setShouldAnimate(true);
      }
    });
  }, []);

  return shouldAnimate;
}
