import { normalize } from '../helpers/Normalize';

// for width pixel
const widthPixel = (size: number): number => {
  return normalize(size, 'width');
};

// for height pixel
const heightPixel = (size: number): number => {
  return normalize(size, 'height');
};

// for font pixel
const fontPixel = (size: number): number => {
  return heightPixel(size);
};

// for Margin and Padding vertical pixel
const pixelSizeVertical = (size: number): number => {
  return heightPixel(size);
};

// for Margin and Padding horizontal pixel
const pixelSizeHorizontal = (size: number): number => {
  return widthPixel(size);
};

export {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
};
