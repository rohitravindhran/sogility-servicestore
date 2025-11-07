import handleTheme from '@helpers/HandleTheme';
import React, {Component, useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useSelector} from 'react-redux';

const PickerSelect = (props: any) => {
  const {themeData, businessDetails} = useSelector(state => state?.global);
  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);

  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState('');

  return (
    <View style={styles.container}>
      <Dropdown
        style={props?.style || styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={props?.data}
        maxHeight={300}
        mode={props.mode ? props.mode : 'default'}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? props?.placeholder || 'Select items' : '...'}
        searchPlaceholder="Search..."
        value={props?.value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          props?.setValue(item);
          setIsFocus(false);
        }}
        containerStyle={styles.containerStyle}
        itemTextStyle={styles.itemTextStyle}
        activeColor={themeColors?.surfaceColor}
        // selectedStyle={styles.selectedStyle}
        search={false}
        //   renderLeftIcon={() => (
        //     <
        //       style={styles.icon}
        //       color={isFocus ? 'blue' : 'black'}
        //       name="Safety"
        //       size={20}
        //     />
        //   )}
      />
    </View>
  );
};

const useStyle = (themeColors: any) =>
  StyleSheet.create({
    container: {},
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      zIndex: 99999,
      marginTop: 5,
    },
    containerStyle: {
      borderBottomEndRadius: 8,
      borderBottomStartRadius: 8,
      borderTopWidth: 0,
      backgroundColor: themeColors?.surfaceColor,
      borderWidth: 0.2,
      borderColor: themeColors?.textColorMedium,
      marginTop: -2,
    },
    selectedStyle: {
      backgroundColor: '#876',
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
      color: themeColors?.textColorStrong,
    },
    placeholderStyle: {
      fontSize: 16,
      color: themeColors?.textColorStrong,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: themeColors?.textColorStrong,
    },
    itemTextStyle: {
      color: themeColors?.textColorStrong,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  });

export default PickerSelect;
