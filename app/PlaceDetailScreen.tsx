import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

type PlaceDetail = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  phone: string | null;
};

type PlaceImage = {
  image_url: string;
};

export default function PlaceDetailScreen() {
  const router = useRouter();
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) {
      setError("ไม่พบข้อมูลสถานที่");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: placeData, error: placeError } = await supabase
          .from("places_tb")
          .select(
            "id, name, address, description, latitude, longitude, category, phone",
          )
          .eq("id", placeId)
          .single();

        const { data: imagesData, error: imagesError } = await supabase
          .from("place_images_tb")
          .select("image_url")
          .eq("place_id", placeId);

        if (placeError || imagesError) {
          console.log("Supabase detail error:", placeError, imagesError);
          setError("ไม่สามารถดึงข้อมูลรายละเอียดสถานที่ได้");
          return;
        }

        setPlace(placeData as PlaceDetail);
        setImages((imagesData || []) as PlaceImage[]);
      } catch (e) {
        console.log("Unexpected error fetching detail:", e);
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [placeId]);

  const mainImage =
    images.length > 0 ? { uri: images[0].image_url } : require("../assets/images/not found.png");

  const handleNavigate = () => {
    if (!place || place.latitude == null || place.longitude == null) {
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    Linking.openURL(url);
  };

  const showPhone =
    place?.phone &&
    place?.category &&
    ["restaurant", "cafe"].includes(place.category.toLowerCase());

  const handleCall = () => {
    if (!place?.phone) return;
    const telNumber = place.phone.replace(/\s|-/g, "");
    Linking.openURL(`tel:${telNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#886f54" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {place?.name || "Place Detail"}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Image source={mainImage} style={styles.heroImage} />
        </View>

        {loading && (
          <Text style={styles.infoText}>กำลังโหลดข้อมูล...</Text>
        )}

        {!loading && error && <Text style={styles.infoText}>{error}</Text>}

        {!loading && !error && place && (
          <>
            <View style={styles.infoCard}>
              <View style={styles.titleRow}>
                <Ionicons name="location-outline" size={18} color="#8B5E3C" />
                <Text style={styles.placeName}>{place.name}</Text>
              </View>

              <Text style={styles.placeAddress}>{place.address}</Text>

              <TouchableOpacity
                style={[
                  styles.navigateButton,
                  (!place.latitude || !place.longitude) && styles.navigateButtonDisabled,
                ]}
                onPress={handleNavigate}
                disabled={!place.latitude || !place.longitude}
              >
                <Ionicons name="navigate" size={18} color="#F7F1DE" />
                <Text style={styles.navigateText}>Navigate</Text>
              </TouchableOpacity>

              {showPhone && (
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={18} color="#8B5E3C" />
                  <Text style={styles.phoneLabel}>เบอร์โทร</Text>
                  <TouchableOpacity onPress={handleCall} style={styles.phoneButton}>
                    <Text style={styles.phoneText}>{place.phone}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {place.description || "ยังไม่มีคำอธิบายสำหรับสถานที่นี้"}
              </Text>

              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.galleryRow}
                >
                  {images.slice(1).map((img, index) => (
                    <Image
                      key={`${img.image_url}-${index}`}
                      source={{ uri: img.image_url }}
                      style={styles.galleryImage}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "#886f54",
  },
  heroCard: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#F7F1DE",
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  infoCard: {
    backgroundColor: "#F7F1DE",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  placeName: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#5a4633",
  },
  placeAddress: {
    fontSize: 14,
    color: "#8B7A6B",
    marginTop: 4,
  },
  navigateButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#8B5E3C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navigateButtonDisabled: {
    opacity: 0.5,
  },
  navigateText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#F7F1DE",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  phoneLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: "#5a4633",
    fontWeight: "600",
  },
  phoneButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#E6D8C3",
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 14,
    color: "#8B5E3C",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#F7F1DE",
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5a4633",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#5a4633",
    lineHeight: 20,
  },
  galleryRow: {
    marginTop: 12,
  },
  galleryImage: {
    width: 120,
    height: 90,
    borderRadius: 14,
    marginRight: 10,
  },
  infoText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8B7A6B",
  },
});
