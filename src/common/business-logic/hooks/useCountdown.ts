import { useCallback, useEffect, useState } from "react";

/**
 * Seconds remaining, ticking down. For "resend code in 0:42" — driven by a
 * target timestamp rather than a decrementing counter, so backgrounding the app
 * does not freeze it.
 */
export const useCountdown = (initialSeconds = 0) => {
  const [targetMs, setTargetMs] = useState(() =>
    initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : 0,
  );
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (targetMs === 0) return;

    const tick = () =>
      setSecondsLeft(Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)));

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const start = useCallback((seconds: number) => {
    setTargetMs(Date.now() + seconds * 1000);
    setSecondsLeft(seconds);
  }, []);

  return { secondsLeft, isRunning: secondsLeft > 0, start };
};
