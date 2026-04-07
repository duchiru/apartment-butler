import { PlatformPressable } from "@react-navigation/elements";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeftIcon, UploadIcon } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmScreen() {
  const router = useRouter();
  const { photo } = useLocalSearchParams<{ photo: string }>();

  const [name, setName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  const uploadReceipt = React.useCallback(
    async (imageUri: string, receiptName: string) => {
      // TODO: Implement upload logic here

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    [],
  );

  const handleUpload = React.useCallback(async () => {
    if (!photo || !name.trim() || uploading) return;

    Keyboard.dismiss();
    setUploading(true);

    try {
      await uploadReceipt(photo, name.trim());

      // Navigate back to the receipt list or home screen
      router.dismissAll();
    } catch (error) {
      console.error("Uploading receipt failed with error:", error);
    } finally {
      setUploading(false);
    }
  }, [photo, name, uploading, uploadReceipt, router]);

  const isUploadDisabled = !name.trim() || uploading;

  return (
    <SafeAreaView style={styles.view}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <PlatformPressable
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <ChevronLeftIcon size={24} color="#fff" />
            </PlatformPressable>

            <Text style={styles.headerTitle}>Confirm Receipt</Text>

            <View style={styles.headerButtonPlaceholder} />
          </View>

          {/* Image preview */}
          <View style={styles.previewWrapper}>
            {photo && (
              <Image
                source={{ uri: photo }}
                style={styles.preview}
                contentFit="contain"
              />
            )}
          </View>

          {/* Name input section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Receipt Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a name for this receipt"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <PlatformPressable
              style={[
                styles.uploadButton,
                isUploadDisabled && styles.uploadButtonDisabled,
              ]}
              onPress={handleUpload}
              disabled={isUploadDisabled}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#272727" />
              ) : (
                <UploadIcon size={24} color="#272727" />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? "Uploading..." : "Upload Receipt"}
              </Text>
            </PlatformPressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#272727",
  },
  container: {
    flex: 1,
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
  headerButtonPlaceholder: {
    width: 48,
    height: 48,
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
  preview: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 8,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#3a3a3a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#4a4a4a",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    width: "100%",
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#272727",
  },
});
