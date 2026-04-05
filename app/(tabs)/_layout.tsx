import { Tabs } from "expo-router";

export default function _layout() {
  // Always make sure the number of tabs is even, so that the quick action can be in the middle of the tab bar.
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ tabBarLabel: "Home" }} />
      <Tabs.Screen name="utilities" options={{ tabBarLabel: "Utilities" }} />

      {/* Receipt scan quick action in the middle of the tab bar */}

      <Tabs.Screen name="expenses" options={{ tabBarLabel: "Expenses" }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
