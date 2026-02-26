import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import CustomTabBar from "../components/CustomTabBar";

type HighlightEvent = {
  id: string;
  name: string;
  start_month: string | null;
  end_month: string | null;
  image_url: string | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [highlightEvent, setHighlightEvent] = useState<HighlightEvent | null>(
    null,
  );

  useEffect(() => {
    const fetchHighlightEvent = async () => {
      const { data, error } = await supabase
        .from("event_tb")
        .select("id, name, start_month, end_month, image_url")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log("Supabase highlight event error:", error);
        return;
      }

      if (data) {
        setHighlightEvent(data as HighlightEvent);
      }
    };

    fetchHighlightEvent();
  }, []);

  const dateLabel =
    highlightEvent?.start_month && highlightEvent?.end_month
      ? `${highlightEvent.start_month} - ${highlightEvent.end_month}`
      : highlightEvent?.start_month || highlightEvent?.end_month || "";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={[
          styles.fontcolor,
          { fontSize: 24, fontFamily: "Kanit_400Regular" },
        ]}
      >
        Discover to
      </Text>
      <Text
        style={[
          styles.fontcolor,
          { fontSize: 30, fontWeight: "bold", fontFamily: " Kanit_700Bold" },
        ]}
      >
        Surin Province
      </Text>
      <Text
        style={[
          styles.fontcolor,
          { fontSize: 20, fontFamily: "Kanit_400Regular" },
        ]}
      >
        Land of Elephants & Thai Culture
      </Text>

      <View style={{ width: "100%", height: 250 }}>
        <Image
          source={require("../../assets/images/thre.jpg")}
          style={{ width: "100%", height: "100%" }}
        />

        <LinearGradient
          colors={["rgba(235,224,213,1)", "rgba(235,224,213,0)"]}
          style={styles.topFade}
        />

        <LinearGradient
          colors={["rgba(235,224,213,0)", "rgba(235,224,213,1)"]}
          style={styles.bottomFade}
        />
      </View>

      <Text
        style={[
          styles.fontcolor,
          { fontSize: 24, fontWeight: "bold", fontFamily: " Kanit_700Bold" },
        ]}
      >
        Welcome to Surin Province
      </Text>

      <Text
        style={[
          styles.fontcolor,
          { fontSize: 18, fontFamily: "Kanit_400Regular" },
        ]}
      >
        Land of Elephants & Thai Culture
      </Text>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          paddingVertical: 16,
        }}
      >
        <CustomTabBar />
        <View
          style={{
            width: "90%",
            maxWidth: 500,
          }}
        >
          <Text
            style={[
              styles.fontcolor,
              {
                fontSize: 24,
                fontWeight: "bold",
                fontFamily: " Kanit_700Bold",
                alignSelf: "flex-start",
                marginBottom: 8,
              },
            ]}
          >
            EVENT
          </Text>

          <View style={styles.eventCard}>
            <Image
              source={
                highlightEvent?.image_url
                  ? { uri: highlightEvent.image_url }
                  : require("../../assets/images/elephant.jpg")
              }
              style={styles.eventImage}
            />
            <View style={styles.eventOverlay}>
              {dateLabel.length > 0 && (
                <Text style={styles.eventDateText}>📅{dateLabel}</Text>
              )}
              <TouchableOpacity
                style={styles.viewEventButton}
                onPress={() => router.push("/(tabs)/EventScreen")}
              >
                <Text style={styles.viewEventText}>View Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebe0d5",
    paddingTop: 20,
  },
  fontcolor: {
    color: "#886f54",
  },

  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  eventCard: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventDateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  viewEventButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F7F1DE",
  },
  viewEventText: {
    color: "#8B5E3C",
    fontSize: 13,
    fontWeight: "600",
  },
});
