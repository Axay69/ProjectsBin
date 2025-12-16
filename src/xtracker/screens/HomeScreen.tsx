import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ChallengeCard from '../components/ChallengeCard';
import { seedChallenges } from '../data';
import type { Challenge } from '../types';
import CreateChallengeModal from './CreateChallengeModal';
import { getTheme } from '../theme';

export default function HomeScreen({ navigation, darkMode }: any) {
  const [challenges, setChallenges] = useState<Challenge[]>(seedChallenges);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null,
  );

  const todayCompleted = challenges.reduce((count, challenge) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRecord = challenge.days.find(d => d.date === todayStr);
    return count + (todayRecord?.status === 'done' ? 1 : 0);
  }, 0);

  const progressPercentage =
    challenges.length > 0
      ? Math.round((todayCompleted / challenges.length) * 100)
      : 0;

  const handleShare = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setShareMenuOpen(true);
  };

  const addChallenge = (c: Challenge) => {
    setChallenges(prev => [c, ...prev]);
  };

  const t = getTheme(darkMode);
  const bgColor = t.surface;
  const textColor = t.text;
  const subTextColor = t.muted;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: bgColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Your Challenges
          </Text>
          <View style={styles.progressSection}>
            <Text style={[styles.progressLabel, { color: subTextColor }]}>
              Today's Progress
            </Text>
            <Text style={[styles.progressNumber, { color: t.primary }]}>
              {progressPercentage}%
            </Text>
            <Text style={[styles.progressSub, { color: subTextColor }]}>
              \{todayCompleted} of {challenges.length} complete
            </Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {challenges.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                No Challenges Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
                Create your first challenge to start building streaks!
              </Text>
            </View>
          ) : (
            challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onPress={() =>
                  navigation.navigate('ChallengeDetail', {
                    challengeId: challenge.id,
                  })
                }
                onShare={() => handleShare(challenge.id)}
                darkMode={darkMode}
              />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: t.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateChallengeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={addChallenge}
        darkMode={darkMode}
      />

      <Modal transparent visible={shareMenuOpen} animationType="fade">
        <View style={styles.shareMenuOverlay}>
          <View style={[styles.shareMenu, { backgroundColor: bgColor }]}>
            <Text style={[styles.shareMenuTitle, { color: textColor }]}>
              Share Challenge
            </Text>
            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => {
                setShareMenuOpen(false);
              }}
            >
              <MaterialCommunityIcons name="link" size={20} color={t.primary} />
              <Text style={[styles.shareOptionText, { color: textColor }]}>
                Copy Link
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => {
                setShareMenuOpen(false);
              }}
            >
              <MaterialCommunityIcons
                name="message"
                size={20}
                color={t.primary}
              />
              <Text style={[styles.shareOptionText, { color: textColor }]}>
                Invite Friend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareOption, styles.cancelButton]}
              onPress={() => setShareMenuOpen(false)}
            >
              <Text style={[styles.cancelButtonText, { color: subTextColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  progressSection: { alignItems: 'center' },
  progressLabel: { fontSize: 12, marginBottom: 8 },
  progressNumber: { fontSize: 48, fontWeight: '700', marginBottom: 4 },
  progressSub: { fontSize: 12 },
  listContainer: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  shareMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  shareMenu: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  shareMenuTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  shareOptionText: { fontSize: 16 },
  cancelButton: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
