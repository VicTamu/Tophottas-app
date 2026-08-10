import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onPress?: () => void;
  compact?: boolean;
}

export function SectionHeader({
  title,
  action,
  onPress,
  compact,
}: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, compact && styles.sectionHeaderCompact]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable style={({ pressed }) => pressed && styles.chipPressed} onPress={onPress}>
          <Text style={styles.sectionLink}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  sectionHeaderCompact: { marginTop: -spacing.xs },
  sectionTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
  sectionLink: {
    color: '#D5DBC8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  chipPressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
});
