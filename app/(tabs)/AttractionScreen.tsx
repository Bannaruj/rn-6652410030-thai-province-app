import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#886f54" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Attractions</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ alignItems: "center" }} />
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#886f54" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search places..."
              placeholderTextColor="#886f54"
            />
          </View>
        </View>
        <View style={styles.displaycontainer}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebe0d5",
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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F1DE",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginTop: 15,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#886f54",
  },

  displaycontainer: {
    backgroundColor: "#fff",
  },
});
