import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Info() {
  const { getToken, userId, isLoaded } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true); // 첫 진입 로딩
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // 첫 로딩 여부 추적

  const fetchRecords = useCallback(
    async (showLoading = false) => {
      if (!isLoaded || !userId) {
        setLoading(false);
        return;
      }

      if (showLoading) setLoading(true);

      try {
        const token = await getToken();
        if (!token) throw new Error("인증 토큰을 가져올 수 없습니다.");

        const response = await fetch(
          `https://check-check-api.onrender.com/api/diagnosis/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "데이터 불러오기 실패");
        }

        const data = await response.json();
        setRecords(data.results || []);
      } catch (error) {
        Alert.alert("오류", error.message || "데이터를 불러오는 중 오류가 발생했습니다.");
        setRecords([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setHasLoadedOnce(true); // 한 번이라도 로드 끝나면 true
      }
    },
    [isLoaded, userId, getToken]
  );


  

  const handleDelete = async (id) => {
  if (Platform.OS === "web") {
    const confirmed = window.confirm("이 진단 기록을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("인증 토큰을 가져올 수 없습니다.");

      const res = await fetch(
        `https://check-check-api.onrender.com/api/diagnosis/${id}/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "삭제 실패");
      }

      window.alert("진단 기록이 삭제되었습니다.");
      setRecords((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (err) {
      window.alert(err.message || "삭제 중 오류가 발생했습니다.");
    }
  } else {
    Alert.alert("삭제 확인", "이 진단 기록을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) throw new Error("인증 토큰을 가져올 수 없습니다.");

            const res = await fetch(
              `https://check-check-api.onrender.com/api/diagnosis/${id}/${userId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "삭제 실패");
            }

            Alert.alert("성공", "진단 기록이 삭제되었습니다.");
            setRecords((prev) => prev.filter((r) => String(r.id) !== String(id)));
          } catch (err) {
            Alert.alert("오류", err.message || "삭제 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  }
};


  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnce) {
        // 첫 진입 → 로딩 켜고 불러오기
        fetchRecords(true);
      } else {
        // 이후 진입 → 로딩 없이 불러오기
        fetchRecords(false);
      }
    }, [fetchRecords, hasLoadedOnce])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords(false);
  };

  // 첫 진입 시 로딩 화면
  if (loading && !hasLoadedOnce) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="purple" />
        <Text style={{ marginTop: 10, color: "purple" }}>진단 기록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="purple" />
      }
    >
      <Text style={styles.title} >진단 기록</Text>
      {records.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={styles.purpleText}>저장된 진단 기록이 없습니다.</Text>
          <Text style={styles.subText}>홈 탭에서 자동 스캔 검사를 실행하고 결과를 저장해 보세요.</Text>
        </View>
      ) : (
        records.map((record) => (
          <View key={record.id} style={styles.recordBox}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(record.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.purpleText}>📱 기기 이름: {record.deviceName || '정보 없음'}</Text>
            <Text style={styles.purpleText}>🖥 OS 버전: {record.osVersion || '정보 없음'}</Text>
            <Text style={styles.purpleText}>🔒 보안 잠금: {record.isSecureDevice ? "설정됨" : "미설정"}</Text>
            <Text style={styles.purpleText}>📵 탈옥/루팅: {record.isJailbroken ? "감지됨" : "정상"}</Text>
            <Text style={styles.purpleText}>🌐 IP 주소: {record.ipAddress || '정보 없음'}</Text>
            <Text style={styles.purpleText}>📊 설문 결과: {record.surveyResult || 'N/A'}</Text>
            <Text style={styles.purpleText}>💯 설문 점수: {record.surveyScore !== null ? record.surveyScore : 'N/A'}</Text>
            <Text style={styles.dateText}>스캔 시각: {new Date(record.scannedAt).toLocaleString('ko-KR')}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f4f0f8' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4b0082', marginBottom: 20, marginTop:50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerMessage: { marginTop: 50, alignItems: "center" },
  recordBox: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: 'purple',
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#f0e6f6",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: { color: "purple", fontSize: 16, fontWeight: "bold", lineHeight: 18 },
  purpleText: { color: "purple", fontSize: 16, lineHeight: 24, marginBottom: 8 },
  subText: { color: '#6a0dad', textAlign: 'center', marginTop: 10 },
  dateText: { color: '#a9a9a9', fontSize: 12, textAlign: 'right', marginTop: 10 },
});
