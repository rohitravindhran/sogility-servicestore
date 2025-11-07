/*

  @providesModule TextStyles

 */

import {StyleSheet, Dimensions} from 'react-native';

import {Colors} from '../constants/Colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const textStyles = {
  light: {
    fontFamily: 'Inter-Light',
  },
  medium: {
    fontFamily: 'Inter-Medium',
  },
  regular: {
    fontFamily: 'Inter-Regular',
  },
  semibold: {
    fontFamily: 'Inter-SemiBold',
  },
  bold: {
    fontFamily: 'Inter-Bold',
  },
  italic: {
    fontFamily: 'Inter-Italic',
  },
  
  primary_color: {
    color: '#6672e5',
  },
  ripple_color: {
    color: 'rgba(102, 114, 229, 0.1)',
  },
  schedule_card: {
    color: '#eceefc',
  },
  shadow: {
    elevation: 4,
  },
  shadowHeader: {
    elevation: 2,
  },
  scheduleShadowCard: {
    elevation: 3,
  },
  iosShadow: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: hp('0.45%'),
    },
    // shadowAllAround: {
    //   width: 0,
    //   height: 0,
    // },
    shadowOpacity: 0.2,
    // shadowRadius: 3.84,

    elevation: 2,
  },

  toolbar: {
    height: 54,

    position: 'relative',

    top: 0,

    left: 0,

    width: Dimensions.get('window').width,

    backgroundColor: 'transparent',
  },
  borderRadius: 15,
};

export default textStyles;
