import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth, type RootStackParamList } from "../App";
import { api } from "../lib/api";

export default function DashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Dashboard">>();

  const [progress, setProgress] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [xp, setXp] = useState(0);
  const [xpLogs, setXpLogs] = useState<any[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigation.replace("Login");
  }, [user, navigation]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prog, chall, enroll, xpLog, lessonsCount, challengesCount] = await Promise.all([
        api.getDashboardData().then(r => r.data?.lessonProgress || []),
        api.getChallenges().then(r => r.data || []),
        api.getCourses().then(r => r.data || []),
        api.getProfile().then(r => r.data?.xpLogs || []),
        api.getDashboardData().then(r => r.data?.totalLessons || 0),
        api.getDashboardData().then(r => r.data?.totalChallenges || 0),
      ]);

      setProgress(prog);
      setChallenges(chall);
      setEnrollments(enroll);
      setXp(xpLog.reduce((sum: number, log: any) => sum + (log.amount || 0), 0));
      setXpLogs(xpLog);
      setTotalLessons(lessonsCount);
      setTotalChallenges(challengesCount);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const completedCount = progress.filter((p) => p.completed).length;

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadData}
          tintColor="#10B981"
          colors={["#10B981"]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user.name}</Text>
      </View>

      {/* Progress Summary */}
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Lessons</Text>
          <Text style={styles.cardValue}>{completedCount}/{totalLessons}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Challenges</Text>
          <Text style={styles.cardValue}>{challenges.length}/{totalChallenges}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>XP</Text>
          <Text style={styles.cardValue}>{xp}+</Text>
        </View>
      </View>

      {/* Enrolled Courses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enrolled Courses</Text>
        {enrollments.length === 0 ? (
          <Text style={styles.emptyState}>No courses enrolled yet</Text>
        ) : (
          <View style={styles.enrollmentsList}>
            {enrollments.map((e, i) => (
              <View key={i} style={styles.styleEnrollment}>
                <Text style={styles.styleEnrollmentTitle}>Course {e.courseId || e.id}</Text>
                <Text style={styles.styleEnrollmentSub}>{e.progress || 0}% complete</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent XP Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent XP</Text>
        {xpLogs.length === 0 ? (
          <Text style={styles.emptyState}>No XP logs yet</Text>
        ) : (
          <View style={styles.xpLogsList}>
            {xpLogs.map((log, i) => (
              <View key={i} style={styles.styleXpLog}>
                <Text style={styles.styleXpLogText}>{log.reason || log.action}</Text>
                <Text style={styles.styleXpLogAmount}>+{log.amount} XP</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F1729",
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: "#0F1729",
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F8F9FA",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 24,
    width: "45%",
  },
  cardLabel: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F8F9FA",
    marginBottom: 16,
  },
  emptyState: {
    color: "#64748B",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 40,
  },
  enrollmentsList: {
    marginTop: 16,
  },
  styleEnrollment: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  styleEnrollmentTitle: {
    color: "#F8F9FA",
    fontSize: 14,
    fontWeight: "500",
  },
  styleEnrollmentSub: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  xpLogsList: {
    marginTop: 16,
  },
  styleXpLog: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  styleXpLogText: {
    color: "#F8F9FA",
    fontSize: 14,
  },
  styleXpLogAmount: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
  },
});