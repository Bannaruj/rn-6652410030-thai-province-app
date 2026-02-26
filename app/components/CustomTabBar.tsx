import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CustomTabBar() {
  const router = useRouter();
  const items = [
    { key: "attractions", label: "Attractions", icon: "location" as const },
    { key: "restaurants", label: "Restaurants", icon: "restaurant" as const },
    { key: "cafes", label: "Cafes", icon: "cafe" as const },
    { key: "temples", label: "Temples", icon: "business" as const },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.tabItem}
          onPress={() => router.push("/AttractionScreen")}
        >
          <View style={[styles.iconContainer]}>
            <Ionicons name={item.icon} size={20} color="#8B5E3C" />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F5EBDD",
    width: "90%",
    maxWidth: 500,
    alignSelf: "center",
    marginVertical: 20,
    borderRadius: 20,
    paddingVertical: 10,
    justifyContent: "space-around",
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    color: "#8B5E3C",
    marginTop: 4,
  },
});
