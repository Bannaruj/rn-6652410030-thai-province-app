import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function AttractionScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All Districts");

  const category = [
    "All Districts",
    "Attraction",
    "Restaurant",
    "Cafes",
    "Temples",
  ];

  const attractions = [
    {
      id: "1",
      title: "Phanom Rung",
      subtitle: "Historical Park",
      rating: 4.8,
      image: require("../../assets/images/thre.jpg"),
    },
    {
      id: "2",
      title: "Elephant World",
      subtitle: "Animal Sanctuary",
      rating: 4.7,
      image: require("../../assets/images/elephant.jpg"),
    },
    {
      id: "3",
      title: "Si Narong Castle",
      subtitle: "Khmer Ruins",
      rating: 4.6,
      image: require("../../assets/images/thre.jpg"),
    },
    {
      id: "4",
      title: "Sam Lan Waterfall",
      subtitle: "Waterfall",
      rating: 4.4,
      image: require("../../assets/images/thre.jpg"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#886f54" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Attractions</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#886f54" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search places..."
              placeholderTextColor="#c2a88a"
            />
            <TouchableOpacity>
              <Ionicons name="options-outline" size={22} color="#886f54" />
            </TouchableOpacity>
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

          <View style={styles.list}>
            {attractions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.85}
              >
                <Image source={item.image} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Ionicons
                          key={index}
                          name={
                            index < Math.round(item.rating)
                              ? "star"
                              : "star-outline"
                          }
                          size={14}
                          color="#F6B100"
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingText}>
                      {item.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.pinIconWrapper}>
                  <Ionicons name="location-outline" size={18} color="#8B5E3C" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    borderRadius: 20,
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
