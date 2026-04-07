import { PlatformPressable } from "@react-navigation/elements";
import {
  CameraView,
  PermissionStatus,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { ChevronLeftIcon, ZapIcon, ZapOffIcon } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CaptureScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = React.useRef<CameraView>(null);
  const [flashOn, setFlashOn] = React.useState(false);

  React.useEffect(() => {
    if (!permission) return;

    if (permission.status === PermissionStatus.UNDETERMINED) {
      requestPermission();
      return;
    }

    if (permission.status === PermissionStatus.DENIED) {
      router.back();
      return;
    }
  }, [permission, requestPermission, router]);

  const captureHandler = React.useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();

      router.push({
        pathname: "/receipt/crop",
        params: { photo: photo.uri },
      });
    } catch (error) {
      console.error("Capturing receipt failed with error:", error);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.view}>
      {/* Header */}
      <View style={styles.header}>
        <PlatformPressable
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeftIcon size={24} color="#fff" />
        </PlatformPressable>

        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          Scan Receipt
        </Text>

        <PlatformPressable
          style={styles.headerButton}
          onPress={() => setFlashOn((prev) => !prev)}
        >
          {flashOn ? (
            <ZapIcon size={24} color="#fff" fill="#fff" />
          ) : (
            <ZapOffIcon size={24} color="#fff" />
          )}
        </PlatformPressable>
      </View>

      {/* Camera preview */}
      <View style={styles.previewWrapper}>
        {permission && permission.granted ? (
          <CameraView
            style={styles.preview}
            ref={cameraRef}
            facing="back"
            flash={flashOn ? "on" : "off"}
          />
        ) : (
          <View style={styles.preview} />
        )}
      </View>

      {/* Capture button and other actions */}
      <View style={styles.footer}>
        <Pressable style={styles.captureButtonOuter} onPress={captureHandler}>
          <View style={styles.captureButtonInner} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#272727",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  previewWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  preview: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 8,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  captureButtonOuter: {
    padding: 6,
    borderRadius: "50%",
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonInner: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#fff",
  },
});
