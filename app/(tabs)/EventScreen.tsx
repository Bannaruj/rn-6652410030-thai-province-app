import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const THAI_MONTH_TO_NUMBER: Record<string, number> = {
  มกราคม: 0,
  กุมภาพันธ์: 1,
  มีนาคม: 2,
  เมษายน: 3,
  พฤษภาคม: 4,
  มิถุนายน: 5,
  กรกฎาคม: 6,
  สิงหาคม: 7,
  กันยายน: 8,
  ตุลาคม: 9,
  พฤศจิกายน: 10,
  ธันวาคม: 11,
};

function parseEventDate(startMonth: string | null): Date | null {
  if (!startMonth || typeof startMonth !== "string") return null;
  const trimmed = startMonth.trim();
  const match = trimmed.match(/^(\d{1,2})\s+(.+)$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const monthName = match[2].trim();
  const month = THAI_MONTH_TO_NUMBER[monthName];
  if (month === undefined || day < 1 || day > 31) return null;
  const now = new Date();
  let year = now.getFullYear();
  let date = new Date(year, month, day, 8, 0, 0);
  if (date.getTime() <= now.getTime()) {
    date = new Date(year + 1, month, day, 8, 0, 0);
  }
  return date;
}

type EventItem = {
  id: string;
  name: string;
  description: string | null;
  start_month: string | null;
  end_month: string | null;
  image_url: string | null;
};

export default function EventScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [remindedEventIds, setRemindedEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: eventsError } = await supabase
          .from("event_tb")
          .select("id, name, description, start_month, end_month, image_url")
          .order("created_at", { ascending: true });

        if (eventsError) {
          console.log("Supabase events error:", eventsError);
          setError("ไม่สามารถดึงข้อมูลอีเวนต์ได้");
          return;
        }

        setEvents((data || []) as EventItem[]);
      } catch (e) {
        console.log("Unexpected error fetching events:", e);
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return events;
    }

    return events.filter((e) => {
      const name = e.name?.toLowerCase() || "";
      const desc = e.description?.toLowerCase() || "";
      return name.includes(q) || desc.includes(q);
    });
  }, [events, searchQuery]);

  const handleRemindPress = useCallback(async (event: EventItem, isReminded: boolean) => {
    if (isReminded) {
      try {
        const Notifications = await import("expo-notifications");
        if (typeof Notifications.cancelScheduledNotificationAsync !== "function") return;
        const scheduled = await Notifications.getAllScheduledNotificationsAsync?.();
        if (!scheduled || !Array.isArray(scheduled)) return;
        for (const n of scheduled) {
          const data = n.content?.data;
          const eventId = data && typeof data === "object" && "eventId" in data ? String(data.eventId) : null;
          if (eventId === event.id && n.identifier) {
            await Notifications.cancelScheduledNotificationAsync(n.identifier);
          }
        }
        setRemindedEventIds((prev) => {
          const next = new Set(prev);
          next.delete(event.id);
          return next;
        });
        Alert.alert("ยกเลิกแจ้งเตือนแล้ว", `ยกเลิกการแจ้งเตือนสำหรับ ${event.name}`);
      } catch {
        Alert.alert("ไม่รองรับใน Expo Go", "ยกเลิกแจ้งเตือนใช้ได้กับ development build เท่านั้น");
      }
      return;
    }

    const eventDate = parseEventDate(event.start_month);
    if (!eventDate) {
      Alert.alert("ไม่สามารถตั้งแจ้งเตือนได้", "รูปแบบวันจัดงานไม่รองรับ");
      return;
    }
    let Notifications: typeof import("expo-notifications");
    try {
      Notifications = await import("expo-notifications");
    } catch {
      Alert.alert(
        "ไม่รองรับใน Expo Go",
        "การแจ้งเตือนวันเทศกาลใช้ได้กับ development build เท่านั้น กรุณา build แอปด้วยคำสั่ง npx expo run:android หรือใช้ development build",
      );
      return;
    }
    if (typeof Notifications.scheduleNotificationAsync !== "function") {
      Alert.alert("ไม่รองรับ", "การแจ้งเตือนไม่พร้อมใช้งานบนอุปกรณ์นี้");
      return;
    }
    try {
      if (Notifications.setNotificationHandler) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
      }
      const { status: existing } = await Notifications.getPermissionsAsync();
      let status = existing;
      if (existing !== "granted") {
        const { status: requested } = await Notifications.requestPermissionsAsync();
        status = requested;
      }
      if (status !== "granted") {
        Alert.alert("ต้องการสิทธิ์แจ้งเตือน", "เปิดการแจ้งเตือนในตั้งค่าเพื่อรับการเตือนวันเทศกาล");
        return;
      }
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("events", {
          name: "เทศกาล",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      const trigger: import("expo-notifications").NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: eventDate,
        ...(Platform.OS === "android" && { channelId: "events" }),
      };
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "วันเทศกาล",
          body: `${event.name} - วันนี้มีงานเทศกาล`,
          data: { eventId: String(event.id) },
        },
        trigger,
      });
      setRemindedEventIds((prev) => new Set(prev).add(event.id));
      Alert.alert("ตั้งแจ้งเตือนแล้ว", `จะแจ้งเตือนในวัน${event.start_month || "จัดงาน"}`);
    } catch (e) {
      console.warn("Schedule notification error:", e);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถตั้งแจ้งเตือนได้");
    }
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Text style={styles.helperText}>กำลังโหลดข้อมูลอีเวนต์...</Text>;
    }

    if (error) {
      return <Text style={styles.helperText}>{error}</Text>;
    }

    if (filteredEvents.length === 0) {
      return (
        <Text style={styles.helperText}>
          ยังไม่มีอีเวนต์ที่บันทึกไว้ในขณะนี้
        </Text>
      );
    }

    return (
      <View style={styles.list}>
        {filteredEvents.map((event) => {
          const isReminded = remindedEventIds.has(event.id);
          return (
            <View key={event.id} style={styles.card}>
              <Image
                source={
                  event.image_url
                    ? { uri: event.image_url }
                    : require("../../assets/images/not found.png")
                }
                style={styles.cardImage}
              />

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{event.name}</Text>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#8B5E3C" />
                  <Text style={styles.dateText}>
                    {event.start_month && event.end_month
                      ? `${event.start_month} - ${event.end_month}`
                      : event.start_month || event.end_month || "ไม่ระบุช่วงเวลา"}
                  </Text>
                </View>

                {event.description && (
                  <Text numberOfLines={2} style={styles.cardDescription}>
                    {event.description}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.bellButton}
                onPress={() => handleRemindPress(event, isReminded)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={isReminded ? "notifications" : "notifications-outline"}
                  size={22}
                  color={isReminded ? "#8B5E3C" : "#8B7A6B"}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#886f54" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Events</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#886f54" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor="#c2a88a"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.displayContainer}>
          <Text style={styles.sectionTitle}>Upcoming events in Surin</Text>

          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebe0d5",
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  header: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#886f54",
  },
  section: {
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F1DE",
    borderRadius: 24,
    paddingHorizontal: 15,
    height: 50,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#886f54",
  },
  displayContainer: {
    flex: 1,
    backgroundColor: "#F7F1DE",
    marginTop: 8,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#E6D8C3",
  },
  categoryChipActive: {
    backgroundColor: "#8B5E3C",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#5a4633",
  },
  categoryChipTextActive: {
    color: "#F7F1DE",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5a4633",
    marginBottom: 12,
  },
  list: {
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardImage: {
    width: 110,
    height: 110,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5a4633",
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#8B7A6B",
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#5a4633",
  },
  bellButton: {
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  helperText: {
    fontSize: 14,
    color: "#8B7A6B",
  },
});
