import { useAuth } from "@clerk/clerk-expo";
import NetInfo from '@react-native-community/netinfo';
import * as Cellular from 'expo-cellular';
import * as Device from "expo-device";
import * as LocalAuthentication from 'expo-local-authentication';
import * as Network from "expo-network";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { scanStyles } from "../../assets/styles/scan.style";
import { COLORS } from "../../constants/colors";



const ScanScreen = () => {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const { answers, score, result } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const [deviceName, setDeviceName] = useState("Scaning now...");
  const [osVersion, setOsVersion] = useState("Scaning now...");
  const [isSecureDevice, setIsSecureDevice] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [ipAddress, setIpAddress] = useState("Scaning now...");
  const [isJailBroken, setIsJailBroken] = useState(null);
  const [carrierName, setCarrierName] = useState("Scaning now...");

  useEffect(() => {
    const runScan = async () => {
      try {
        setDeviceName(Device.modelName || "Unknown");
      } catch (e) {
        setDeviceName("No information");
        console.log("Device information error:", e);
      }

      try {
        setOsVersion(Device.osVersion || "Unknown");
      } catch (e) {
        setOsVersion("No information");
        console.log("OS version error:", e);
      }

      try {
        const isSecure = await LocalAuthentication.isEnrolledAsync();
        setIsSecureDevice(isSecure);
      } catch (e) {
        setIsSecureDevice(null);
        console.log("security setting info errors:", e);
      }

      try {
        const carrier = await Cellular.getCarrierNameAsync();
        setCarrierName(carrier || "Unknown");
      } catch (e) {
        setCarrierName("No information");
        console.log("carrier checking error :", e);
      }

      try {
        const jailBroken = await Device.isRootedExperimentalAsync();
        setIsJailBroken(jailBroken);
      } catch (e) {
        setIsJailBroken(null);
        console.log("failbroken checker error:", e);
      }

      try {
        const ip = await Network.getIpAddressAsync();
        setIpAddress(ip || "Unknown");
      } catch (e) {
        setIpAddress("No information");
        console.log("IP checking error:", e);
      }

      try {
        const state = await NetInfo.fetch();
        setNetworkInfo({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          details: state.details,
        });
      } catch (e) {
        setNetworkInfo(null);
        console.log("network inforamtion error:", e);
      }
    };

    runScan();
  }, []);

  const handleSaveResult = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("can not get verification token");

      const payload = {
        scanType: "autometic scan",
        userId,
        deviceName,
        osVersion,
        isSecureDevice,
        isJailbroken: isJailBroken,
        ipAddress,
        networkInfo,
        carrierStatus: carrierName,
        surveyResult: result,
        surveyScore: score,
        surveyAnswers: answers,
      };

      const res = await fetch("https://check-check-api.onrender.com/api/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "failed save");
      }

      Alert.alert("Success", "Information saved now");
      router.push("/info");
    } catch (err) {
      console.error("saving error:", err);
      Alert.alert("error", err.message || "There was a problem saving record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", justifyContent: "center", paddingVertical: 20 }}
      style={scanStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={scanStyles.welcomeSection}>
        <View style={scanStyles.imageContainer}>
          <Image source={require("../../assets/images/Cold-1.png")} style={scanStyles.image} />
        </View>
        <Text style={scanStyles.fontTitle}> AUTOMETIC SCAN RESULTS </Text>
        <View style={{ width: "80%", height: 0.5, backgroundColor: COLORS.textLight, marginBottom: 20 }} />
        <View style={{ marginBottom: 12 }}>
          <Text style={scanStyles.fontType}>📱 Device: <Text style={{ fontWeight: "bold" }}>{deviceName}</Text></Text>
          <Text style={scanStyles.fontType}>📡 carrier: <Text style={{ fontWeight: "bold" }}>{carrierName}</Text></Text>
          <Text style={scanStyles.fontType}>🖥 OS Version: <Text style={{ fontWeight: "bold" }}>{osVersion}</Text></Text>
          <Text style={scanStyles.fontType}>🔒 PIN: <Text style={{ fontWeight: "bold" }}>
            {isSecureDevice === null ? "checking now" : isSecureDevice ? "Set up" : "No setting"}
          </Text></Text>
          <Text style={scanStyles.fontType}>📵 Jailbreak/routing : <Text style={{ fontWeight: "bold" }}>
            {isJailBroken === null ? "checking now" : isJailBroken ? "⚠️ Detected" : "Normal"}
          </Text></Text>
          <Text style={scanStyles.fontType}>🌐 IP address: <Text style={{ fontWeight: "bold" }}>{ipAddress}</Text></Text>
          <Text style={scanStyles.fontType}>📶 Network type: <Text style={{ fontWeight: "bold" }}>
            {networkInfo ? `${networkInfo.type} (${networkInfo.isConnected ? "Connected" : "No connection"})` : "checking now"}
          </Text></Text>
        </View>
        <View style={{ width: "80%", height: 0.5, backgroundColor: COLORS.textLight, marginTop: 15 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity style={scanStyles.scanButton} onPress={handleSaveResult}>
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>SAVE RESULTS</Text>
        </TouchableOpacity>
      )}
      <View style={{ margin: 30, width: "75%" }}>
        <Text style={{ color: "#888", fontSize: 14, textAlign: "left" }}>
          ✔️ The automatic scan results are for reference to check the security status of the device.
        </Text>
        {Device.osName === "iOS" && osVersion && parseFloat(osVersion) < 18 && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left" }}>
            ✔️ Below the recommended OS version. Please keep the latest version.
          </Text>
        )}
        {Device.osName === "Android" && osVersion && parseFloat(osVersion) < 14 && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left" }}>
            ✔️ Below the recommended Android version. Please keep the latest version.
          </Text>
        )}
        {isSecureDevice === false && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left", marginTop: 10 }}>
            ✔️ The lock screen is not set. Please set it for security.
          </Text>
        )}
        {networkInfo && networkInfo.type === 'other' && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left", marginTop: 10 }}>
            ✔️ The other is most likely a public network. Please pay attention to sensitive information.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ScanScreen;
