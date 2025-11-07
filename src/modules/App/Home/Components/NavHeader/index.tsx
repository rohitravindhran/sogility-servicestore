import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import brandedConstants from '../../../../../brandedConstants';
import {Images} from '../../../../../constants/Images';
import {ScreenWidth} from '@rneui/base';
import {Colors} from '../../../../../constants/Colors';
import {heightPixel, widthPixel} from '../../../../../utils/PixelRatio';
import {useSelector} from 'react-redux';
import {useEffect} from 'react';
import handleTheme from '../../../../../helpers/HandleTheme';
import ProfileMenu from '@modules/App/Home/Components/ProfileMenu';

const NavHeader = (props: {backPress: any; showMenu: boolean,pressAction:any}) => {
  const [logo, setLogo] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [showBackBar, setShowBackBar] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  const icon = brandedConstants?.Images.splashBackground;

  const {isLoading, isMainRoute, currentRoute, businessDetails, themeData} =
    useSelector(state => state?.global);
  const {backPress, showMenu,pressAction} = props;

  // const themeColor = businessDetails.themeData.color ? `#${businessDetails.themeData.color}` : Colors.white;

  const themeColors = handleTheme(themeData);
  const styles = useStyles(themeColors);

  useEffect(() => {
    // console.log('themeData', themeData);

    if (businessDetails) {
      if (businessDetails?.subdomainData) {
        setLogo(businessDetails?.subdomainData?.businessLogo);
        setBusinessName(businessDetails?.subdomainData?.businessName);
      }
    }
  }, [businessDetails]);

  useEffect(() => {
    console.log('currentRoute', currentRoute);
    //Set Header
    if (isMainRoute) {
      if (currentRoute != 'my-schedule' && currentRoute != 'schedules') {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }
    } else {
      setShowHeader(false);
    }

    //SetFooter
    // if (currentRoute === 'profile') {
    //   setShowBackBar(false);
    // } else {
    //   if (currentRoute == 'subRoute') {
    //     setShowBackBar(true);
    //   } else {
    //     setShowBackBar(false);
    //   }
    // }

    if (currentRoute === 'subRoute') {
      setShowBackBar(false);
    } else {
      if (currentRoute == 'innerRoute') {
        setShowBackBar(true);
      } else {
        setShowBackBar(false);
      }
    }
  }, [isMainRoute, currentRoute]);



  return (
    <>
      {showHeader ? (
        <View style={styles.headerContainer}>
          <View style={styles.leftContent}>
            {logo && <Image source={{uri: logo}} style={styles.logo} />}
            <Text style={styles.businessName}>{businessName}</Text>
          </View>
          <TouchableOpacity style={styles.messageButton}>
            {/* <Image source={Images.messageMenu} style={styles.messageIcon} /> */}
            {/* <ProfileMenu
              onAccountPress={() => pressAction('myAccount')}
              onLogoutPress={() => pressAction('logOut')}
            /> */}
          </TouchableOpacity>
        </View>
      ) : (
        showBackBar && (
          <View style={styles.headerContainer}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.leftContent}
              onPress={backPress}>
              <Image
                source={Images.backArrow}
                style={[
                  styles.logo,
                  {
                    tintColor: themeColors?.textColorStrong,
                    width: widthPixel(25),
                    height: widthPixel(25),
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        )
      )}
    </>
  );
};

const useStyles = (themeColors: any) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      paddingVertical: 8,
      paddingHorizontal: 10,
      width: ScreenWidth,
      height: heightPixel(70),
      zIndex: 9999999,
      elevation: 3,
      shadowColor: themeColors?.textColorMedium,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: themeColors?.borderColor,
      backgroundColor: themeColors?.backgroundColor,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginStart: 10,
    },
    logo: {
      width: widthPixel(35),
      height: widthPixel(35),
      resizeMode:'contain',
    },
    businessName: {
      marginLeft: 8,
      fontSize: 18,
      fontWeight: '800',
      color: themeColors?.textColorStrong,
      fontFamily: 'Inter',
    },
    messageButton: {
      padding: 8,
    },
    messageIcon: {
      width: 30,
      height: 30,
      tintColor: themeColors?.textColorStrong,
    },
  });

export default NavHeader;
