import React, {Component, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  ImageBackground,
} from 'react-native';
import styles from './style';
import NetInfo from '@react-native-community/netinfo';
import {Strings} from '@constants/Strings';
import {useTheme} from '@react-navigation/native';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {Colors} from '@constants/Colors';
import {TouchableOpacity} from 'react-native-gesture-handler';
import getStyles from './style';
import {TouchableRipple} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setIsOnline} from '@redux/actions/global';
import handleTheme from '@helpers/HandleTheme';
import brandedConstants from '@brandedConstants/index';
import {Images} from '@constants/Images';
import ActionButton from '../ActionButton';

const NetworkCheck = () => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const {themeData, businessDetails} = useSelector(state => state?.global);
  const [isOnline, setIsOnline] = useState(true);

  const themeColors = handleTheme(themeData);

  const styles = getStyles(themeColors);

  useEffect(() => {
    const networkListener = NetInfo.addEventListener((state: any) => {
      setIsOnline(state?.isConnected);
    });

    return () => networkListener();
  }, []);

  return (
    !isOnline && (
      <>
        <View style={styles.container}>
          <View style={styles.backGroundImage}>
            <View style={styles.innerContainer}>
              <View style={styles.appLogoContainer}>
                <Image
                  source={brandedConstants?.Images?.splashLogo}
                  style={styles.logo}
                />
              </View>
              <View style={styles.offlineImageContainer}>
                <Image
                  source={Images.offline}
                  style={styles.offlineImage}
                  resizeMode={'contain'}
                />
              </View>

              <View style={styles.offlineTextContainer}>
                <View style={styles.offlineHeadingText}>
                  <Text style={styles.offlineTextHeading}>
                    {Strings.youAreoffline}
                  </Text>
                </View>
                <View style={styles.offlineDescText}>
                  <Text style={styles.offlineTextDesc}>
                    {Strings.offlineText}
                  </Text>
                </View>
              </View>
              <View style={styles.offlineButtonContainer}>
                <View style={styles.btnContainer}>
                  <ActionButton
                    text={'Retry'}
                    showLoader={false}
                    onPress={() => {
                      setIsOnline(NetInfo?.isConnected);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </>
    )
  );
};

export default NetworkCheck;
