import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";

export const useNavParams = <T>() => {
  const { params } = useLocalSearchParams();

  return useMemo(() => {
    if (typeof params !== "string") return {} as T;
    try {
      return JSON.parse(params) as T;
    } catch (error) {
      console.log("useNavParams: malformed params", params, error);
      return {} as T;
    }
  }, [params]);
};
