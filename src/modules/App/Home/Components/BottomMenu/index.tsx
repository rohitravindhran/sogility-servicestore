import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useTheme} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Constants} from '../../../../../constants/Constants';
import {
  fontPixel,
  heightPixel,
  widthPixel,
} from '../../../../../utils/PixelRatio';
import brandedConstants from '../../../../../brandedConstants';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import textStyles from '../../../../../utils/fonts';
import {Fontstyle} from '../../../../../utils/Fontstyle';
import {setLoading} from '../../../../../redux/actions/global';
import {Images} from '../../../../../constants/Images';
import StaticVariables from '../../../../../preference/StaticVariables';
import handleTheme from '../../../../../helpers/HandleTheme';
import {ThemeColors} from 'src/types/themeType';

type Tab = {
  label: string;
  route: string;
  icon: string;
};

type CustomTabProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const bottomMenu = StaticVariables.BOTTOM_MENU;

const tabData: Tab[] = bottomMenu;

const colors = brandedConstants?.Colors;

const useStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      backgroundColor: themeColors?.surfaceColor,
      justifyContent: 'center',
      alignItems: 'center',
      bottom: 0,
      zIndex: 999999,
      elevation: 3,
      // height:heightPixel(70),
      flex: 0.1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      //  borderRadius:20,
      borderTopColor: colors.cardBorderColor,
      // paddingTop: 10,
      // marginTop: 10,
      shadowColor: themeColors?.textColorBase,
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    tabItem: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',

      // backgroundColor:"red",
    },
    iconBackground: {
      height: 20,
    },
    icon: {
      width: widthPixel(18),
      height: widthPixel(18),
      resizeMode: 'contain',
    },
    text: {
      color: themeColors?.textColorStrong,

      width: '100%',
      fontSize: fontPixel(13),
      lineHeight: 16,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: textStyles.regular.fontFamily,
      fontWeight: '400',
      marginTop: 5,
    },
  });

type TabIconProps = {
  focused: boolean;
  route: string;
  icon: string;
};

type BottomMenuProps = {
  showMenu: boolean;
  changeCurrentRoute: any;
};

const TabIcon: React.FC<TabIconProps> = ({focused, route, icon}) => {
  const {colors} = useTheme();
  const {themeData} = useSelector(state => state?.global);
  const themeColors = handleTheme(themeData);

  const styles = useStyles(themeColors);

  return (
    <View style={styles.iconBackground}>
      <Image
        source={icon}
        style={[
          styles.icon,
          {
            tintColor: focused
              ? themeColors?.buttonColor
              : themeColors?.textColorStrong,
          },
        ]}
      />
    </View>
  );
};

const BottomMenu: React.FC<BottomMenuProps> = props => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const {
    isLoading,
    isMainRoute,
    currentRoute,
    themeData,
    businessDetails,
    menuData,
  } = useSelector(state => state?.global);
  const themeColors = handleTheme(themeData);

  const dispatch = useDispatch();
  const styles = useStyles(themeColors);
  const [menu, setMenu] = useState<Tab[]>([]);

  const {showMenu, changeCurrentRoute} = props;

  return (
    <>
      {showMenu && (
        <View style={styles.tabBar}>
          {menuData.map((route: any, index: number) => {
            // console.log('route', currentRoute, route.route, currentMenu);
            const onPress = () => {
              changeCurrentRoute(route.route);
            };

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                style={[styles.tabItem]}>
                <TabIcon
                  focused={currentRoute == route?.route}
                  route={route.route}
                  icon={route.icon}
                />
                <Text
                  style={[
                    styles.text,
                    currentRoute == route?.route && {
                      color: themeColors?.buttonColor,
                    },
                  ]}>
                  {route.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </>
  );
};

export default BottomMenu;
