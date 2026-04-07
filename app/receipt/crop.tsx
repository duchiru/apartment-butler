import { PlatformPressable } from "@react-navigation/elements";
import { Image } from "expo-image";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react-native";
import React from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_CROP_SIZE = 50;

export default function CropScreen() {
  const router = useRouter();
  const { photo } = useLocalSearchParams<{ photo: string }>();

  const [containerSize, setContainerSize] = React.useState({
    width: 0,
    height: 0,
  });
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [processing, setProcessing] = React.useState(false);

  // Crop box position and size (shared values for gesture handling)
  const cropX = useSharedValue(0);
  const cropY = useSharedValue(0);
  const cropWidth = useSharedValue(0);
  const cropHeight = useSharedValue(0);

  // Stored values for gesture context
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);

  // Calculate displayed image dimensions while maintaining aspect ratio
  const displayedImageSize = React.useMemo(() => {
    if (
      !containerSize.width ||
      !containerSize.height ||
      !imageSize.width ||
      !imageSize.height
    ) {
      return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
    }

    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = imageSize.width / imageSize.height;

    let displayWidth: number;
    let displayHeight: number;

    if (imageAspect > containerAspect) {
      // Image is wider than container
      displayWidth = containerSize.width;
      displayHeight = containerSize.width / imageAspect;
    } else {
      // Image is taller than container
      displayHeight = containerSize.height;
      displayWidth = containerSize.height * imageAspect;
    }

    return {
      width: displayWidth,
      height: displayHeight,
      offsetX: (containerSize.width - displayWidth) / 2,
      offsetY: (containerSize.height - displayHeight) / 2,
    };
  }, [containerSize, imageSize]);

  // Initialize crop box to full image
  const initializeCropBox = React.useCallback(() => {
    if (displayedImageSize.width > 0 && displayedImageSize.height > 0) {
      const padding = 20;
      cropX.value = displayedImageSize.offsetX + padding;
      cropY.value = displayedImageSize.offsetY + padding;
      cropWidth.value = displayedImageSize.width - padding * 2;
      cropHeight.value = displayedImageSize.height - padding * 2;
    }
  }, [displayedImageSize, cropX, cropY, cropWidth, cropHeight]);

  React.useEffect(() => {
    initializeCropBox();
  }, [initializeCropBox]);

  const handleContainerLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setContainerSize({ width, height });
    },
    [],
  );

  const handleImageLoad = React.useCallback(
    (event: { source: { width: number; height: number } }) => {
      setImageSize({
        width: event.source.width,
        height: event.source.height,
      });
    },
    [],
  );

  // Clamp helper function
  const clamp = (value: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(value, min), max);
  };

  // Pan gesture for moving the crop box
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = cropX.value;
      startY.value = cropY.value;
    })
    .onUpdate((event) => {
      const minX = displayedImageSize.offsetX;
      const minY = displayedImageSize.offsetY;
      const maxX =
        displayedImageSize.offsetX + displayedImageSize.width - cropWidth.value;
      const maxY =
        displayedImageSize.offsetY +
        displayedImageSize.height -
        cropHeight.value;

      cropX.value = clamp(startX.value + event.translationX, minX, maxX);
      cropY.value = clamp(startY.value + event.translationY, minY, maxY);
    });

  // Pinch gesture for resizing the crop box
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
      startX.value = cropX.value;
      startY.value = cropY.value;
    })
    .onUpdate((event) => {
      const newWidth = startWidth.value * event.scale;
      const newHeight = startHeight.value * event.scale;

      const minX = displayedImageSize.offsetX;
      const minY = displayedImageSize.offsetY;

      // Clamp the new dimensions
      const clampedWidth = clamp(
        newWidth,
        MIN_CROP_SIZE,
        displayedImageSize.width,
      );
      const clampedHeight = clamp(
        newHeight,
        MIN_CROP_SIZE,
        displayedImageSize.height,
      );

      // Center the crop box while scaling
      const centerX = startX.value + startWidth.value / 2;
      const centerY = startY.value + startHeight.value / 2;

      let newX = centerX - clampedWidth / 2;
      let newY = centerY - clampedHeight / 2;

      // Ensure crop box stays within bounds
      newX = clamp(newX, minX, minX + displayedImageSize.width - clampedWidth);
      newY = clamp(
        newY,
        minY,
        minY + displayedImageSize.height - clampedHeight,
      );

      cropWidth.value = clampedWidth;
      cropHeight.value = clampedHeight;
      cropX.value = newX;
      cropY.value = newY;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const cropBoxStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: cropX.value,
    top: cropY.value,
    width: cropWidth.value,
    height: cropHeight.value,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
  }));

  const handleCrop = React.useCallback(async () => {
    if (!photo || processing) return;

    setProcessing(true);

    try {
      // Calculate crop coordinates relative to original image
      const scaleX = imageSize.width / displayedImageSize.width;
      const scaleY = imageSize.height / displayedImageSize.height;

      const originX = (cropX.value - displayedImageSize.offsetX) * scaleX;
      const originY = (cropY.value - displayedImageSize.offsetY) * scaleY;
      const width = cropWidth.value * scaleX;
      const height = cropHeight.value * scaleY;

      const result = await manipulateAsync(
        photo,
        [
          {
            crop: {
              originX: Math.max(0, originX),
              originY: Math.max(0, originY),
              width: Math.min(width, imageSize.width - originX),
              height: Math.min(height, imageSize.height - originY),
            },
          },
        ],
        { compress: 0.9, format: SaveFormat.JPEG },
      );

      router.push({
        pathname: "/receipt/confirm",
        params: { photo: result.uri },
      });
    } catch (error) {
      console.error("Cropping image failed with error:", error);
    } finally {
      setProcessing(false);
    }
  }, [
    photo,
    processing,
    imageSize,
    displayedImageSize,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    router,
  ]);

  const handleCropFromJS = React.useCallback(() => {
    handleCrop();
  }, [handleCrop]);

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

        <Text style={styles.headerTitle}>Crop Image</Text>

        <PlatformPressable
          style={styles.headerButton}
          onPress={initializeCropBox}
        >
          <RotateCcwIcon size={24} color="#fff" />
        </PlatformPressable>
      </View>

      {/* Image with crop overlay */}
      <View style={styles.previewWrapper}>
        <View style={styles.previewContainer} onLayout={handleContainerLayout}>
          {photo && (
            <Image
              source={{ uri: photo }}
              style={styles.preview}
              contentFit="contain"
              onLoad={handleImageLoad}
            />
          )}

          {/* Crop overlay */}
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={cropBoxStyle}>
              {/* Corner handles */}
              <View style={[styles.cornerHandle, styles.topLeft]} />
              <View style={[styles.cornerHandle, styles.topRight]} />
              <View style={[styles.cornerHandle, styles.bottomLeft]} />
              <View style={[styles.cornerHandle, styles.bottomRight]} />
            </Animated.View>
          </GestureDetector>

          {/* Dimmed overlay outside crop area */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.dimOverlay} />
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <PlatformPressable
          style={[
            styles.confirmButton,
            processing && styles.confirmButtonDisabled,
          ]}
          onPress={handleCropFromJS}
          disabled={processing}
        >
          <CheckIcon size={28} color="#272727" />
          <Text style={styles.confirmButtonText}>
            {processing ? "Processing..." : "Confirm Crop"}
          </Text>
        </PlatformPressable>
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  previewWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  previewContainer: {
    flex: 1,
    position: "relative",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cornerHandle: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#fff",
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#272727",
  },
});
