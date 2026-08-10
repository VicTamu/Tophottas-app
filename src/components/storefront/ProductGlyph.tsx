import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProductGlyphProps {
  accentColor: string;
  label: string;
  large?: boolean;
}

export const ProductGlyph = React.memo(function ProductGlyph({
  accentColor,
  label,
  large = false,
}: ProductGlyphProps) {
  return (
    <View
      style={[
        styles.productGlyphWrap,
        large ? styles.productGlyphWrapLarge : styles.productGlyphWrapSmall,
      ]}
    >
      <View style={[styles.productGlyphAura, { backgroundColor: `${accentColor}22` }]} />
      <View style={styles.productGlyphHanger} />
      <View
        style={[
          styles.productGlyphBody,
          large ? styles.productGlyphBodyLarge : styles.productGlyphBodySmall,
          { borderColor: `${accentColor}52`, backgroundColor: `${accentColor}12` },
        ]}
      >
        <View
          style={[
            styles.productGlyphCollar,
            large ? styles.productGlyphCollarLarge : styles.productGlyphCollarSmall,
          ]}
        />
        <Text style={[styles.productGlyphLabel, large && styles.productGlyphLabelLarge]}>
          {label}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  productGlyphWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productGlyphWrapSmall: {
    width: 44,
    height: 44,
    marginTop: 9,
  },
  productGlyphWrapLarge: {
    width: 58,
    height: 58,
  },
  productGlyphAura: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  productGlyphHanger: {
    position: 'absolute',
    top: 4,
    width: 10,
    height: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(242,241,236,0.22)',
  },
  productGlyphBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  productGlyphBodySmall: {
    width: 30,
    height: 28,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  productGlyphBodyLarge: {
    width: 38,
    height: 34,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  productGlyphCollar: {
    position: 'absolute',
    top: -1,
    alignSelf: 'center',
    backgroundColor: '#09110A',
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(242,241,236,0.14)',
    borderTopWidth: 0,
  },
  productGlyphCollarSmall: {
    width: 11,
    height: 5,
  },
  productGlyphCollarLarge: {
    width: 14,
    height: 6,
  },
  productGlyphLabel: {
    color: 'rgba(242,241,236,0.74)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  productGlyphLabelLarge: {
    fontSize: 10,
    letterSpacing: 1.1,
  },
});
