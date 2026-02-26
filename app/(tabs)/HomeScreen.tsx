import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomTabBar from "../components/CustomTabBar";

export default function HomeScreen() {
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
        <Text
          style={[
            styles.fontcolor,
            {
              fontSize: 24,
              fontWeight: "bold",
              fontFamily: " Kanit_700Bold",
              alignSelf: "center",
            },
          ]}
        >
          EVENT
        </Text>

        <Image
          source={require("../../assets/images/elephant.jpg")}
          style={{
            width: "90%",
            maxWidth: 500,
            height: 200,
            borderRadius: 10,
            alignSelf: "center",
          }}
        />
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
});
