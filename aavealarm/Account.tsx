import { Image, Text, View } from "react-native";

export default function Account(navigation: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 96,
      }}
    >
      <View
        style={{
          backgroundColor: "#2B2E40",
          padding: 16,
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 20,
            textAlign: "center",
            padding: 16,
            paddingTop: 0,
          }}
        >
          0x4bBa29......9886d1bC26
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            height: 48,
          }}
        >
          <Text
            style={{
              flex: 1,
              color: "#FFF",
              fontSize: 16,
              textAlign: "center",
              textAlignVertical: "center",
              backgroundColor: "#373B51",
            }}
          >
            Ethereum
          </Text>
          <Text
            style={{
              flex: 1,
              color: "#FFF",
              fontSize: 16,
              textAlign: "center",
              textAlignVertical: "center",
              backgroundColor: "#373B51",
              marginLeft: 16,
            }}
          >
            Aave V3
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 16,
            borderBottomColor: "#4A4F6C",
            borderBottomWidth: 2,
          }}
        >
          <Text style={{ color: "#00B8FF", fontSize: 18, fontWeight: "500" }}>
            Health factor
          </Text>
          <Text style={{ color: "#FFF", fontSize: 18 }}>1.3</Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 16,
            paddingBottom: 0,
          }}
        >
          <Text style={{ color: "#00B8FF", fontSize: 18, fontWeight: "500" }}>
            Net APY
          </Text>
          <Text style={{ color: "#FFF", fontSize: 18 }}>3.4%</Text>
        </View>
      </View>
      <View style={{ margin: 16 }}>
        <View
          style={{
            backgroundColor: "#30364B",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 14 }}>Asset</Text>
          <Text style={{ color: "#FFF", fontSize: 14 }}>Supplied</Text>
          <Text style={{ color: "#FFF", fontSize: 14 }}>Borrowed</Text>
        </View>
        <View style={{ backgroundColor: "#2B2E40" }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Image
                style={{ width: 24, height: 24, marginRight: 8 }}
                source={require("./assets/gho.png")}
              />
              <Text style={{ color: "#FFF", fontSize: 14 }}>GHO</Text>
            </View>
            <Text style={{ color: "#ACACAC", fontSize: 14 }}>0</Text>
            <Text style={{ color: "#ACACAC", fontSize: 14 }}>$10.4k</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Image
                style={{ width: 24, height: 24, marginRight: 8 }}
                source={require("./assets/eth.png")}
              />
              <Text style={{ color: "#FFF", fontSize: 14 }}>ETH</Text>
            </View>
            <Text style={{ color: "#ACACAC", fontSize: 14 }}>$5k</Text>
            <Text style={{ color: "#ACACAC", fontSize: 14 }}>0</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Image
                style={{ width: 24, height: 24, marginRight: 8 }}
                source={require("./assets/dai.png")}
              />
              <Text style={{ color: "#FFF", fontSize: 14 }}>DAI</Text>
            </View>
            <Text style={{ color: "#ACACAC", fontSize: 14 }}>$20k</Text>
            <Text style={{ color: "#ACACAC", fontSize: 14 }}>0</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "#30364B",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 14 }}>Total</Text>
          <Text style={{ color: "#FFF", fontSize: 14 }}>$25k</Text>
          <Text style={{ color: "#FFF", fontSize: 14 }}>$10.4k</Text>
        </View>
      </View>
    </View>
  );
}
