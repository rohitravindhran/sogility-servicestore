import React, {Component, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';

const AlphabeticalFilter = () => {
  const [selectedLetter, setSelectedLetter] = useState('');

const setBigLetter = (letter:any) => {
    setSelectedLetter(letter);

}

const filterData = (item:any) =>{

}

  return (
    <View style={styles.container}>
      <FlatList
        data={[
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
          'N',
          'O',
          'P',
          'Q',
          'R',
          'S',
          'T',
          'U',
          'V',
          'W',
          'X',
          'Y',
          'Z',
        ]}
        renderItem={({item}) => (
          <TouchableOpacity
          onPress={() => filterData(item)}
          onLongPress={() => setBigLetter(item)}
          >
            <Text
              style={{padding: 3, fontSize: selectedLetter === item ? 24 : 10}}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.contentContainer}
        keyExtractor={item => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer:{position: 'absolute', right: 0, top: 30}
});

export default AlphabeticalFilter;
