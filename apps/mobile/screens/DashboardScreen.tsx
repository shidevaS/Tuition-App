import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "@/App";
import { prisma } from "@tuiton/db";

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (!user) navigation.replace("Login");
  }, [user, navigation]);

  if (!user) {
    return null;
  }

  const [progress, setProgress] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [xp, setXp] = useState(0);
  const [xpLogs, setXpLogs] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.sub) return;

      const [prog, chall, enroll, xpLog] = await Promise.all([
        prisma.lessonProgress.findMany({ where: { userId: user.sub }, select: { lessonId: true, completed: true, xpTaken: true } }),
        prisma.challenge.findMany({ where: { published: true }, take: 5, orderBy: { createdAt: "desc" } }),
        prisma.courseEnrollment.findMany({ where: { userId: user.sub }, select: { courseId: true, progress: true, completed: true } }),
        prisma.xpLog.findMany({ where: { userId: user.sub }, orderBy: { createdAt: "desc" }, take: 5 }),
      ]);

      setProgress(prog);
      setChallenges(chall);
      setEnrollments(enroll);
      setXp(xpLog.reduce((sum, log) => sum + (log.amount || 0), 0));
      setXpLogs(xpLog);
      setTotalLessons(await prisma.lesson.count());
      setTotalChallenges(await prisma.challenge.count({ where: { published: true } }));
    };

    loadData();
  }, [user?.sub]);

  const completedCount = progress.filter((p) => p.completed).length;

  return (
    <ScrollView style={styles.scroll} refreshControl={{
      colors: ["#10B981"],
      size: "small",
      onRefresh: () => {},
    }}>
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
              <View key={i} style={styleEnrollment}>
                <Text style={styleEnrollmentTitle}>Course {e.courseId}</Text>
                <Text style={styleEnrollmentSub}>{e.progress}% complete</Text>
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
              <View key={i} style={styleXpLog}>
                <Text style={styleXpLogText}>{log.reason}</Text>
                <Text style={styleXpLogAmount}>+{log.amount} XP</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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