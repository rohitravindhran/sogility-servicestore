import {Colors} from '../../constants/Colors';
import {Constants} from '../../constants/Constants';

export default function handleTheme(themeData: any) {
  let themeColor = {};
  let primaryColor = '';
  let textColor = '';
  let barStyle = '';
  if (!themeData) {
    return {
      backgroundColor:null,
      backgroundColorMedium:null,
      backgroundColorStrong:null,
      surfaceColor:null,
      surfaceColorSelected:null,
      textColorBase:null,
      surfaceColorDisabled:null,
      surfaceColorHover:null,
      buttonColor:null,
      buttonColorDisabled:null,
      textColorStrong:null,
      textColorMedium:null,
      textColorDisabled:null,
      textColorSelected:null,
      textColorTop:null,
      borderColor:null,
      isDarkTheme:null,
    }
  }

  function applyOverlayColor(baseColor:any, dynamicColor:any, opacity:any) {
    // Parse the base color and dynamic color to their individual RGB components
    const baseColorRGB = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      baseColor,
    );
    const dynamicColorRGB = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      dynamicColor,
    );

    if (!baseColorRGB || !dynamicColorRGB) {
      // Invalid color format, return a default color or handle the error as needed
      return baseColor;
    }

    const baseR = parseInt(baseColorRGB[1], 16);
    const baseG = parseInt(baseColorRGB[2], 16);
    const baseB = parseInt(baseColorRGB[3], 16);

    const dynamicR = parseInt(dynamicColorRGB[1], 16);
    const dynamicG = parseInt(dynamicColorRGB[2], 16);
    const dynamicB = parseInt(dynamicColorRGB[3], 16);

    // Calculate the overlay color
    const overlayR = Math.round(baseR + (dynamicR - baseR) * opacity);
    const overlayG = Math.round(baseG + (dynamicG - baseG) * opacity);
    const overlayB = Math.round(baseB + (dynamicB - baseB) * opacity);

    return `rgba(${overlayR}, ${overlayG}, ${overlayB}, 1)`;
  }

  let lightTextColor = '#ffffff';
  let darkTextColor = '#20201E';
  const dynamicColor =
    themeData?.themeVariant == 'custom'
      ? `#${themeData?.color}`
      : `${Colors[themeData?.themeVariant]}`;


  let baseColorForBG =
    themeData.themeType == 'md1' ? lightTextColor : darkTextColor;
  let baseColorForText =
    themeData.themeType == 'md1' ? darkTextColor : lightTextColor;

  const backgroundColor = applyOverlayColor(baseColorForBG, dynamicColor, 0);
  const backgroundColorMedium = applyOverlayColor(
    baseColorForBG,
    dynamicColor,
    0.3,
  );
  const backgroundColorStrong = applyOverlayColor(
    baseColorForBG,
    dynamicColor,
    0.5,
  );

  const surfaceColor = applyOverlayColor(baseColorForBG, dynamicColor, 0);

  const surfaceColorHover = applyOverlayColor(
    baseColorForBG,
    dynamicColor,
    0.08,
  );
  const surfaceColorSelected = applyOverlayColor(
    baseColorForBG,
    dynamicColor,
    0.16,
  );
  const surfaceColorDisabled = applyOverlayColor(
    baseColorForBG,
    dynamicColor,
    0.3,
  );

  const textColorBase = `${baseColorForText}`;
  const textColorStrong = `${baseColorForText}`;
  const textColorMedium = `${baseColorForText}70`;
  const textColorDisabled = `${baseColorForText}30`;
  const textColorTop = (themeData?.themeVariant == 'electra' || themeData?.themeVariant == 'vintage') ? darkTextColor : lightTextColor;
  const textColorSelected = `${baseColorForText}`;

  const buttonColor = applyOverlayColor(baseColorForText, dynamicColor, 1);
  const buttonColorDisabled = applyOverlayColor(
    baseColorForText,
    dynamicColor,
    0.3,
  );

  const borderColor = `${baseColorForText}20`;

  const isDarkTheme = themeData.themeType != 'md1';



  return {
    backgroundColor,
    backgroundColorMedium,
    backgroundColorStrong,
    surfaceColor,
    surfaceColorSelected,
    textColorBase,
    surfaceColorDisabled,
    surfaceColorHover,
    buttonColor,
    buttonColorDisabled,
    textColorStrong,
    textColorMedium,
    textColorDisabled,
    textColorSelected,
    textColorTop,
    borderColor,
    isDarkTheme,
  };
}
