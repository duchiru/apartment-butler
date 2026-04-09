import { StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.view}>
      <Text>Login Screen</Text>
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
