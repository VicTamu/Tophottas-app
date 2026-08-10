import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { spacing } from '../../theme';

interface BrandBlockProps {
  compact?: boolean;
}

export const BrandBlock = React.memo(function BrandBlock({
  compact = false,
}: BrandBlockProps) {
  return (
    <View style={[styles.topLogoWrap, compact && styles.topLogoWrapCompact]}>
      <Image
        source={require('../../../assets/logo-inv-main.png')}
        style={[styles.topLogo, compact && styles.topLogoCompact]}
        resizeMode="contain"
      />
      <Text style={styles.logoSubtitle}>Independent Streetwear</Text>
      <View style={styles.logoDivider} />
    </View>
  );
});

const styles = StyleSheet.create({
  topLogoWrap: { alignItems: 'center', marginTop: -6, marginBottom: spacing.md },
  topLogoWrapCompact: { marginTop: spacing.xs, marginBottom: spacing.md },
  topLogo: { width: 248, height: 86 },
  topLogoCompact: { width: 190, height: 66 },
  logoSubtitle: {
    color: '#C4CCBC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  logoDivider: {
    width: 84,
    height: 1,
    backgroundColor: 'rgba(242,241,236,0.16)',
    marginTop: spacing.sm,
  },
});
