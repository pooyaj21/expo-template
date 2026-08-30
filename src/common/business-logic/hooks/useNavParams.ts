import { useLocalSearchParams } from "expo-router";

/**
 * Read a JSON object passed as a route param. Use it only for genuinely
 * structured navigation payloads — a plain id belongs in the path, where it
 * survives a deep link and a cold start.
 */
export const useNavParams = <T>(): T | undefined => {
  const { params } = useLocalSearchParams<{ params?: string }>();
  if (!params) return undefined;
  try {
    return JSON.parse(params) as T;
  } catch {
    return undefined;
  }
};

export const encodeNavParams = <T>(value: T): string => JSON.stringify(value);
