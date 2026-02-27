import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

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
  const [selectedCategory, setSelectedCategory] = useState("All Events");

  const category = ["All Events"];

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
        {filteredEvents.map((event) => (
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
          </View>
        ))}
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
  helperText: {
    fontSize: 14,
    color: "#8B7A6B",
  },
});
