import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, spacing } from '../../theme';
import type { CustomerProfile } from '../../types/profile';

interface EditProfileModalProps {
  onClose: () => void;
  onDeleteAccount: () => void;
  onSave: (profile: CustomerProfile) => void;
  profile: CustomerProfile;
  visible: boolean;
}

export function EditProfileModal({
  onClose,
  onDeleteAccount,
  onSave,
  profile,
  visible,
}: EditProfileModalProps) {
  const [draft, setDraft] = React.useState(profile);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
  const [showDeleteStep, setShowDeleteStep] = React.useState(false);

  React.useEffect(() => {
    setDraft(profile);
    setDeleteConfirmation('');
    setShowDeleteStep(false);
  }, [profile, visible]);

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {showDeleteStep ? (
            <Pressable hitSlop={8} style={({ pressed }) => [styles.closeButton, pressed && styles.buttonPressed]} onPress={onClose}>
              <Ionicons name="close" size={20} color="#DDE3D6" />
            </Pressable>
          ) : null}
          <Text style={styles.kicker}>Account</Text>
          <Text style={styles.title}>Edit profile</Text>
          <Text style={styles.copy}>
            Keep your account details current for checkout, order updates, and Top$hottas account support.
          </Text>
          <View style={styles.fieldStack}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                value={draft.firstName}
                onChangeText={(firstName) => setDraft((current) => ({ ...current, firstName }))}
                placeholder="First name"
                placeholderTextColor="#8F978B"
                keyboardAppearance="dark"
                selectionColor="#7AA46D"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                value={draft.lastName}
                onChangeText={(lastName) => setDraft((current) => ({ ...current, lastName }))}
                placeholder="Last name"
                placeholderTextColor="#8F978B"
                keyboardAppearance="dark"
                selectionColor="#7AA46D"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={draft.email}
                onChangeText={(email) => setDraft((current) => ({ ...current, email }))}
                placeholder="Email"
                placeholderTextColor="#8F978B"
                keyboardType="email-address"
                keyboardAppearance="dark"
                autoCapitalize="none"
                selectionColor="#7AA46D"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                value={draft.phone}
                onChangeText={(phone) => setDraft((current) => ({ ...current, phone }))}
                placeholder="Phone"
                placeholderTextColor="#8F978B"
                keyboardType="phone-pad"
                keyboardAppearance="dark"
                selectionColor="#7AA46D"
                style={styles.input}
              />
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() => {
                onSave(draft);
                onClose();
              }}
            >
              <Text style={styles.primaryButtonText}>Save changes</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
          <View style={styles.deleteCard}>
            {showDeleteStep ? (
              <>
                <Text style={styles.deleteCopy}>
                  This permanently removes your customer account and saved Top$hottas profile details.
                </Text>
                <Text style={styles.deleteInstruction}>Type `DELETE` to confirm account removal.</Text>
                <TextInput
                  value={deleteConfirmation}
                  onChangeText={setDeleteConfirmation}
                  placeholder="Type DELETE"
                  placeholderTextColor="#8F978B"
                  autoCapitalize="characters"
                  keyboardAppearance="dark"
                  selectionColor="#7AA46D"
                  style={styles.input}
                />
                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteButton,
                      deleteConfirmation.trim() !== 'DELETE' && styles.deleteButtonDisabled,
                      pressed && styles.buttonPressed,
                    ]}
                    disabled={deleteConfirmation.trim() !== 'DELETE'}
                    onPress={() => {
                      onDeleteAccount();
                      onClose();
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Delete account</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                    onPress={() => {
                      setShowDeleteStep(false);
                      setDeleteConfirmation('');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Go back</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                onPress={() => setShowDeleteStep(true)}
              >
                <Text style={styles.deleteButtonText}>Delete account</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    letterSpacing: 1.6,
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
  fieldStack: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: '#C4CCBC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primaryFill,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242,241,236,0.12)',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.975 }],
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.hairline,
    zIndex: 2,
  },
  deleteCard: {
    marginTop: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: spacing.sm,
  },
  deleteCopy: {
    color: '#BFA9A4',
    fontSize: 14,
    lineHeight: 20,
  },
  deleteInstruction: {
    color: '#D7C1BC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  deleteButton: {
    minHeight: 54,
    backgroundColor: '#8E2E24',
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B65D52',
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  deleteButtonText: {
    color: '#FFF4F1',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
