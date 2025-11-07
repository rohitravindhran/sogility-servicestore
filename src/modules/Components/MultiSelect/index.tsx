import handleTheme from '@helpers/HandleTheme';
import React, {Component, useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useSelector} from 'react-redux';
import { MultiSelect as MultiPicker } from 'react-native-element-dropdown';

const MultiSelect = (props: any) => {
  const {themeData, businessDetails} = useSelector(state => state?.global);
  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);
  const [selected, setSelected] = useState([]);

  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState('');






  return (
    <View style={styles.container}>
 <MultiPicker
        style={props?.style || styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          containerStyle={styles.containerStyle}
          itemTextStyle={styles.itemTextStyle}
          selectedStyle={styles.selectedStyle}
          iconStyle={styles.iconStyle}
          data={props?.data}
          labelField="label"
          valueField="value"
          placeholder={props?.placeholder || "Select items"}
          confirmSelectItem={true}
          value={props?.value}
          search={false}
          searchPlaceholder="Search..."
          onChange={(item:any) => {
            setSelected(item);
            props?.setValue(item);
          }}
          activeColor={themeColors?.surfaceColorSelected}

     
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
      backgroundColor: themeColors?.surfaceColor,
      borderWidth: 0.2,
      borderColor: themeColors?.textColorMedium,
      borderBottomEndRadius: 8,
      borderBottomStartRadius: 8,
      borderTopWidth: 0,

      marginTop: -2,
    },
    selectedStyle: {
      borderRadius: 8,
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
      borderRadius: 8,
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

export default MultiSelect;
