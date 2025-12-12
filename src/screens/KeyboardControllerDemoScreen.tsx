import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import {
  KeyboardToolbar,
  KeyboardStickyView,
  useKeyboardState,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runOnJS } from 'react-native-reanimated';

type Message = {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hey! How are you doing? 😊',
    isMe: false,
    time: '10:30 AM',
    status: 'read',
  },
  {
    id: '2',
    text: 'I am doing great! Thanks for asking. How about you?',
    isMe: true,
    time: '10:32 AM',
    status: 'read',
  },
  {
    id: '3',
    text: 'I am good too! Just working on some React Native projects.',
    isMe: false,
    time: '10:33 AM',
    status: 'read',
  },
  {
    id: '4',
    text: 'That sounds awesome! What are you building?',
    isMe: true,
    time: '10:35 AM',
    status: 'read',
  },
  {
    id: '5',
    text: 'Building a chat app demo with keyboard controller. It looks really cool!',
    isMe: false,
    time: '10:36 AM',
    status: 'read',
  },
  {
    id: '6',
    text: 'Wow! That sounds interesting. Can you show me?',
    isMe: true,
    time: '10:38 AM',
    status: 'delivered',
  },
  {
    id: '7',
    text: 'Sure! This is the demo right here. The keyboard toolbar works perfectly! 🎉',
    isMe: false,
    time: '10:40 AM',
    status: 'read',
  },
];

export default function KeyboardControllerDemoScreen() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [toolBarHeight, setToolBarHeight] = useState(0);
  const keyboardState = useKeyboardState();
  const flatListRef = useRef<FlatList>(null);
  const [keyVisible, setKeyVisible] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 10);
  }, [messages]);

  // Listen to keyboard events for instant updates
  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';
        console.log('start', e)
        runOnJS(setKeyVisible)(e.height > 0 ? false : true);
      },
      onMove: (e) => {
        'worklet';
        console.log('move', e)

        // runOnJS(setKeyVisible)(true);
      },
      onEnd: (e) => {
        'worklet';
        console.log('ended', e)
        // runOnJS(setKeyVisible)(false);
      },
    },
    []
  );


  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate reply after 1 second
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Got it! 👍',
        isMe: false,
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        status: 'read',
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isMe ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                item.isMe ? styles.myMessageTime : styles.otherMessageTime,
              ]}
            >
              {item.time}
            </Text>
            {item.isMe && (
              <MaterialCommunityIcons
                name={
                  item.status === 'read'
                    ? 'check-all'
                    : item.status === 'delivered'
                    ? 'check-all'
                    : 'check'
                }
                size={14}
                color={item.status === 'read' ? '#4FC3F7' : '#9E9E9E'}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <StatusBar backgroundColor={'red'} />
        <TouchableOpacity style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={24} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerName}>Chat Demo</Text>
            <Text style={styles.headerStatus}>online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="phone" size={24} color="#075E54" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="video" size={24} color="#075E54" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color="#075E54"
          />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.messagesList, { }]}
        style={styles.messagesContainer}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        onLayout={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
      />

      <View style={{ height: keyVisible ? keyboardState.height + toolBarHeight : 0 }} />

      {/* Input Area with KeyboardStickyView - sticks above keyboard */}
      <KeyboardStickyView offset={{ closed: 0, opened: -toolBarHeight }}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputButton}>
            <MaterialCommunityIcons
              name="emoticon-happy-outline"
              size={24}
              color="#546E7A"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton}>
            <MaterialCommunityIcons
              name="paperclip"
              size={24}
              color="#546E7A"
            />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor="#9E9E9E"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>
          {inputText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <MaterialCommunityIcons
                name="microphone"
                size={24}
                color="#546E7A"
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardStickyView>

      {/* KeyboardToolbar for navigation between inputs */}
      <KeyboardToolbar
        onLayout={({ nativeEvent }) => {
          console.log('nativeEvent', nativeEvent);
          if (nativeEvent.layout.height > 0) {
            console.log('height', nativeEvent.layout.height);
            setToolBarHeight(nativeEvent.layout.height);
          }
        }}
      >
        <KeyboardToolbar.Done />
      </KeyboardToolbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '75%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    elevation: 0,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000',
  },
  otherMessageText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  myMessageTime: {
    color: '#667781',
  },
  otherMessageTime: {
    color: '#667781',
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginHorizontal: 4,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    fontSize: 15,
    color: '#000',
    padding: 0,
    maxHeight: 84,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  micButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
