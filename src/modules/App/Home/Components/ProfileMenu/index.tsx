import {Colors} from '@constants/Colors';
import ProfileImage from '@modules/App/Home/Components/ProfileImage';
import PopMenu from '@modules/Components/PopMenu';
import { fontPixel } from '@utils/PixelRatio';
import textStyles from '@utils/fonts';
import React, {Component, useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { Divider, Menu } from 'react-native-paper';
import {widthPercentageToDP} from 'react-native-responsive-screen';

const ProfileMenu = (props:any) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const {webViewRef,onAccountPress,onLogoutPress} = props;


  useEffect(() => {
    console.log('showAccountMenu=--', showAccountMenu);
  }, [showAccountMenu]);

  const menuItems = () => {
   var redirectToAccount = `var button = document.querySelectorAll('.fc2.body-text-2-medium');
    if (button[0]) {
      button[0].click();
    }
  `;
  var logout = `var button = document.querySelectorAll('.fc2.body-text-2-medium');
  if (button[1]) {
    button[1].click();
  }
`;
    return(
        <>
        <Menu.Item onPress={() => onAccountPress()} title="My account"
                titleStyle={styles.menuTitleStyle}
                />
        <Divider />
        <Menu.Item onPress={() => onLogoutPress()} title="Logout"
        titleStyle={styles.menuTitleStyle} />
        </>
    )
  }
  return (
    <View style={styles.profile}>
      <PopMenu
        visible={showAccountMenu}
        setVisible={() => setShowAccountMenu(!showAccountMenu)}
        MenuItems={menuItems}
  >
      <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setShowAccountMenu(!showAccountMenu)}>
            <ProfileImage source={''} style={[styles.profileImage]} />
          </TouchableOpacity>
        
  </PopMenu>
        
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    backgroundColor: Colors.profileEmptyStateColor,
    width: widthPercentageToDP('10%'),
    height: widthPercentageToDP('10%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: widthPercentageToDP('5%'),
    shadowColor: textStyles.iosShadow.shadowColor,
    shadowOffset: {
      width: textStyles.iosShadow.shadowOffset.width,
      height: textStyles.iosShadow.shadowOffset.height,
    },
  },
  profileImage: {
    width: widthPercentageToDP('10%'),
    height: widthPercentageToDP('10%'),
    resizeMode: 'cover',
    borderRadius: widthPercentageToDP('5%'),
backgroundColor:'#fff'
  },
  menuTitleStyle:{
    fontSize:fontPixel(18),
    fontFamily:textStyles.regular.fontFamily
  }
});

export default ProfileMenu;
