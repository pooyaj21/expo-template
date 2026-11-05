import { Platform, Share } from "react-native";

export const shareLink = (link: string, title: string) =>
  Share.share(
    Platform.OS === "ios" ? { url: link, title } : { message: link, title },
    { subject: title, dialogTitle: title },
  );
