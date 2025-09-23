import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function EmailAnalysis() {
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
  setLoading(true);
  setResult(null);
  try {
    const cleanSubject = (subject && subject.trim()) || "No Subject";
    const cleanBody = (body && body.trim()) || "No Content"; // 절대 빈값 금지

    const resp = await fetch("https://check-check-api.onrender.com/api/analyze-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromEmail,
        fromName,
        subject: cleanSubject,
        body: cleanBody
      }),
    });

    const data = await resp.json();
    setResult(data);
  } catch (err) {
    setResult({ error: String(err) });
  } finally {
    setLoading(false);
  }
};



  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>✉️ 이메일 피싱 분석</Text>

      <Text style={styles.label}>From (이메일)</Text>
      <TextInput style={styles.input} placeholder="sender@example.com" value={fromEmail} onChangeText={setFromEmail} />

      <Text style={styles.label}>From (표시이름)</Text>
      <TextInput style={styles.input} placeholder="Bank of Canada" value={fromName} onChangeText={setFromName} />

      <Text style={styles.label}>Subject</Text>
      <TextInput style={styles.input} placeholder="Subject" value={subject} onChangeText={setSubject} />

      <Text style={styles.label}>Body (본문)</Text>
      <TextInput
        style={[styles.input, { height: 140, textAlignVertical: 'top' }]}
        placeholder="이메일 본문 전체 붙여넣기"
        value={body}
        onChangeText={setBody}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={analyze} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "분석중..." : "분석하기"}</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultBox}>
          {result.error ? (
            <Text style={{ color: 'red' }}>{result.error}</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>요약: {result.summary?.overall}</Text>
              {result.summary?.reasons?.length > 0 ? (
                result.summary.reasons.map((r: string, i: number) => <Text key={i}>• {r}</Text>)
              ) : (
                <Text>• 특이사항 없음</Text>
              )}

              <Text style={styles.sectionTitle}>링크 상세</Text>
              {Array.isArray(result.links) && result.links.length > 0 ? (
                result.links.map((l: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 12 }}>
                    <Text>원본: {l.original}</Text>
                    <Text>최종: {l.final}</Text>
                    <Text>호스트: {l.hostname}</Text>
                    <Text>표시 텍스트 불일치: {l.labelMismatch?.mismatch ? '예' : '아니오'}</Text>
                    <Text>호모그래프 의심: {l.homograph?.hasNonAscii ? '예' : '아니오'}</Text>
                    <Text>SafeBrowsing: {l.safeBrowsing?.safe === false ? '위협' : (l.safeBrowsing?.skipped ? '미실행' : '정상')}</Text>
                    <Text>VirusTotal: {l.virusTotal?.error ? '에러' : (l.virusTotal?.found ? 'found' : (l.virusTotal?.submitted ? 'submitted' : '미실행'))}</Text>
                  </View>
                ))
              ) : (
                <Text>• 본문에 링크가 없습니다.</Text>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 10, marginTop: 6, backgroundColor: COLORS.white },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: COLORS.white, fontWeight: '700' },
  resultBox: { marginTop: 16, padding: 12, backgroundColor: COLORS.card, borderRadius: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 8 }
});
