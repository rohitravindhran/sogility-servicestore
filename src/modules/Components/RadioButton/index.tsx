import handleTheme from '@helpers/HandleTheme';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';


type RadioButtonProps = {
  label: string;
  onPress: (groupName: string, selectedOption: string) => void;
  isSelected: boolean;
  groupName: string;
};


const RadioButton: React.FC<RadioButtonProps> = ({ label, onPress, isSelected, groupName }) => {
    const {themeData} = useSelector(state => state?.global);

    const themeColors = handleTheme(themeData);
    // const styles = useStyles(themeColors);


  const handlePress = () => {
    onPress(groupName, label);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 5,
        },
      ]}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: themeColors?.buttonColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        {isSelected && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor:themeColors?.buttonColor,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RadioButton;
