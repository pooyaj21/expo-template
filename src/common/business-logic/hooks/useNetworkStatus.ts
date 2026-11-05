import { useEffect, useState } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

const isStateOnline = (state: NetInfoState): boolean =>
  Boolean(state.isConnected) && state.isInternetReachable !== false;

/**
 * Live connectivity for UI (banners, disabled actions). Independent of React
 * Query — call `setupQueryManagers()` separately so the query cache also pauses
 * while offline.
 */
export const useNetworkStatus = (): { isOnline: boolean } => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    void NetInfo.fetch().then((state) => {
      if (mounted) setIsOnline(isStateOnline(state));
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(isStateOnline(state));
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isOnline };
};
