import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface RouteParams {
  params: {
    groupId: string;
  };
}

const ChatScreen = ({ route }: { route: RouteParams }) => {
  const { groupId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const subscriber = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          const messages: any[] = [];
          querySnapshot.forEach(documentSnapshot => {
            messages.push({
              ...documentSnapshot.data(),
              key: documentSnapshot.id,
            });
          });
          setMessages(messages);
          setLoading(false);
        },
        error => {
          setError(error.message);
          setLoading(false);
        }
      );

    return () => subscriber();
  }, [groupId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('messages')
        .add({
          text: newMessage,
          createdAt: firestore.FieldValue.serverTimestamp(),
          userId: user.uid,
          userName: user.displayName || user.email,
        });
      setNewMessage('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const renderItem = ({ item }: { item: { userName: string; text: string } }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text>{item.text}</Text>
    </View>
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
        data={messages}
        renderItem={renderItem}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
    padding: 8,
  },
  error: {
    color: 'red',
  },
});

export default ChatScreen;