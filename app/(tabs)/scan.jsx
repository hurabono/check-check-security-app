import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView } from "react-native";
import * as Device from "expo-device";
import * as Network from "expo-network";
import NetInfo from '@react-native-community/netinfo';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { scanStyles } from "../../assets/styles/scan.style";
import { COLORS } from "../../constants/colors";
import * as LocalAuthentication from 'expo-local-authentication';
import * as Cellular from 'expo-cellular';



const ScanScreen = () => {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const { answers, score, result } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const [deviceName, setDeviceName] = useState("확인 중...");
  const [osVersion, setOsVersion] = useState("확인 중...");
  const [isSecureDevice, setIsSecureDevice] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [ipAddress, setIpAddress] = useState("확인 중...");
  const [isJailBroken, setIsJailBroken] = useState(null);
  const [carrierName, setCarrierName] = useState("확인 중...");

  useEffect(() => {
    const runScan = async () => {
      try {
        setDeviceName(Device.modelName || "알 수 없음");
      } catch (e) {
        setDeviceName("정보 없음");
        console.log("기기명 오류:", e);
      }

      try {
        setOsVersion(Device.osVersion || "알 수 없음");
      } catch (e) {
        setOsVersion("정보 없음");
        console.log("OS버전 오류:", e);
      }

      try {
        const isSecure = await LocalAuthentication.isEnrolledAsync();
        setIsSecureDevice(isSecure);
      } catch (e) {
        setIsSecureDevice(null);
        console.log("보안설정 확인 오류:", e);
      }

      try {
        const carrier = await Cellular.getCarrierNameAsync();
        setCarrierName(carrier || "알 수 없음");
      } catch (e) {
        setCarrierName("정보 없음");
        console.log("통신사 확인 오류:", e);
      }

      try {
        const jailBroken = await Device.isRootedExperimentalAsync();
        setIsJailBroken(jailBroken);
      } catch (e) {
        setIsJailBroken(null);
        console.log("탈옥 여부 확인 오류:", e);
      }

      try {
        const ip = await Network.getIpAddressAsync();
        setIpAddress(ip || "알 수 없음");
      } catch (e) {
        setIpAddress("정보 없음");
        console.log("IP 확인 오류:", e);
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
        console.log("네트워크 정보 오류:", e);
      }
    };

    runScan();
  }, []);

  const handleSaveResult = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("인증 토큰을 가져올 수 없습니다.");

      const payload = {
        scanType: "자동스캔",
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
        throw new Error(errorData.error || "서버 저장 실패");
      }

      Alert.alert("성공", "진단기록이 저장되었습니다.");
      router.push("/info");
    } catch (err) {
      console.error("저장 중 오류:", err);
      Alert.alert("오류", err.message || "기록 저장 중 문제가 발생했습니다.");
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
        <Text style={scanStyles.fontTitle}>자동 스캔 결과</Text>
        <View style={{ width: "80%", height: 0.5, backgroundColor: COLORS.textLight, marginBottom: 20 }} />
        <View style={{ marginBottom: 12 }}>
          <Text style={scanStyles.fontType}>📱 기기 종류: <Text style={{ fontWeight: "bold" }}>{deviceName}</Text></Text>
          <Text style={scanStyles.fontType}>📡 통신사: <Text style={{ fontWeight: "bold" }}>{carrierName}</Text></Text>
          <Text style={scanStyles.fontType}>🖥 OS 버전: <Text style={{ fontWeight: "bold" }}>{osVersion}</Text></Text>
          <Text style={scanStyles.fontType}>🔒 잠금화면(PIN): <Text style={{ fontWeight: "bold" }}>
            {isSecureDevice === null ? "확인 중" : isSecureDevice ? "설정됨" : "미설정"}
          </Text></Text>
          <Text style={scanStyles.fontType}>📵 탈옥/루팅 여부: <Text style={{ fontWeight: "bold" }}>
            {isJailBroken === null ? "확인 중" : isJailBroken ? "⚠️ 감지됨" : "정상"}
          </Text></Text>
          <Text style={scanStyles.fontType}>🌐 IP 주소: <Text style={{ fontWeight: "bold" }}>{ipAddress}</Text></Text>
          <Text style={scanStyles.fontType}>📶 네트워크 타입: <Text style={{ fontWeight: "bold" }}>
            {networkInfo ? `${networkInfo.type} (${networkInfo.isConnected ? "연결됨" : "연결 안됨"})` : "확인 중"}
          </Text></Text>
        </View>
        <View style={{ width: "80%", height: 0.5, backgroundColor: COLORS.textLight, marginTop: 15 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity style={scanStyles.scanButton} onPress={handleSaveResult}>
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>결과 저장하기</Text>
        </TouchableOpacity>
      )}
      <View style={{ margin: 30, width: "75%" }}>
        <Text style={{ color: "#888", fontSize: 14, textAlign: "left" }}>
          ✔️ 자동 스캔 결과는 기기 보안 상태를 점검하기 위한 참고용입니다.
        </Text>
        {Device.osName === "iOS" && osVersion && parseFloat(osVersion) < 18 && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left" }}>
            ✔️ 권장 OS 버전 미만입니다. 최신버전을 유지해주세요.
          </Text>
        )}
        {Device.osName === "Android" && osVersion && parseFloat(osVersion) < 14 && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left" }}>
            ✔️ 권장 안드로이드 버전 미만입니다. 최신버전을 유지해주세요.
          </Text>
        )}
        {isSecureDevice === false && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left", marginTop: 10 }}>
            ✔️ 잠금화면이 미설정으로 되어있습니다. 보안을 위해 설정해주세요.
          </Text>
        )}
        {networkInfo && networkInfo.type === 'other' && (
          <Text style={{ color: "#888", fontSize: 14, textAlign: "left", marginTop: 10 }}>
            ✔️ other은 공용네트워크일 가능성이 높습니다. 민감한정보에 유의해주세요.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ScanScreen;
