import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  useAnimatedValue,
  View,
} from 'react-native';

import { colors, spacing } from '../../theme';

// Mirrors the store's hero marquee (.ts-hero__marquee): a translucent strip
// with an infinite, linear ticker of trust points. Honors reduced-motion.

const TRUST_POINTS = ['Free shipping over $75', 'Tracked', 'Easy 14-day returns'];

// Pixels-per-second scroll speed (the web ticker is ~40px/s).
const SPEED = 42;

const monospace = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

function TickerRow({ onLayout }: { onLayout?: (width: number) => void }) {
  return (
    <View
      style={styles.row}
      onLayout={onLayout ? (event) => onLayout(event.nativeEvent.layout.width) : undefined}
    >
      {TRUST_POINTS.map((point) => (
        <React.Fragment key={point}>
          <Text style={styles.item}>{point}</Text>
          <Text style={styles.dot}>|</Text>
        </React.Fragment>
      ))}
    </View>
  );
}

export function TrustStrip() {
  const translateX = useAnimatedValue(0);
  const [rowWidth, setRowWidth] = React.useState(0);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  React.useEffect(() => {
    if (rowWidth === 0 || reduceMotion) {
      translateX.setValue(0);
      return;
    }
    translateX.setValue(0);
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -rowWidth,
        duration: (rowWidth / SPEED) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rowWidth, reduceMotion, translateX]);

  return (
    <View style={styles.strip}>
      {reduceMotion ? (
        <TickerRow />
      ) : (
        <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
          <TickerRow onLayout={setRowWidth} />
          <TickerRow />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    marginHorizontal: -spacing.lg,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: 'rgba(4,7,5,0.55)',
  },
  track: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  item: {
    fontFamily: monospace,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#9AA394',
  },
  dot: {
    color: colors.gold,
    fontSize: 8,
    marginHorizontal: spacing.md,
  },
});
