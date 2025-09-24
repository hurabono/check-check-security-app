import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Info() {
  const { getToken, userId, isLoaded } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); 

  const fetchRecords = useCallback(
    async (showLoading = false) => {
      if (!isLoaded || !userId) {
        setLoading(false);
        return;
      }

      if (showLoading) setLoading(true);

      try {
        const token = await getToken();
        if (!token) throw new Error("Unable to get authentication token.");

        const response = await fetch(
          `https://check-check-api.onrender.com/api/diagnosis/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to import data");
        }

        const data = await response.json();
        setRecords(data.results || []);
      } catch (error) {
        Alert.alert("Error", error.message || "An error occurred while retrieving data.");
        setRecords([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setHasLoadedOnce(true);
      }
    },
    [isLoaded, userId, getToken]
  );


  

  const handleDelete = async (id) => {
  if (Platform.OS === "web") {
    const confirmed = window.confirm("Are you sure you want to delete this diagnostic history?");
    if (!confirmed) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Unable to get authentication token.");

      const res = await fetch(
        `https://check-check-api.onrender.com/api/diagnosis/${id}/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }

      window.alert("The diagnostic history has been deleted.");
      setRecords((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (err) {
      window.alert(err.message || "An error occurred while deleting.");
    }
  } else {
    Alert.alert("Confirm deletion", "Are you sure you want to delete this diagnostic record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) throw new Error("Unable to get authentication token.");

            const res = await fetch(
              `https://check-check-api.onrender.com/api/diagnosis/${id}/${userId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Failed to delete");
            }

            Alert.alert("Success", "The diagnostic history has been deleted.");
            setRecords((prev) => prev.filter((r) => String(r.id) !== String(id)));
          } catch (err) {
            Alert.alert("Error", err.message || "An error occurred while deleting.");
          }
        },
      },
    ]);
  }
};


  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnce) {
        fetchRecords(true);
      } else {
        fetchRecords(false);
      }
    }, [fetchRecords, hasLoadedOnce])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords(false);
  };


  if (loading && !hasLoadedOnce) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="purple" />
        <Text style={{ marginTop: 10, color: "purple" }}>Getting diagnostic records...</Text>
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
      <Text style={styles.title} >Diagnostic Record</Text>
      {records.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={styles.purpleText}>No saved diagnostic history.</Text>
          <Text style={styles.subText}>From the Home tab, run an automatic scan scan and save the results.</Text>
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

            <Text style={styles.purpleText}>📱 Device: {record.deviceName || 'No information'}</Text>
            <Text style={styles.purpleText}>🖥 OS Version: {record.osVersion || 'No information'}</Text>
            <Text style={styles.purpleText}>🔒 PIN: {record.isSecureDevice ? "Set" : "No Setting"}</Text>
            <Text style={styles.purpleText}>📵 Jailbreak/routing: {record.isJailbroken ? "Detected" : "Normal"}</Text>
            <Text style={styles.purpleText}>🌐 IP address: {record.ipAddress || 'No information'}</Text>
            <Text style={styles.purpleText}>📊 Survey Result: {record.surveyResult || 'N/A'}</Text>
            <Text style={styles.purpleText}>💯 Survey Score: {record.surveyScore !== null ? record.surveyScore : 'N/A'}</Text>
            <Text style={styles.dateText}>Scan Time: {new Date(record.scannedAt).toLocaleString('ko-KR')}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f4f0f8' },
  title: { textAlign:"center", fontSize: 28, fontWeight: 'bold', color: '#4b0082', marginBottom: 20, marginTop:50 },
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
