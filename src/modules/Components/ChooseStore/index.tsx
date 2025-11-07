import React, {Component, useEffect, useState} from 'react';
import Modal from 'react-native-modal';
import textStyles from '../../../utils/fonts';
import {Colors} from '../../../constants/Colors';
import {GlobalStyles} from '../../../utils/GlobalStyles';
import {ActivityIndicator, TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  DevSettings,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInputProps,
} from 'react-native';
import {useSelector} from 'react-redux';
import handleTheme from '@helpers/HandleTheme';
import CheckBox from '@react-native-community/checkbox';
import ActionButton from '@modules/Components/ActionButton';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import {TextInput} from 'react-native';
import {Images} from '@constants/Images';
import {ThemeColors} from 'src/types/themeType';
import {fontPixel, heightPixel} from '@utils/PixelRatio';
import AlphabeticalFilter from '@modules/Components/AlphabeticalFilter';
import RadioGroup from 'react-native-radio-buttons-group';
import RadioButton from '@modules/Components/RadioButton';
import {Strings} from '@constants/Strings';

const ChooseStore = (props: {
  isModalVisible: boolean;
  business: any;
  setModalVisible: any;
  setSelectedBusiness: any;
  selectedBusiness: any;
  useCurrentLocation: any;
}) => {
  const {
    isModalVisible,
    business,
    setModalVisible,
    setSelectedBusiness,
    selectedBusiness,
    useCurrentLocation,
  } = props;

  const {themeData} = useSelector((state:any) => state?.global);
  const [businessList, setBusinessesList] = useState<any>(business);
  const [searchText, setSearchText] = useState<string>();

  const [filteredData, setFilteredData] = useState([]);
  const themeColors = handleTheme(themeData);
  const styles = useStyles(themeColors);
  const modal = useModalStyles(themeColors);

  // useEffect(() => {
  //   console.log('selectedBusiness', businessList);
  // }, [selectedBusiness]);
  useEffect(() => {
    setBusinessesList(business);
  }, [business]);

  const onSearchList = (text: any) => {
    console.log('text----------', text);
    const filtered = business?.filter(
      (item: any) =>
        item?.display_text?.toLowerCase().includes(text.toLowerCase()) ||
        item?.businessAddress?.toLowerCase().includes(text.toLowerCase()),
    );
    console.log('filtered-------', filtered);
    setBusinessesList(filtered);
    setSearchText(text);
  };

  const handleSubmit = () => {
    setModalVisible(false);
    // setSelectedBusiness();
  };

  return (
    <Modal
      isVisible={isModalVisible}
      hideModalContentWhileAnimating={true}
      useNativeDriver={true}
      // onBackdropPress={() => setModalVisible(false)}
      animationInTiming={700}
      animationOutTiming={700}
      deviceWidth={ScreenWidth}
      deviceHeight={ScreenHeight}
      animationOut={'bounceOutDown'}
      style={{justifyContent: 'flex-start', margin: 0}}
      onBackButtonPress={() => setModalVisible(false)}
      backdropColor={themeColors?.backgroundColor}
      backdropOpacity={1}>
      <View
        style={{
          backgroundColor: themeColors?.backgroundColor,
          borderRadius: 10,
        }}>
        <View style={modal.modalHeader}>
          <View style={modal.headerDetails}>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: textStyles.regular.fontFamily,
                  color: themeColors?.textColorStrong || Colors.textcolor,
                }}>
                {Strings?.chooseBusiness}
              </Text>
            </View>
          </View>
          {selectedBusiness != null &&
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setModalVisible(false)}>
            <Image source={Images.closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>
        }
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.locationPicker}
          onPress={() => useCurrentLocation()}>
          <Image source={Images.locationIcon} style={styles.locationImage} />
          <Text style={styles.pickLocationText}>{Strings.pickLocation}</Text>
        </TouchableOpacity>
        <View
          style={{
            maxHeight: ScreenHeight * 0.9,
            paddingHorizontal: 18,
          }}>
          <View style={modal.search}>
            <Image source={Images?.search} style={styles.searchIcon} />
            {/* )} */}
            <TextInput
              value={searchText}
              placeholderTextColor={themeColors?.textColorMedium ?? Colors.textcolor}
              style={styles.inputText}
              placeholder={Strings.searchLocations}
              onChangeText={e => onSearchList(e)}
               numberOfLines={1}

              onFocus={() => {}}
            />
          </View>
          {/* <AlphabeticalFilter/> */}

          <ScrollView keyboardShouldPersistTaps={'handled'}>
            {businessList.map((value: any, index: number) => {
              return (
                <View key={index}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    disabled={
                      selectedBusiness?.subdomain == value?.subdomain
                        ? true
                        : false
                    }
                    onPress={() => setSelectedBusiness(value)}
                    style={{
                      borderRadius: 4,
                      justifyContent: 'center',
                    }}>
                    <View style={modal.selectOptions}>
                      <RadioButton
                        isSelected={
                          selectedBusiness?.subdomain == value?.subdomain
                        }
                        groupName={'locationSelection'}
                        label={value?.display_text}
                        onPress={(groupName: string, selectedOption: string) =>
                          setSelectedBusiness(value)
                        }
                      />
                      <View style={styles.locationDetailsText}>
                        <Text
                          style={{
                            fontSize: fontPixel(18),
                            fontFamily: textStyles.medium.fontFamily,
                            color: themeColors.textColorStrong,
                            paddingStart: 10,
                          }}
                          numberOfLines={1}>
                          {value?.display_text}
                        </Text>

                        <Text style={styles.locationAddress}>
                          {value?.businessAddress}
                        </Text>
                        {value?.distance &&
                        <Text style={styles.distanceText}>{`${value?.distance} km`}</Text>
                         }
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
      <View style={styles.bottomButton}>
        <ActionButton
          text={'Continue'}
          showLoader={false}
          disabled={!selectedBusiness}
          onPress={handleSubmit}
        />
      </View>
    </Modal>
  );
};

const useStyles = (themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors?.backgroundColor,
    },
    businessOption: {
      backgroundColor: themeColors?.backgroundColor,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 5,
      padding: 10,
      borderColor: Colors.BusinessOptionBorderColor,
      borderWidth: 0.833,
      borderTopColor: Colors.BusinessOptionBorderTopColor,
      borderBottomColor: Colors.BusinessOptionBorderBottomColor,
      elevation: 2.7,

      height: 54,
    },
    switch: {
      // backgroundColor: Colors.assetBackgroundColor,
      // backgroundColor: Colors.switchBackgroundColor,
      marginRight: 4,
      padding: 6,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor:"pink"
      // borderRadius: 36 / 7,
    },
    closeIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      marginHorizontal: 15,
      tintColor:themeColors?.textColorStrong
    },
    bottomButton: {
      position: 'absolute',
      width: ScreenWidth * 0.9,
      bottom: 0,
      alignSelf: 'center',
      marginBottom: 20,
    },
    searchIcon: {
      height: 17,
      width: 17,
      resizeMode: 'contain',
      marginLeft: 14,
      marginBottom: 3,
      tintColor: themeColors?.textColorMedium,
    },
    inputText: {
      fontFamily: textStyles.medium.fontFamily,
      width: '90%',
      
      color: Colors?.lighterTextColor,
      paddingLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: fontPixel(15),
      maxHeight:heightPixel(50),
      textAlignVertical:'center'
    },
    locationPicker: {
      flexDirection: 'row',
      paddingVertical: 20,
      paddingStart: 20,
    },

    locationImage: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
    },
    pickLocationText: {
      fontFamily: textStyles.bold.fontFamily,
      fontSize: fontPixel(16),
      marginStart: 10,
      color: Colors?.locationPickerColor,
    },
    locationDetailsText: {
      flexDirection: 'column',
      marginTop:3
    },
    locationAddress: {
      marginTop: 8,
      marginStart: 15,
      fontSize: fontPixel(18),
      width: '40%',
      color: themeColors.textColorStrong
    },
    distanceText: {
      fontFamily: textStyles.semibold.fontFamily,
      marginStart: 15,
      marginTop: 8,
      color: themeColors.textColorStrong,

      fontSize: fontPixel(18),
    },
  });

const useModalStyles = (themeColors: any) =>
  StyleSheet.create({
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Platform.OS == 'ios' ? 40 : 10,
      borderWidth: 1,
      borderTopEndRadius: 8,
      borderTopStartRadius: 8,
      paddingTop: 15,
      paddingBottom: 15,
      width: ScreenWidth,
      alignItems: 'center',
      borderColor: themeColors?.borderColor,
    },
    headerDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginStart: 20,
    },
    headerArea: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      justifyContent: 'flex-start',
      borderRadius: 5,
      borderWidth: 1,
      backgroundColor: Colors.selectedItemBg,
      borderColor: Colors.selectedItemBorder,
      // marginBottom: 10,
      overflow: 'hidden',
    },
    fadeLine: {
      borderWidth: 0.7,
      borderColor: Colors.lightBorderColor,
      marginTop: 2,
      marginBottom: 2,
    },
    selectOptions: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingLeft: 0,
      paddingVertical: 12,
      justifyContent: 'flex-start',
      borderRadius: 5,
      width: '100%',
    },
    search: {
      borderColor: themeColors?.textColorDisabled,

      backgroundColor: themeColors?.backgroundColor,

      width: '100%',
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 4,
      borderWidth: 1.5,
      // elevation: 0.5,
      marginBottom: '3%',
      // paddingVertical: '3%',
      height: heightPixel(60),

      marginTop: 5,
    },
  });

export default ChooseStore;
