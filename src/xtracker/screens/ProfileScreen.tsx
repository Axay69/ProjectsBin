import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { seedUser, seedFriends } from '../data';
import { getTheme } from '../theme';

export default function ProfileScreen({ darkMode, onToggleDarkMode }: any) {
  const user = seedUser;
  const friends = seedFriends;

  const t = getTheme(darkMode);
  const bgColor = t.surface;
  const textColor = t.text;
  const subTextColor = t.muted;

  const handleDarkModeToggle = () => {
    onToggleDarkMode();
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: bgColor }]}>
          <Text style={[styles.title, { color: textColor }]}>Profile</Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: bgColor }]}>
            <View style={styles.userSection}>
              <Text style={styles.userAvatar}>👤</Text>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: textColor }]}>
                  {user.name}
                </Text>
                <Text style={[styles.userHandle, { color: subTextColor }]}>
                  @{user.username}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: bgColor }]}>
            <View style={styles.setting}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="moon-stars"
                  size={24}
                  color="#0EA5A4"
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Dark Mode
                  </Text>
                  <Text
                    style={[styles.settingDescription, { color: subTextColor }]}
                  >
                    {darkMode ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: t.border, true: '#06B6D4' }}
                thumbColor={darkMode ? t.primary : '#F3F4F6'}
              />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: bgColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: t.primary }]}>
                  {friends.length}
                </Text>
                <Text style={[styles.statLabel, { color: subTextColor }]}>
                  Friends
                </Text>
              </View>
              <View
                style={[
                  styles.stat,
                  {
                    borderLeftWidth: 1,
                    borderLeftColor: '#E5E7EB',
                    paddingLeftValue: 16,
                  },
                ]}
              >
                <Text style={[styles.statValue, { color: t.primary }]}>5</Text>
                <Text style={[styles.statLabel, { color: subTextColor }]}>
                  Active
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: bgColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>About</Text>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={subTextColor}
              />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                About xTracker
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={subTextColor}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="file-document"
                size={20}
                color={subTextColor}
              />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Privacy Policy
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={subTextColor}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={20} color={t.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 28, fontWeight: '700' },
  content: { padding: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  userAvatar: { fontSize: 48 },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  userHandle: { fontSize: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  settingDescription: { fontSize: 12 },
  statsGrid: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  statValue: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: { fontSize: 16, flex: 1 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
});
