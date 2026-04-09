import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function _layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="capture" />
        <Stack.Screen name="crop" />
        <Stack.Screen name="confirm" />
      </Stack>
    </>
  );
}
