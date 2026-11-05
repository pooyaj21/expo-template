import { useLocalSearchParams } from "expo-router";
import { ExampleDetailPage } from "@/features/example/presentation/ExampleDetailPage";

const ExampleDetailRoute = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExampleDetailPage id={String(id ?? "")} />;
};

export default ExampleDetailRoute;
