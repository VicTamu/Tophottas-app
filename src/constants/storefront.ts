import type { Ionicons } from '@expo/vector-icons';

import type { CollectionKey } from '../types/shop';
import type { TabKey } from '../types/navigation';

export const collectionTabs: { key: CollectionKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'bestsellers', label: 'Featured' },
  { key: 'limited', label: 'Limited' },
];

// Human-friendly label for a product's raw collection key (e.g. "bestsellers" -> "Featured").
export const collectionLabels: Record<CollectionKey, string> = {
  all: 'All',
  new: 'New',
  bestsellers: 'Featured',
  limited: 'Limited',
};

export const navTabs: {
  key: TabKey;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'shop', label: 'Shop', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { key: 'cart', label: 'Cart', icon: 'cart-outline', activeIcon: 'cart' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];
