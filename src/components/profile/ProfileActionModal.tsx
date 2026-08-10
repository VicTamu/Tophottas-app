import * as React from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '../../theme';

export interface ProfileActionModalState {
  body: string;
  title: string;
}

interface ProfileActionModalProps {
  onClose: () => void;
  state: ProfileActionModalState | null;
}

export function ProfileActionModal({ onClose, state }: ProfileActionModalProps) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={state !== null}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.kicker}>Top$hottas account</Text>
          <Text style={styles.title}>{state?.title}</Text>
          <Text style={styles.copy}>{state?.body}</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#081008',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.hairline,
  },
  kicker: {
    color: '#D5DBC8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  copy: {
    color: '#B7C0AF',
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primaryFill,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.975 }],
  },
});
