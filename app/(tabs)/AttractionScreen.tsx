import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

type Place = {
  id: string;
  name: string;
  address: string;
  image_url: string | null;
  category: string | null;
};

export default function AttractionScreen() {
  const router = useRouter();
  const { initialCategory } = useLocalSearchParams<{
    initialCategory?: string;
  }>();

  const initialCategoryLabel =
    typeof initialCategory === "string" && initialCategory.length > 0
      ? initialCategory
      : "All Category";

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategoryLabel);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSelectedCategory(initialCategoryLabel);
  }, [initialCategoryLabel]);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: placesData, error: placesError } = await supabase
          .from("places_tb")
          .select("id, name, address, category");

        const { data: imagesData, error: imagesError } = await supabase
          .from("place_images_tb")
          .select("place_id, image_url");

        if (placesError || imagesError) {
          console.log(
            "Supabase error (places/images):",
            placesError,
            imagesError,
          );
          setError(
            placesError?.message ||
              imagesError?.message ||
              "ไม่สามารถดึงข้อมูลสถานที่ได้",
          );
          return;
        }

        console.log("Supabase places data:", placesData);
        console.log("Supabase images data:", imagesData);

        const imageByPlaceId = new Map<string, string>();
        (imagesData || []).forEach(
          (img: { place_id: string; image_url: string }) => {
            if (!imageByPlaceId.has(img.place_id)) {
              imageByPlaceId.set(img.place_id, img.image_url);
            }
          },
        );

        const merged: Place[] =
          (placesData || []).map(
            (p: {
              id: string;
              name: string;
              address: string;
              category: string | null;
            }) => ({
              id: p.id,
              name: p.name,
              address: p.address,
              category: p.category ?? null,
              image_url: imageByPlaceId.get(p.id) || null,
            }),
          ) || [];

        setPlaces(merged);
      } catch (e: any) {
        console.log("Unexpected error fetching places:", e);
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const category = [
    "All Category",
    "Attraction",
    "Restaurant",
    "Cafes",
    "Temples",
  ];

  const categoryKeyByLabel: { [key: string]: string | null } = {
    "All Category": null,
    Attraction: "Attraction",
    Restaurant: "Restaurant",
    Cafes: "Cafe",
    Temples: "Temple",
  };

  const filteredPlaces = useMemo(() => {
    const targetCategory = categoryKeyByLabel[selectedCategory];
    const q = searchQuery.trim().toLowerCase();

    return places.filter((p) => {
      const matchesCategory =
        !targetCategory ||
        (p.category &&
          p.category.toLowerCase() === targetCategory.toLowerCase());

      if (!matchesCategory) return false;

      if (!q) return true;

      const name = p.name?.toLowerCase() || "";
      const address = p.address?.toLowerCase() || "";

      return name.includes(q) || address.includes(q);
    });
  }, [places, selectedCategory, searchQuery, categoryKeyByLabel]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#886f54" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Attractions</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#886f54" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search places..."
              placeholderTextColor="#c2a88a"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.displaycontainer}>
          <View style={styles.categoryRow}>
            {category.map((item) => {
              const isActive = item === selectedCategory;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.sectionTitle}>Top attractions in Surin</Text>

          {loading && (
            <View style={styles.list}>
              <Text style={styles.cardSubtitle}>กำลังโหลดข้อมูล...</Text>
            </View>
          )}

          {!loading && error && (
            <View style={styles.list}>
              <Text style={styles.cardSubtitle}>{error}</Text>
            </View>
          )}

          {!loading && !error && (
            <View style={styles.list}>
              {filteredPlaces.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/PlaceDetailScreen",
                      params: { placeId: item.id },
                    })
                  }
                >
                  <Image
                    source={
                      item.image_url
                        ? { uri: item.image_url }
                        : require("../../assets/images/not found.png")
                    }
                    style={styles.cardImage}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.address}</Text>
                    {item.category && (
                      <View style={styles.categoryBadge}>
                        <Ionicons
                          name="pricetag-outline"
                          size={14}
                          color="#8B5E3C"
                        />
                        <Text style={styles.categoryBadgeText}>
                          {item.category}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.pinIconWrapper}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#8B5E3C"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  content: {
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
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },

  fontcolor: {
    color: "#886f54",
  },

  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Kanit_400Regular",
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
    marginTop: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#886f54",
  },

  displaycontainer: {
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
    flex: 1,
    marginTop: 6,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 10,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  cardImage: {
    width: 90,
    height: 86,
    borderRadius: 18,
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5a4633",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#8B7A6B",
    marginTop: 2,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#E6D8C3",
  },
  categoryBadgeText: {
    marginLeft: 4,
    fontSize: 11,
    color: "#5a4633",
    fontWeight: "500",
  },

  starsRow: {
    flexDirection: "row",
  },

  ratingText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#5a4633",
    fontWeight: "600",
  },

  pinIconWrapper: {
    justifyContent: "flex-start",
    paddingLeft: 4,
  },
});
