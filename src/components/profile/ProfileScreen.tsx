import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';
import type { CustomerProfile, ProfileSectionKey } from '../../types/profile';

interface ProfileScreenProps {
  onOpenAction: (title: string, body: string) => void;
  onOpenEditProfile: () => void;
  onToggleSection: (section: ProfileSectionKey) => void;
  profile: CustomerProfile;
  sections: Record<ProfileSectionKey, boolean>;
}

function ProfileActionRow({
  destructive = false,
  detail,
  icon,
  onPress,
  title,
}: {
  destructive?: boolean;
  detail: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  title: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.profileActionRow, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View
        style={[
          styles.profileActionIconWrap,
          destructive && styles.profileActionIconWrapDestructive,
        ]}
      >
        <Ionicons name={icon} size={18} color={destructive ? '#F1C1B9' : '#DDE3D6'} />
      </View>
      <View style={styles.profileActionBody}>
        <Text style={[styles.profileActionTitle, destructive && styles.profileActionTitleDestructive]}>
          {title}
        </Text>
        <Text style={styles.profileActionDetail}>{detail}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={destructive ? '#D7A7A0' : '#889386'}
      />
    </Pressable>
  );
}

function ProfileDropdownCard({
  children,
  expanded,
  icon,
  label,
  onPress,
}: {
  children: React.ReactNode;
  expanded: boolean;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.infoCard}>
      <Pressable
        style={({ pressed }) => [
          styles.profileDropdownHeader,
          !expanded && styles.profileDropdownHeaderCollapsed,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.profileDropdownLabelWrap}>
          <View style={[styles.infoBadge, styles.profileDropdownBadge]}>
            <Ionicons name={icon} size={20} color="#DDE3D6" />
            <Text style={[styles.infoBadgeText, styles.profileDropdownBadgeText]}>{label}</Text>
          </View>
        </View>
      </Pressable>
      {expanded ? <View style={styles.profileDropdownContent}>{children}</View> : null}
    </View>
  );
}

export function ProfileScreen({
  onOpenAction,
  onOpenEditProfile,
  onToggleSection,
  profile,
  sections,
}: ProfileScreenProps) {
  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || 'Top$hottas Member';
  const initials =
    `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase() || 'TS';

  return (
    <View style={styles.stack}>
      <Pressable style={({ pressed }) => [styles.infoCard, pressed && styles.cardPressed]} onPress={onOpenEditProfile}>
        <View style={styles.profileHeroRow}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileHeroCopy}>
            <Text style={styles.profileHeroName}>{displayName}</Text>
            <Text style={styles.profileHeroMeta}>{profile.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#889386" />
        </View>
      </Pressable>

      <ProfileDropdownCard
        expanded={sections.account}
        icon="person-circle-outline"
        label="Account"
        onPress={() => onToggleSection('account')}
      >
        <ProfileActionRow
          icon="location-outline"
          title="Shipping addresses"
          detail="Save delivery locations for faster checkout."
          onPress={() =>
            onOpenAction(
              'Shipping addresses',
              'Every order ships tracked. Save delivery locations for faster checkout when customer accounts are connected.'
            )
          }
        />
        <ProfileActionRow
          icon="receipt-outline"
          title="Order history"
          detail="Review past purchases, tracking, and reorders."
          onPress={() =>
            onOpenAction(
              'Order history',
              'Track purchases, follow shipments, and keep your Top$hottas orders in one place.'
            )
          }
        />
        <ProfileActionRow
          icon="card-outline"
          title="Payment details"
          detail="Manage saved cards and checkout preferences."
          onPress={() =>
            onOpenAction(
              'Payment details',
              'Manage saved cards and checkout preferences. Secure payment management is on the way.'
            )
          }
        />
        <ProfileActionRow
          icon="shield-checkmark-outline"
          title="Security"
          detail="Password changes, sign-in methods, and session control."
          onPress={() =>
            onOpenAction(
              'Security',
              'Update sign-in details and manage account access once customer accounts are active.'
            )
          }
        />
      </ProfileDropdownCard>

      <ProfileDropdownCard
        expanded={sections.preferences}
        icon="settings-outline"
        label="Preferences"
        onPress={() => onToggleSection('preferences')}
      >
        <ProfileActionRow
          icon="notifications-outline"
          title="Notifications"
          detail="Choose drop alerts, order updates, and promo messages."
          onPress={() =>
            onOpenAction(
              'Notifications',
              'Choose alerts for special offers, new arrivals, limited releases, restocks, discounts, and order updates.'
            )
          }
        />
      </ProfileDropdownCard>

      <Pressable
        style={({ pressed }) => [styles.utilityCard, pressed && styles.cardPressed]}
        onPress={() =>
          onOpenAction(
            'Support',
            'Order help, sizing, collabs, or feedback: whatever it is, it lands with a real person. You can also reach @topshottasapparel on Instagram.'
          )
        }
      >
        <View style={[styles.infoBadge, styles.profileDropdownBadge, styles.utilityBadge]}>
          <Ionicons name="headset-outline" size={18} color="#DDE3D6" />
          <Text style={styles.infoBadgeText}>Support</Text>
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.signOutButton, pressed && styles.cardPressed]}
        onPress={() =>
          onOpenAction(
            'Sign out',
            'When customer sign-in is active, this will end your Top$hottas account session.'
          )
        }
      >
        <Ionicons name="log-out-outline" size={18} color="#DDE3D6" />
        <Text style={styles.utilityText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  infoBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  infoBadgeText: {
    color: '#DDE3D6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(122,164,109,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(190,215,178,0.20)',
  },
  profileAvatarText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileHeroCopy: {
    flex: 1,
    gap: 4,
  },
  profileHeroName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  profileHeroMeta: {
    color: '#B7C0AF',
    fontSize: 14,
  },
  profileDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 44,
  },
  profileDropdownHeaderCollapsed: {
    minHeight: 16,
  },
  profileDropdownLabelWrap: {
    width: '100%',
    alignItems: 'center',
  },
  profileDropdownBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
  },
  profileDropdownBadgeText: {
    fontSize: 13,
  },
  profileDropdownContent: {
    marginTop: spacing.sm,
  },
  profileActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  profileActionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  profileActionIconWrapDestructive: {
    backgroundColor: 'rgba(136,45,33,0.18)',
    borderColor: 'rgba(215,167,160,0.18)',
  },
  profileActionBody: {
    flex: 1,
    gap: 3,
  },
  profileActionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  profileActionTitleDestructive: {
    color: '#F1C1B9',
  },
  profileActionDetail: {
    color: '#AEB7A6',
    fontSize: 13,
    lineHeight: 18,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  utilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: spacing.sm,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  utilityBadge: {
    alignSelf: 'center',
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  utilityText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
