import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { scanStyles } from "../../assets/styles/scan.style";
import { COLORS } from "../../constants/colors";


export default function SmsAnalysis() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");

  // 백엔드에서 API 호출
  const analyzeSmishing = async () => {
    try {
      const resp = await fetch("https://check-check-api.onrender.com/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, phoneNumber }),
      });

      const data = await resp.json();

      if (data.error) {
        setResult(`❌ 오류: ${data.error}`);
        return;
      }

      const parts: string[] = [];

      if (data.phoneSummary) {
        parts.push(
          `📞 번호 분석\n━━━━━━━━━━\n판정: ${data.phoneSummary.verdict}\n사유: ${data.phoneSummary.reason}`
        );

        if (data.phoneSummary.details) {
          const { fraud_score, recent_abuse, raw_spammer, active_status } =
            data.phoneSummary.details;

          let detailText = "";
          if (fraud_score !== undefined)
            detailText += `- 위험 점수: ${fraud_score}\n`;
          if (recent_abuse !== undefined)
            detailText += `- 최근 신고 여부: ${
              recent_abuse ? "있음" : "없음"
            }\n`;
          if (raw_spammer !== undefined)
            detailText += `- 스팸 플래그: ${raw_spammer ? "스팸" : "아님"}\n`;
          if (active_status)
            detailText += `- 회선 상태: ${active_status}\n`;

          if (detailText.length > 0) {
            parts.push(detailText.trim());
          }
        }
      }


      if (data.urlSummary) {
        parts.push(
          `🌐 URL 분석\n━━━━━━━━━━\n판정: ${data.urlSummary.verdict}\n사유: ${data.urlSummary.reason}`
        );
        if (data.urlSummary.details) {
          parts.push(`- 추가 정보: ${JSON.stringify(data.urlSummary.details)}`);
        }
      }

      setResult(parts.join("\n\n"));
    } catch (err) {
      console.error("분석 요청 실패:", err);
      setResult("❌ 서버 요청 실패: " + (err as Error).message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", justifyContent: "center", paddingVertical: 70 }}
      style={scanStyles.container}
      showsVerticalScrollIndicator={false}
    
    >
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 20,
  },
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
