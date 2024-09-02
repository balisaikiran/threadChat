import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface GroupListScreenProps {
  navigation: any;
}

const GroupListScreen: React.FC<GroupListScreenProps> = ({ navigation }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const subscriber = firestore()
      .collection('groups')
      .onSnapshot(
        querySnapshot => {
          const groups: any[] = [];
          querySnapshot.forEach(documentSnapshot => {
            groups.push({
              ...documentSnapshot.data(),
              key: documentSnapshot.id,
            });
          });
          setGroups(groups);
          setLoading(false);
        },
        error => {
          setError(error.message);
          setLoading(false);
        }
      );

    return () => subscriber();
  }, []);

  const renderItem = ({ item }: { item: { key: string; name: string } }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Chat', { groupId: item.key })}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        renderItem={renderItem}
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
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  error: {
    color: 'red',
  },
});

export default GroupListScreen;