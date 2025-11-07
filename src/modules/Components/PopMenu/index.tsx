import React, {Children, ReactNode, useEffect, useState} from 'react';

import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, Menu, Divider, PaperProvider} from 'react-native-paper';

const PopMenu = (props: {
  visible: boolean;
  setVisible: Function;
  children: ReactNode;
  MenuItems:any;
}) => {
  const {children, visible, setVisible,MenuItems} = props;

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  //   useEffect(() => {
  //    console.log('visible', visible)
  //   }, [visible])

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        contentStyle={{right:0,marginTop:40,
          paddingVertical:0,
          marginVertical:0,
          marginHorizontal:0,
          justifyContent:'center',
          alignItems:'center',
          
        backgroundColor:'#fff',paddingHorizontal:0}}
      
        anchor={
          <TouchableOpacity activeOpacity={1} onPress={() => setVisible(true)}>
            {children}
          </TouchableOpacity>
        }>
      <MenuItems />
      </Menu>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default PopMenu;


