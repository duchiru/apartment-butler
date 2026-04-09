import { memo, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

const DOT_SIZE = 4;
const DOT_GAP = 24;

function DotGridBackground() {
  const { width, height } = useWindowDimensions();

  const dots = useMemo(() => {
    const columnCount = Math.ceil(width / DOT_GAP) + 1;
    const rowCount = Math.ceil(height / DOT_GAP) + 1;

    return Array.from({ length: rowCount * columnCount }, (_, index) => {
      const row = Math.floor(index / columnCount);
      const column = index % columnCount;

      return {
        key: `${row}-${column}`,
        top: row * DOT_GAP,
        left: column * DOT_GAP,
      };
    });
  }, [height, width]);

  return (
    <View pointerEvents="none" style={styles.dotGrid}>
      {dots.map((dot) => (
        <View
          key={dot.key}
          style={[styles.dot, { top: dot.top, left: dot.left }]}
        />
      ))}
    </View>
  );
}

export default memo(DotGridBackground);

const styles = StyleSheet.create({
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F3F4F6",
  },
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "rgba(29, 78, 216, 0.18)",
  },
});
