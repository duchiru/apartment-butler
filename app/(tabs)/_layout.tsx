import { Tabs } from "expo-router";
import { HomeIcon, UserIcon, WalletIcon, ZapIcon } from "lucide-react-native";

import TabBar from "@/components/tab-bar";

export default function _layout() {
  // Always make sure the number of tabs is even, so that the quick action can be in the middle of the tab bar.
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: (props) => <HomeIcon {...props} />,
        }}
      />
      <Tabs.Screen
        name="smart_home"
        options={{
          tabBarLabel: "Smart Home",
          tabBarIcon: (props) => <ZapIcon {...props} />,
        }}
      />

      {/* Receipt scan quick action in the middle of the tab bar */}

      <Tabs.Screen
        name="finance"
        options={{
          tabBarLabel: "Finance",
          tabBarIcon: (props) => <WalletIcon {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: (props) => <UserIcon {...props} />,
        }}
      />
    </Tabs>
  );
}
