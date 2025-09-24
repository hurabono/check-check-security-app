import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { scanStyles } from "../../assets/styles/scan.style";
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
    const cleanBody = (body && body.trim()) || "No Content";

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
    <ScrollView
      contentContainerStyle={{ paddingVertical: 70, marginHorizontal:30 }}
      style={scanStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}> Analysis of email phishing</Text>

      <Text style={styles.label}>From (Email)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="sender@example.com"
        placeholderTextColor={COLORS.textLight} 
        value={fromEmail} 
        onChangeText={setFromEmail} 
        />

      <Text style={styles.label}>Display Name</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Type Title"
        placeholderTextColor={COLORS.textLight} 
        value={fromName} 
        onChangeText={setFromName} 
        />

      <Text style={styles.label}>Subject</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Subject" 
        value={subject} 
        onChangeText={setSubject}
        placeholderTextColor={COLORS.textLight}
        />

      <Text style={styles.label}>Body</Text>
      <TextInput
        style={[styles.input, { height: 140, textAlignVertical: 'top' }]}
        placeholder="Paste whole body of email"
        value={body}
        onChangeText={setBody}
        multiline
        placeholderTextColor={COLORS.textLight}
      />

      <TouchableOpacity style={styles.button} onPress={analyze} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Analyzing now..." : "Analyzing"}</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultBox}>
          {result.error ? (
            <Text style={{ color: 'red' }}>{result.error}</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Summary: {result.summary?.overall}</Text>
              {result.summary?.reasons?.length > 0 ? (
                result.summary.reasons.map((r: string, i: number) => <Text key={i}>• {r}</Text>)
              ) : (
                <Text>• Nothing suspicious</Text>
              )}

              <Text style={styles.sectionTitle}>Link Details</Text>
              {Array.isArray(result.links) && result.links.length > 0 ? (
                result.links.map((l: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 12 }}>
                    <Text>Original: {l.original}</Text>
                    <Text>Final: {l.final}</Text>
                    <Text>hostname: {l.hostname}</Text>
                    <Text>Display Text Mismatch: {l.labelMismatch?.mismatch ? 'Yes' : 'No'}</Text>
                    <Text>suspected homograph: {l.homograph?.hasNonAscii ? 'Yes' : 'No'}</Text>
                    <Text>SafeBrowsing: {l.safeBrowsing?.safe === false ? 'Threat' : (l.safeBrowsing?.skipped ? 'Not executed' : 'Normal')}</Text>
                    <Text>VirusTotal: {l.virusTotal?.error ? 'Error' : (l.virusTotal?.found ? 'found' : (l.virusTotal?.submitted ? 'submitted' : 'Not executed'))}</Text>
                  </View>
                ))
              ) : (
                <Text>• No link found in body.</Text>
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
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 22, textAlign:"center" },
  label: { fontWeight: '600', marginTop: 8, color: COLORS.text },
  input: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 10, marginTop: 6, backgroundColor: COLORS.white },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: COLORS.white, fontWeight: '700' },
  resultBox: { marginTop: 16, padding: 12, backgroundColor: COLORS.card, borderRadius: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 8 }
});
