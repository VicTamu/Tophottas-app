import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useAnimatedValue,
  View,
} from 'react-native';

import { EditProfileModal } from './src/components/profile/EditProfileModal';
import {
  ProfileActionModal,
  type ProfileActionModalState,
} from './src/components/profile/ProfileActionModal';
import { ProfileScreen } from './src/components/profile/ProfileScreen';
import { BrandBlock } from './src/components/storefront/BrandBlock';
import { ProductCard } from './src/components/storefront/ProductCard';
import { ProductGlyph } from './src/components/storefront/ProductGlyph';
import { SectionHeader } from './src/components/storefront/SectionHeader';
import { SkeletonCard } from './src/components/storefront/SkeletonCard';
import { TrustStrip } from './src/components/storefront/TrustStrip';
import { WhyTopShottas } from './src/components/storefront/WhyTopShottas';
import { collectionLabels, collectionTabs, navTabs } from './src/constants/storefront';
import { useCart } from './src/hooks/useCart';
import { catalogService } from './src/services/catalog';
import { isShopifyConfigured } from './src/services/shopify';
import { colors, spacing } from './src/theme';
import {
  getFirstAvailableSize,
  isProductSoldOut,
  isSizeSoldOut,
} from './src/utils/product';
import type { CustomerProfile, ProfileSectionKey } from './src/types/profile';
import type { TabKey } from './src/types/navigation';
import type { CartItem, CollectionKey, Product, SizeOption } from './src/types/shop';

export default function App() {
  const smokePlayer = useVideoPlayer(require('./assets/TS-Smoky2.mp4'), (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  const reveal = useAnimatedValue(0);
  const cartToast = useAnimatedValue(0);
  const productSheetProgress = useAnimatedValue(0);
  const [activeTab, setActiveTab] = React.useState<TabKey>('home');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = React.useState<CollectionKey>('all');
  const [query, setQuery] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<SizeOption>('M');
  const [cartToastMessage, setCartToastMessage] = React.useState('');
  const [editProfileVisible, setEditProfileVisible] = React.useState(false);
  const [profileActionModal, setProfileActionModal] =
    React.useState<ProfileActionModalState | null>(null);
  const [customerProfile, setCustomerProfile] = React.useState<CustomerProfile>({
    firstName: 'Top$hottas',
    lastName: 'Member',
    email: 'vip@topshottasapparel.com',
    phone: '(312) 555-0147',
  });
  const [profileSections, setProfileSections] = React.useState({
    account: true,
    preferences: false,
  });

  const {
    addToCart,
    cart,
    cartCount,
    checkoutUrl,
    isSyncing: isCartSyncing,
    openCheckout,
    subtotal,
    syncError: cartSyncError,
    updateCartQuantity,
  } = useCart(products);

  React.useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: activeTab === 'home' ? 820 : 520,
      useNativeDriver: true,
    }).start();
  }, [activeTab, reveal]);

  React.useEffect(() => {
    Animated.timing(productSheetProgress, {
      toValue: selectedProduct ? 1 : 0,
      duration: selectedProduct ? 240 : 180,
      useNativeDriver: true,
    }).start();
  }, [productSheetProgress, selectedProduct]);

  const loadCatalog = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [catalog, featured] = await Promise.all([
        catalogService.listProducts(),
        catalogService.getFeaturedProducts(),
      ]);
      setProducts(catalog);
      setFeaturedProducts(featured);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'We couldn’t reach the store right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const filteredProducts = products.filter((product) => {
    if (selectedCollection !== 'all' && product.collection !== selectedCollection) return false;
    if (!query.trim()) return true;
    const normalized = query.trim().toLowerCase();
    return [product.name, product.tagline, product.description, product.mood]
      .join(' ')
      .toLowerCase()
      .includes(normalized);
  });

  const cartItems = cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as Array<CartItem & { product: Product }>;

  const handleAddToCart = async (product: Product, size: SizeOption) => {
    await addToCart(product, size);
    setCartToastMessage(`${product.name} added to cart`);
    cartToast.stopAnimation();
    cartToast.setValue(0);
    Animated.sequence([
      Animated.timing(cartToast, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(cartToast, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(getFirstAvailableSize(product));
  };

  const openCollection = (collection: CollectionKey) => {
    setSelectedCollection(collection);
    setActiveTab('shop');
  };

  const makeRevealStyle = (delay: number) => ({
    opacity: reveal.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 0.28, 1],
    }),
    transform: [
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [
            (activeTab === 'home' ? 24 : 12) + delay * (activeTab === 'home' ? 0.1 : 0.05),
            0,
          ],
        }),
      },
      activeTab === 'home'
        ? {
            scale: reveal.interpolate({
              inputRange: [0, 1],
              outputRange: [0.985, 1],
            }),
          }
        : {
            scale: reveal.interpolate({
              inputRange: [0, 1],
              outputRange: [0.995, 1],
            }),
          },
    ],
  });

  const cartToastStyle = {
    opacity: cartToast,
    transform: [
      {
        translateY: cartToast.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const productModalSheetStyle = {
    opacity: productSheetProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.72, 1],
    }),
    transform: [
      {
        translateY: productSheetProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [34, 0],
        }),
      },
      {
        scale: productSheetProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.985, 1],
        }),
      },
    ],
  };

  const loadErrorCard = (
    <View style={styles.infoCard}>
      <View style={styles.emptyStateArtwork}>
        <View style={styles.emptyStateRing} />
        <Ionicons name="cloud-offline-outline" size={26} color={colors.brass} />
      </View>
      <View style={styles.infoBadge}>
        <Ionicons name="alert-circle-outline" size={18} color="#DDE3D6" />
        <Text style={styles.infoBadgeText}>Connection hiccup</Text>
      </View>
      <Text style={styles.infoTitle}>We couldn’t load the latest drops</Text>
      <Text style={styles.infoText}>{loadError}</Text>
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        onPress={() => void loadCatalog()}
      >
        <Text style={styles.primaryButtonText}>Try again</Text>
      </Pressable>
    </View>
  );

  const homeView = (
    <>
      <Animated.View style={[styles.heroCard, makeRevealStyle(0)]}>
        <View style={styles.glassHighlight} />
        <View pointerEvents="none" style={styles.heroGlow} />
        <View style={styles.heroMetaRow}>
          <View style={styles.heroEditorialTag}>
            <Text style={styles.heroEditorialTagText}>Top$hottas Apparel</Text>
          </View>
        </View>
        <Text style={styles.heroLabel}>VOL. 01</Text>
        <Text style={styles.heroHeadline}>Quiet fit. Loud presence.</Text>
        <Text style={styles.heroText}>
          Premium streetwear. List members shop Vol. 01 first, 24h before it's public.
        </Text>
        <View style={[styles.heroActions, styles.heroActionsCentered]}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              styles.heroPrimaryButtonSingle,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => openCollection('all')}
          >
            <Text style={styles.primaryButtonText}>Shop Vol. 01</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View style={makeRevealStyle(40)}>
        <TrustStrip />
      </Animated.View>

      {loadError && !products.length ? (
        <Animated.View style={makeRevealStyle(70)}>{loadErrorCard}</Animated.View>
      ) : (
        <>
          <Animated.View style={makeRevealStyle(70)}>
            <SectionHeader
              title="Featured Drop"
              action="See all"
              onPress={() => openCollection('bestsellers')}
            />
          </Animated.View>
          <Animated.View style={makeRevealStyle(120)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fullBleedCarousel}
              contentContainerStyle={styles.fullBleedCarouselContent}
            >
              <View style={styles.featuredRow}>
                {isLoading
                  ? [0, 1, 2].map((key) => (
                      <SkeletonCard key={key} variant="featured" />
                    ))
                  : featuredProducts.map((product) => {
                      const soldOut = isProductSoldOut(product);
                      return (
                        <Pressable
                          key={product.id}
                          style={({ pressed }) => [styles.featuredCard, pressed && styles.cardPressed]}
                          onPress={() => openProduct(product)}
                        >
                          <View style={styles.featuredImageWrap}>
                            {product.imageUrl ? (
                              <Image
                                source={{ uri: product.imageUrl }}
                                style={styles.featuredImage}
                                resizeMode="cover"
                                accessibilityLabel={product.imageAltText ?? product.name}
                              />
                            ) : (
                              <ProductGlyph
                                accentColor={colors.brass}
                                label={product.shortLabel}
                                large
                              />
                            )}
                            <View style={styles.featuredTag}>
                              <Text style={styles.featuredTagText}>
                                {collectionLabels[product.collection]}
                              </Text>
                            </View>
                            {soldOut ? (
                              <View style={styles.soldOutOverlay}>
                                <Text style={styles.detailSoldOutText}>Sold out</Text>
                              </View>
                            ) : null}
                          </View>
                          <View style={styles.featuredFooter}>
                            <Text style={styles.featuredName} numberOfLines={1}>
                              {product.name}
                            </Text>
                            <View style={styles.priceRow}>
                              <Text style={styles.featuredPrice}>${product.price.toFixed(2)}</Text>
                              {product.compareAtPrice != null &&
                              product.compareAtPrice > product.price ? (
                                <Text style={styles.comparePrice}>
                                  ${product.compareAtPrice.toFixed(2)}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
              </View>
            </ScrollView>
          </Animated.View>
          <Animated.View style={makeRevealStyle(170)}>
            <SectionHeader title="New Arrivals" action="Open shop" onPress={() => openCollection('new')} />
          </Animated.View>
          <Animated.View style={makeRevealStyle(210)}>
            <View style={styles.stack}>
              {isLoading
                ? [0, 1, 2, 3].map((key) => <SkeletonCard key={key} />)
                : products.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdding={isCartSyncing}
                      onOpen={openProduct}
                      onAdd={(item) => void handleAddToCart(item, getFirstAvailableSize(item))}
                    />
                  ))}
            </View>
          </Animated.View>
          <Animated.View style={makeRevealStyle(250)}>
            <WhyTopShottas />
          </Animated.View>
        </>
      )}
    </>
  );

  const hasActiveFilter = query.trim().length > 0 || selectedCollection !== 'all';

  const shopView = (
    <Animated.View style={makeRevealStyle(20)}>
      <SectionHeader
        title="Shop"
        action={isLoading ? 'Loading…' : `${filteredProducts.length} pieces`}
      />
      {isLoading ? (
        <View style={styles.stack}>
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <SkeletonCard key={key} />
          ))}
        </View>
      ) : loadError && !products.length ? (
        loadErrorCard
      ) : filteredProducts.length === 0 ? (
        <View style={styles.infoCard}>
          <View style={styles.emptyStateArtwork}>
            <View style={styles.emptyStateRing} />
            <Text style={styles.emptyStateMark}>TS</Text>
          </View>
          <View style={styles.infoBadge}>
            <Ionicons name="search-outline" size={18} color="#DDE3D6" />
            <Text style={styles.infoBadgeText}>
              {hasActiveFilter ? 'No match found' : 'Shop is empty'}
            </Text>
          </View>
          <Text style={styles.infoTitle}>
            {hasActiveFilter
              ? 'Nothing matched that search'
              : 'No products are live yet'}
          </Text>
          <Text style={styles.infoText}>
            {hasActiveFilter
              ? 'Try another product name, collection, or release.'
              : 'New arrivals and limited releases will show here once products are live.'}
          </Text>
          {hasActiveFilter ? (
            <Pressable
              style={({ pressed }) => [styles.secondaryHeroButton, pressed && styles.buttonPressed]}
              onPress={() => {
                setQuery('');
                setSelectedCollection('all');
              }}
            >
              <Text style={styles.secondaryHeroButtonText}>Clear filters</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.secondaryHeroButton, pressed && styles.buttonPressed]}
              onPress={() => void loadCatalog()}
            >
              <Text style={styles.secondaryHeroButtonText}>Refresh</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.stack}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdding={isCartSyncing}
              onOpen={openProduct}
              onAdd={(item) => void handleAddToCart(item, getFirstAvailableSize(item))}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );

  const cartView = (
    <Animated.View style={[styles.stack, makeRevealStyle(20)]}>
      <SectionHeader title="Your cart" action={`${cartCount} items`} compact />
      {cartItems.length === 0 ? (
        <View style={styles.infoCard}>
          <View style={styles.emptyStateArtwork}>
            <View style={styles.emptyStateRing} />
            <Ionicons name="bag-handle-outline" size={28} color={colors.brass} />
          </View>
          <View style={styles.infoBadge}>
            <Ionicons name="bag-handle-outline" size={18} color="#DDE3D6" />
            <Text style={styles.infoBadgeText}>Ready for your first pickup</Text>
          </View>
          <Text style={styles.infoTitle}>Your cart is empty</Text>
          <Text style={styles.infoText}>
            Small batches, numbered runs. When it's gone, it's gone — no restocks.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => setActiveTab('shop')}
          >
            <Text style={styles.primaryButtonText}>Shop Vol. 01</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.stack}>
            {cartItems.map((item) => (
              <View key={`${item.productId}-${item.selectedSize}`} style={styles.cartCard}>
                <View style={styles.productSwatch}>
                  {item.product.imageUrl ? (
                    <Image
                      source={{ uri: item.product.imageUrl }}
                      style={styles.cartProductImage}
                      resizeMode="cover"
                      accessibilityLabel={item.product.imageAltText ?? item.product.name}
                    />
                  ) : (
                    <ProductGlyph
                      accentColor={colors.brass}
                      label={item.product.shortLabel}
                    />
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productMood}>{`Size ${item.selectedSize}`}</Text>
                  <Text style={styles.productPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                </View>
                <View style={styles.qtyWrap}>
                  <Pressable
                    hitSlop={8}
                    style={({ pressed }) => [styles.qtyButton, pressed && styles.chipPressed]}
                    onPress={() => void updateCartQuantity(item.productId, item.selectedSize, -1)}
                  >
                    <Text style={styles.qtyButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <Pressable
                    hitSlop={8}
                    style={({ pressed }) => [styles.qtyButton, pressed && styles.chipPressed]}
                    onPress={() => void updateCartQuantity(item.productId, item.selectedSize, 1)}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryPrice}>${subtotal.toFixed(2)}</Text>
            <Text style={styles.summaryText}>
              Free shipping over $75 · Tracked · easy 14-day returns.
            </Text>
            {cartSyncError ? <Text style={styles.cartSyncError}>{cartSyncError}</Text> : null}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (!cartItems.length || (isShopifyConfigured() && !checkoutUrl)) &&
                  styles.disabledButton,
                pressed && styles.buttonPressed,
              ]}
              disabled={!cartItems.length || (isShopifyConfigured() && !checkoutUrl)}
              onPress={() => {
                if (checkoutUrl) {
                  void openCheckout();
                }
              }}
            >
              <Text style={styles.primaryButtonText}>
                {checkoutUrl ? 'Checkout' : 'Continue to checkout'}
              </Text>
            </Pressable>
            {isCartSyncing ? <Text style={styles.syncNote}>Updating your bag…</Text> : null}
          </View>
        </>
      )}
    </Animated.View>
  );

  const toggleProfileSection = (section: ProfileSectionKey) => {
    setProfileSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const profileView = (
    <Animated.View style={makeRevealStyle(20)}>
      <ProfileScreen
        onOpenAction={(title, body) => setProfileActionModal({ title, body })}
        onOpenEditProfile={() => setEditProfileVisible(true)}
        onToggleSection={toggleProfileSection}
        profile={customerProfile}
        sections={profileSections}
      />
    </Animated.View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <VideoView
            player={smokePlayer}
            style={styles.smokeVideo}
            contentFit="cover"
            nativeControls={false}
          />
          <View style={styles.backgroundTint} />
        </View>
      <Animated.View pointerEvents="none" style={[styles.cartToast, cartToastStyle]}>
        <Ionicons name="checkmark-circle" size={16} color="#E8E5D1" />
        <Text style={styles.cartToastText}>{cartToastMessage}</Text>
      </Animated.View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BrandBlock compact={activeTab !== 'home'} />
        {activeTab === 'shop' ? (
          <View style={styles.searchCard}>
            <Text style={styles.searchLabel}>Search the shop</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search products or releases"
              placeholderTextColor="#8F978B"
              keyboardAppearance="dark"
              selectionColor="#7AA46D"
              style={styles.searchInput}
            />
          </View>
        ) : null}
        {activeTab === 'shop' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fullBleedCarousel}
            contentContainerStyle={styles.fullBleedCarouselContent}
          >
            <View style={styles.pillRow}>
              {collectionTabs.map((collection) => {
                const active = selectedCollection === collection.key;
                return (
                  <Pressable
                    key={collection.key}
                    style={({ pressed }) => [
                      styles.pill,
                      active && styles.pillActive,
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() => setSelectedCollection(collection.key)}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{collection.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        ) : null}
        {activeTab === 'home' && homeView}
        {activeTab === 'shop' && shopView}
        {activeTab === 'cart' && cartView}
        {activeTab === 'profile' && profileView}
      </ScrollView>
      <View style={styles.bottomNav}>
        {navTabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              {active ? <View style={styles.navActiveGlow} /> : null}
              {active ? <View style={styles.navActiveBar} /> : null}
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={18}
                color={active ? '#D9E2D1' : '#8E978A'}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
              {tab.key === 'cart' && cartCount > 0 ? (
                <View style={styles.navBubble}>
                  <Text style={styles.navBubbleText}>{cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <Modal
        transparent
        animationType="fade"
        visible={selectedProduct !== null}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedProduct(null)}>
          <Animated.View style={[styles.modalSheet, productModalSheetStyle]}>
            <Pressable onPress={() => {}}>
            {selectedProduct ? (
              <>
                <View style={styles.detailHero}>
                  {selectedProduct.imageUrl ? (
                    <Image
                      source={{ uri: selectedProduct.imageUrl }}
                      style={styles.detailHeroImage}
                      resizeMode="cover"
                      accessibilityLabel={selectedProduct.imageAltText ?? selectedProduct.name}
                    />
                  ) : (
                    <Text style={styles.detailHeroText}>{selectedProduct.shortLabel}</Text>
                  )}
                  {isProductSoldOut(selectedProduct) ? (
                    <View style={styles.soldOutOverlay}>
                      <Text style={styles.detailSoldOutText}>Sold out</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.heroLabel}>{selectedProduct.collection}</Text>
                <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
                <Text style={styles.detailTagline}>{selectedProduct.tagline}</Text>
                <Text style={styles.heroText}>{selectedProduct.description}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.detailPrice}>${selectedProduct.price.toFixed(2)}</Text>
                  {selectedProduct.compareAtPrice != null &&
                  selectedProduct.compareAtPrice > selectedProduct.price ? (
                    <Text style={styles.detailComparePrice}>
                      ${selectedProduct.compareAtPrice.toFixed(2)}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.pillRow}>
                  {selectedProduct.sizes.map((size) => {
                    const active = size === selectedSize;
                    const sizeSoldOut = isSizeSoldOut(selectedProduct, size);
                    return (
                      <Pressable
                        key={size}
                        disabled={sizeSoldOut}
                        style={({ pressed }) => [
                          styles.pill,
                          active && styles.pillActive,
                          sizeSoldOut && styles.pillDisabled,
                          pressed && !sizeSoldOut && styles.chipPressed,
                        ]}
                        onPress={() => setSelectedSize(size)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            active && styles.pillTextActive,
                            sizeSoldOut && styles.pillTextDisabled,
                          ]}
                        >
                          {size}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.heroActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryButton,
                      (isProductSoldOut(selectedProduct) ||
                        isSizeSoldOut(selectedProduct, selectedSize) ||
                        isCartSyncing) &&
                        styles.disabledButton,
                      pressed && styles.buttonPressed,
                    ]}
                    disabled={
                      isProductSoldOut(selectedProduct) ||
                      isSizeSoldOut(selectedProduct, selectedSize) ||
                      isCartSyncing
                    }
                    onPress={() => {
                      void handleAddToCart(selectedProduct, selectedSize);
                      setActiveTab('cart');
                      setSelectedProduct(null);
                    }}
                  >
                    {isCartSyncing &&
                    !isProductSoldOut(selectedProduct) &&
                    !isSizeSoldOut(selectedProduct, selectedSize) ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {isProductSoldOut(selectedProduct)
                          ? 'Sold out'
                          : isSizeSoldOut(selectedProduct, selectedSize)
                            ? 'Size unavailable'
                            : 'Add to cart'}
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.secondaryHeroButton, pressed && styles.buttonPressed]}
                    onPress={() => setSelectedProduct(null)}
                  >
                    <Text style={styles.secondaryHeroButtonText}>Close</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
        <EditProfileModal
        visible={editProfileVisible}
        profile={customerProfile}
        onClose={() => setEditProfileVisible(false)}
        onDeleteAccount={() =>
          setProfileActionModal({
            title: 'Delete account',
            body: 'Account deletion will permanently remove your Top$hottas profile and saved customer details once customer accounts are active.',
          })
        }
        onSave={setCustomerProfile}
      />
      <ProfileActionModal
        state={profileActionModal}
        onClose={() => setProfileActionModal(null)}
      />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backgroundLayer: { ...StyleSheet.absoluteFillObject },
  smokeVideo: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  backgroundTint: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(1, 4, 2, 0.58)',
  },
  cartToast: {
    position: 'absolute',
    top: 62,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 28, 16, 0.94)',
    borderWidth: 1,
    borderColor: colors.accentBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cartToastText: {
    color: '#E8E5D1',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: { padding: spacing.lg, paddingBottom: 132, gap: spacing.xl },
  fullBleedCarousel: {
    marginHorizontal: -spacing.lg,
  },
  fullBleedCarouselContent: {
    paddingHorizontal: spacing.lg,
  },
  heroCard: { backgroundColor: 'rgba(255,255,255,0.026)', borderRadius: 28, padding: spacing.xl, gap: spacing.md, borderWidth: 1, borderColor: 'rgba(242,241,236,0.09)', overflow: 'hidden', shadowColor: '#000000', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  glassHighlight: { position: 'absolute', top: 1, left: 1, right: 1, height: 66, backgroundColor: 'rgba(255,255,255,0.055)' },
  heroGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 999, backgroundColor: 'rgba(77,146,73,0.16)', top: -110, right: -30 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  heroEditorialTag: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: 'rgba(242,241,236,0.1)',
  },
  heroEditorialTagText: {
    color: '#E3E8DD',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroLabel: { color: '#D5DBC8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.6 },
  heroHeadline: { color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: '900', letterSpacing: -0.2 },
  heroText: { color: '#B0B9A9', fontSize: 15, lineHeight: 24 },
  heroActions: { flexDirection: 'row', gap: spacing.sm },
  heroActionsCentered: { justifyContent: 'center' },
  primaryButton: { flex: 1, backgroundColor: colors.primaryFill, borderRadius: 18, paddingVertical: 17, alignItems: 'center', borderWidth: 1, borderColor: colors.primaryBorder },
  heroPrimaryButtonSingle: { flexGrow: 0, flexBasis: 220, maxWidth: 240 },
  primaryButtonText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  secondaryHeroButton: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, paddingVertical: 17, alignItems: 'center', borderWidth: 1, borderColor: colors.hairlineStrong },
  secondaryHeroButtonText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  searchCard: { backgroundColor: colors.surface1, borderRadius: 22, borderWidth: 1, borderColor: colors.hairline, padding: spacing.md, gap: spacing.sm, shadowColor: '#000000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 7 },
  searchLabel: { color: '#C4CCBC', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.4 },
  searchInput: { color: colors.text, fontSize: 16, paddingVertical: spacing.sm },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  stack: { gap: spacing.md },
  pillRow: { flexDirection: 'row', gap: spacing.sm },
  pill: { backgroundColor: 'rgba(255,255,255,0.022)', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline },
  pillActive: { backgroundColor: 'rgba(122,164,109,0.18)', borderColor: 'rgba(190,215,178,0.20)' },
  pillDisabled: { opacity: 0.4, borderStyle: 'dashed' },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: '#F6F6F2' },
  pillTextDisabled: { color: colors.mutedText, textDecorationLine: 'line-through' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  comparePrice: { color: colors.mutedText, fontSize: 13, fontWeight: '700', textDecorationLine: 'line-through' },
  detailComparePrice: { color: colors.mutedText, fontSize: 18, fontWeight: '700', textDecorationLine: 'line-through' },
  soldOutOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,8,5,0.62)' },
  soldOutOverlayText: { color: '#E8E5D1', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  detailSoldOutText: { color: '#E8E5D1', fontSize: 14, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  featuredRow: { flexDirection: 'row', gap: spacing.md },
  featuredCard: {
    width: 240,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface1,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },
  featuredImageWrap: {
    width: '100%',
    height: 208,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  featuredTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(4,7,5,0.66)',
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  featuredTagText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  featuredFooter: { padding: spacing.md, gap: spacing.xs },
  featuredName: { color: colors.text, fontSize: 18, lineHeight: 22, fontWeight: '900', letterSpacing: -0.1 },
  featuredPrice: { color: colors.brass, fontSize: 18, fontWeight: '900', letterSpacing: 0.15 },
  productSwatch: { width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.goldBorder, overflow: 'hidden', position: 'relative' },
  productSwatchHalo: { position: 'absolute', width: 52, height: 52, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', top: -8, right: -10 },
  productSwatchMeta: { position: 'absolute', top: 8, left: 8, color: 'rgba(242,241,236,0.72)', fontSize: 7, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  cartProductImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1, gap: 5 },
  productName: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.1 },
  productMood: { color: '#C4CCBC', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.6, marginTop: 3 },
  productPrice: { color: colors.brass, fontSize: 17, fontWeight: '900', marginTop: spacing.xs, letterSpacing: 0.15 },
  infoCard: { backgroundColor: colors.surface1, borderRadius: 24, borderWidth: 1, borderColor: colors.hairline, padding: spacing.lg, gap: spacing.md, shadowColor: '#000000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 7 },
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
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  infoTitle: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.1 },
  infoText: { color: '#B1BAAA', fontSize: 14, lineHeight: 22 },
  emptyStateArtwork: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.022)',
    borderWidth: 1,
    borderColor: 'rgba(183,154,99,0.14)',
    overflow: 'hidden',
  },
  emptyStateRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(183,154,99,0.16)',
  },
  emptyStateMark: {
    color: colors.brass,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  cartCard: { backgroundColor: 'rgba(255,255,255,0.022)', borderRadius: 24, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.hairline, shadowColor: '#000000', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 7 }, elevation: 6 },
  qtyWrap: { alignItems: 'center', gap: spacing.xs },
  qtyButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.hairline },
  qtyButtonText: { color: colors.text, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  qtyValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  summaryCard: { backgroundColor: 'rgba(255,255,255,0.026)', borderRadius: 24, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.hairline, shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 9 }, elevation: 8 },
  summaryLabel: { color: '#C4CCBC', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.8 },
  summaryPrice: { color: colors.brass, fontSize: 32, fontWeight: '900', letterSpacing: -0.3 },
  summaryText: { color: '#B1BAAA', fontSize: 14, lineHeight: 21, marginBottom: spacing.sm },
  cartSyncError: { color: '#E2B2A9', fontSize: 12, lineHeight: 18 },
  syncNote: { color: '#B7C0AF', fontSize: 11, lineHeight: 17, letterSpacing: 0.2 },
  bottomNav: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    backgroundColor: 'rgba(6,10,7,0.94)',
    borderRadius: 24,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    gap: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 9,
    gap: 1,
    position: 'relative',
  },
  navItemActive: { backgroundColor: 'rgba(122,164,109,0.10)' },
  navItemPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  navActiveGlow: {
    position: 'absolute',
    inset: 2,
    borderRadius: 16,
    backgroundColor: 'rgba(122,164,109,0.08)',
  },
  navActiveBar: {
    position: 'absolute',
    bottom: 6,
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.brass,
    opacity: 0.9,
  },
  navLabel: { color: '#98A192', fontSize: 9, fontWeight: '600', letterSpacing: 0.35, textTransform: 'uppercase' },
  navLabelActive: { color: colors.text },
  navBubble: {
    position: 'absolute',
    top: 5,
    right: 15,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: 'rgba(183,154,99,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(183,154,99,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  navBubbleText: { color: colors.brass, fontSize: 9, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#081008', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderColor: colors.hairline },
  detailHero: { height: 160, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.goldBorder, overflow: 'hidden' },
  detailHeroImage: { width: '100%', height: '100%' },
  detailHeroText: { color: colors.text, fontSize: 42, fontWeight: '800' },
  detailTitle: { color: colors.text, fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -0.2 },
  detailTagline: { color: colors.gold, fontSize: 14, fontWeight: '700', letterSpacing: 0.3, marginTop: -spacing.xs },
  detailPrice: { color: colors.brass, fontSize: 31, fontWeight: '900', letterSpacing: -0.2 },
  disabledButton: { opacity: 0.45 },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.985 }] },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.975 }] },
  chipPressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
});
