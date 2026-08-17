import type { ReactNode } from 'react';
import {
  createBox,
  createText,
  createRestyleComponent,
  createVariant,
  useTheme as useRestyleTheme,
  VariantProps,
  BoxProps,
} from '@shopify/restyle';
import type { Theme } from './index';

export const Box = createBox<Theme>();
export const Text = createText<Theme>();

// A surface with soft elevation. `variant="flat"` drops the shadow for cases
// where the card sits inside another elevated surface.
//
// createRestyleComponent does not thread `children` through on its own, so the
// prop type is spelled out here.
type CardProps = VariantProps<Theme, 'cardVariants'> &
  BoxProps<Theme> & { children?: ReactNode };

export const Card = createRestyleComponent<CardProps, Theme>(
  [createVariant({ themeKey: 'cardVariants' })],
  Box
);

export const useTheme = () => useRestyleTheme<Theme>();
