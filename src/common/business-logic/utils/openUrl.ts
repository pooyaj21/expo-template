import { Linking } from "react-native";

export const openUrl = async (url?: string | null): Promise<boolean> => {
  if (!url) return false;

  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.log("openUrl: failed to open", url, error);
    return false;
  }
};
