import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable, Text } from "@react-navigation/elements";
import {
  NavigationRoute,
  ParamListBase,
  useLinkBuilder,
  useTheme,
} from "@react-navigation/native";
import { ScanTextIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  const renderButton = React.useCallback(
    (route: NavigationRoute<ParamListBase, string>, index: number) => {
      const { options } = descriptors[route.key];

      const isFocused = state.index === index;
      const label = options.tabBarLabel
        ? typeof options.tabBarLabel === "string"
          ? options.tabBarLabel
          : options.tabBarLabel({
              focused: isFocused,
              color: colors.text,
              position: "below-icon",
              children: options.title ?? route.name,
            })
        : (options.title ?? route.name);
      const icon = options.tabBarIcon
        ? options.tabBarIcon({
            focused: isFocused,
            color: isFocused ? colors.primary : colors.text,
            size: 24,
          })
        : null;

      const onPress = () => {
        const event = navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      };

      return (
        <PlatformPressable
          key={route.key}
          href={buildHref(route.name, route.params)}
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          testID={options.tabBarButtonTestID}
          onPress={onPress}
          style={styles.tabBarButton}
        >
          {icon}
          <Text
            style={{
              color: isFocused ? colors.primary : colors.text,
              fontSize: 10,
            }}
          >
            {label}
          </Text>
        </PlatformPressable>
      );
    },
    [
      buildHref,
      colors.primary,
      colors.text,
      descriptors,
      navigation,
      state.index,
    ],
  );

  const middle = state.routes.length / 2;
  const firstHalf = state.routes.slice(0, middle);
  const secondHalf = state.routes.slice(middle);

  return (
    <View style={styles.tabBar}>
      {firstHalf.map((route, index) => renderButton(route, index))}

      <View style={styles.quickActionContainer}>
        <PlatformPressable
          onPress={() => {
            navigation.navigate("receipt");
          }}
          style={styles.quickActionButton}
        >
          <View
            style={[
              styles.quickActionIconContainer,
              { backgroundColor: colors.primary },
            ]}
          >
            <ScanTextIcon size={28} color="#e0e0e0" />
          </View>
          <Text style={{ fontSize: 10 }}>Scan Receipt</Text>
        </PlatformPressable>
      </View>

      {secondHalf.map((route, index) => renderButton(route, middle + index))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  tabBarButton: {
    paddingVertical: 8,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  quickActionContainer: {
    height: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionButton: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quickActionIconContainer: {
    borderRadius: "50%",
    padding: 10,
  },
});
