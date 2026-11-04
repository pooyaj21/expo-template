import { useLocalSearchParams } from "expo-router";
import { ExampleDetailScreen } from "@/features/example/presentation/ExampleDetailScreen";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExampleDetailScreen id={id ?? ""} />;
}
