import { StyleSheet, Text, View } from "react-native";

export default function SmartHomePage() {
  return (
    <View style={styles.view}>
      <Text>Smart Home Page</Text>
      <Text style={{ color: "gray", fontSize: 12 }}>
        This feature is under development.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});
