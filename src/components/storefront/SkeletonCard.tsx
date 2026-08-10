import * as React from 'react';
import { Animated, StyleSheet, useAnimatedValue, View } from 'react-native';

import { colors, spacing } from '../../theme';

interface SkeletonCardProps {
  variant?: 'row' | 'featured';
}

export function SkeletonCard({ variant = 'row' }: SkeletonCardProps) {
  const pulse = useAnimatedValue(0.4);

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 720,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (variant === 'featured') {
    return (
      <View style={styles.featuredCard}>
        <Animated.View style={[styles.featuredArt, { opacity: pulse }]} />
        <View style={styles.featuredFooter}>
          <Animated.View style={[styles.lineLg, { opacity: pulse }]} />
          <Animated.View style={[styles.linePrice, { opacity: pulse }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowCard}>
      <Animated.View style={[styles.rowSwatch, { opacity: pulse }]} />
      <View style={styles.rowBody}>
        <Animated.View style={[styles.lineLg, { opacity: pulse }]} />
        <Animated.View style={[styles.lineSm, { opacity: pulse }]} />
        <Animated.View style={[styles.linePrice, { opacity: pulse }]} />
      </View>
      <Animated.View style={[styles.rowButton, { opacity: pulse }]} />
    </View>
  );
}

const bone = 'rgba(242,241,236,0.10)';

const styles = StyleSheet.create({
  rowCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  rowSwatch: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: bone,
  },
  rowBody: { flex: 1, gap: 8 },
  rowButton: {
    width: 56,
    height: 38,
    borderRadius: 16,
    backgroundColor: bone,
  },
  featuredCard: {
    width: 240,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface1,
  },
  featuredArt: {
    width: '100%',
    height: 208,
    backgroundColor: bone,
  },
  featuredFooter: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  lineLg: {
    height: 16,
    width: '70%',
    borderRadius: 8,
    backgroundColor: bone,
  },
  lineSm: {
    height: 11,
    width: '45%',
    borderRadius: 6,
    backgroundColor: bone,
  },
  linePrice: {
    height: 14,
    width: '32%',
    borderRadius: 7,
    backgroundColor: bone,
  },
});
