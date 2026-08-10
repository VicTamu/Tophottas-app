import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';

// Mirrors the store's "Why Top$hottas" trust row: three gold line-icons with
// the brand's value props, under a short gold accent rule + title.

const VALUES: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
}[] = [
  {
    icon: 'flash-outline',
    title: 'Limited drops',
    body: "Small batches, numbered runs. When it's gone, it's gone - no restocks.",
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Built to last',
    body: "Heavyweight cotton and prints that don't crack or fade in the wash.",
  },
  {
    icon: 'cube-outline',
    title: 'Tracked shipping',
    body: "Every order ships tracked, with easy returns if the fit isn't right.",
  },
];

export function WhyTopShottas() {
  return (
    <View>
      <View style={styles.rule} />
      <Text style={styles.title}>Why Top$hottas</Text>
      <View style={styles.card}>
        {VALUES.map((value, index) => (
          <View
            key={value.title}
            style={[styles.row, index > 0 && styles.rowDivider]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={value.icon} size={20} color={colors.gold} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{value.title}</Text>
              <Text style={styles.rowBody}>{value.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rule: {
    width: 32,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.gold,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.1,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSurface,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  rowBody: {
    color: colors.textBody,
    fontSize: 13,
    lineHeight: 19,
  },
});
