import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function HomePage() {
  return (
    <View>
      <Text>Home Page</Text>
      <Link href="/add-receipt">Scan receipt</Link>
    </View>
  );
}
