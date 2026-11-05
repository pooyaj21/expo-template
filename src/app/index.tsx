import { Redirect } from "expo-router";
import { routes } from "@/common/business-logic/routes/paths";

const Index = () => {
  return <Redirect href={routes.tabs()} />;
};

export default Index;
