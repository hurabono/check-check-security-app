import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function SmsAnalysis() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");



  const analyzeSmishing = () => {
  const messages: string[] = [];

  // ===============================
  // 📌 발신 번호 분석 (강화)
  // ===============================
  if (phoneNumber) {
    if (phoneNumber.startsWith("+") && !phoneNumber.startsWith("+82")) {
      messages.push("⚠️ 해외 번호에서 발송된 문자입니다. 스미싱 위험이 매우 높습니다.");
    }

    if (phoneNumber.startsWith("070")) {
      messages.push("⚠️ 인터넷 전화(070) 번호입니다. 스미싱 위험이 있습니다.");
    }

    if (/^(0\d{1,2})/.test(phoneNumber) && !phoneNumber.startsWith("010")) {
      messages.push("ℹ️ 지역번호(유선전화) 발신입니다. 일반 기업·기관일 수 있으나 스팸 가능성도 있습니다.");
    }

    if (phoneNumber.startsWith("1588") || phoneNumber.startsWith("1577")) {
      messages.push("✅ 기업 대표번호 패턴입니다. 비교적 안전합니다.");
    }

    if (
      !phoneNumber.startsWith("+") &&
      !phoneNumber.startsWith("070") &&
      !/^(0\d{1,2})/.test(phoneNumber) &&
      !phoneNumber.startsWith("1588") &&
      !phoneNumber.startsWith("1577")
    ) {
      messages.push("✅ 발신 번호에서 특이점이 발견되지 않았습니다.");
    }
  }

  // ===============================
  // 📌 URL 분석
  // ===============================
  if (url) {
    if (url.includes("bit.ly") || url.includes("me2.do") || url.includes("is.gd")) {
      messages.push("⚠️ 단축 URL이 감지되었습니다. 반드시 주의하세요.");
    } else if (url.endsWith(".apk")) {
      messages.push("🚨 APK 파일 링크가 감지되었습니다. 100% 스미싱입니다!");
    } else {
      messages.push("🔍 URL이 특별한 위험 요소를 보이지 않습니다.");
    }
  }

  // ===============================
  // 📌 번호와 URL 둘 다 없는 경우
  // ===============================
  if (!phoneNumber && !url) {
    messages.push("❌ 번호와 URL이 입력되지 않았습니다.");
  }

  setResult(messages.join("\n"));
};




  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📱 문자 메시지 스미싱 분석</Text>

      <Text style={styles.label}>발신 번호 입력</Text>
      <TextInput
        style={styles.input}
        placeholder="+82 10-1234-5678"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <Text style={styles.label}>문자 내 링크(URL) 입력</Text>
      <TextInput
        style={styles.input}
        placeholder="예: http://bit.ly/some-link"
        value={url}
        onChangeText={setUrl}
      />

      <TouchableOpacity style={styles.button} onPress={analyzeSmishing}>
        <Text style={styles.buttonText}>분석하기</Text>
      </TouchableOpacity>

      {result.length > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.primary, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 10, color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  resultBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  resultText: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
});
