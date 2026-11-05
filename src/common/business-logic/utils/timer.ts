import { useEffect, useState } from "react";

export const useSecondsCountdown = (targetUnixSeconds: number) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return Math.max(0, Math.floor((targetUnixSeconds * 1000 - now) / 1000));
};

export const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const mm = Math.floor(safe / 60);
  const ss = safe % 60;
  return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
};
