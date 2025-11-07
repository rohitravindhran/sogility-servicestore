/*

Concept: https://dribbble.com/shots/5476562-Forgot-Password-Verification/attachments

*/
import {Animated, Image, SafeAreaView, Text, View} from 'react-native';
import React, {useState} from 'react';

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import styles, {
  ACTIVE_CELL_BG_COLOR,
  CELL_BORDER_AFTER_ANIMATION,
  CELL_BORDER_RADIUS,
  CELL_SIZE,
  CELL_SIZE_AFTER_ANIMATION,
  DEFAULT_CELL_BG_COLOR,
  NOT_EMPTY_CELL_BG_COLOR,
} from './style';
import handleTheme from '../../../helpers/HandleTheme';
import useStyle from './style';
import { useSelector } from 'react-redux';



const DigitCodeInput = (props:any) => {

  // const [value, setValue] = useState('');
  const {value,setValue} = props;



  const {Value, Text: AnimatedText} = Animated;

  const {cellCount,codeFieldStyle} = props;
  const {themeData, businessDetails} = useSelector(state => state?.global);

  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);

const animationsColor = [...new Array(cellCount)].map(() => new Value(0));
const animationsScale = [...new Array(cellCount)].map(() => new Value(1));
const ref = useBlurOnFulfill({value, cellCount: cellCount});
const [cProps, getCellOnLayoutHandler] = useClearByFocusCell({
  value,
  setValue,
});
const animateCell = ({hasValue, index, isFocused}) => {
  Animated.parallel([
    Animated.timing(animationsColor[index], {
      useNativeDriver: false,
      toValue: isFocused ? 1 : 0,
      duration: 250,
    }),
    Animated.spring(animationsScale[index], {
      useNativeDriver: false,
      toValue: hasValue ? 0 : 1,
      duration: hasValue ? 300 : 250,
    }),
  ]).start();
};

  const renderCell = ({index, symbol, isFocused}) => {
    const hasValue = Boolean(symbol);
    const animatedCellStyle = {
      backgroundColor: hasValue
        ? animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [themeColors?.surfaceColorSelected, themeColors?.surfaceColorSelected],
          })
        : animationsColor[index].interpolate({
            inputRange: [0, 1],
            outputRange: [themeColors?.surfaceColor, themeColors?.surfaceColor],
          }),
      borderRadius: animationsScale[index].interpolate({
        inputRange: [0, 1],
        outputRange: [CELL_SIZE_AFTER_ANIMATION, CELL_BORDER_AFTER_ANIMATION],
      }),
      transform: [
        {
          scale: animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
    };

    // Run animation on next event loop tik
    // Because we need first return new style prop and then animate this value
    setTimeout(() => {
      animateCell({hasValue, index, isFocused});
    }, 0);

    return (
      <AnimatedText
        key={index}
        style={[styles.cell, animatedCellStyle]}
        onLayout={getCellOnLayoutHandler(index)}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </AnimatedText>
    );
  };

  return (
    
      <CodeField
        ref={ref}
        {...cProps}
        value={value}
        onChangeText={(text)=>setValue(text)}
        cellCount={cellCount}
        rootStyle={codeFieldStyle ? codeFieldStyle  : styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        returnKeyType={'done'}
        renderCell={renderCell}
        
        
        
      />
   
  );
};

export default DigitCodeInput;