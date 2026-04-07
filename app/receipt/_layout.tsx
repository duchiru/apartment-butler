import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="capture" />
      <Stack.Screen name="crop" />
      <Stack.Screen name="confirm" />
    </Stack>
  );
}
