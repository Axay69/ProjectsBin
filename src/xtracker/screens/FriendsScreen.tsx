import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FriendRow from '../components/FriendRow';
import { seedFriends, seedChallenges } from '../data';
import { getTheme } from '../theme';

export default function FriendsScreen({ navigation, darkMode }: any) {
  const friends = seedFriends;

  const t = getTheme(darkMode);
  const bgColor = t.surface;
  const textColor = t.text;
  const subTextColor = t.muted;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Friends</Text>
        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color={t.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="account-multiple"
                size={48}
                color={subTextColor}
              />
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                No Friends Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
                Invite friends to see their progress
              </Text>
            </View>
          ) : (
            friends.map(friend => (
              <FriendRow
                key={friend.id}
                friend={friend}
                onPress={() =>
                  navigation.navigate('FriendProgress', { friendId: friend.id })
                }
                darkMode={darkMode}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 28, fontWeight: '700' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
