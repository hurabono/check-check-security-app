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

  // Call API from the backend
  const analyzeSmishing = async () => {
    try {
      const resp = await fetch("https://check-check-api.onrender.com/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, phoneNumber }),
      });

      const data = await resp.json();

      if (data.error) {
        setResult(`❌ Error: ${data.error}`);
        return;
      }

      const parts: string[] = [];

      if (data.phoneSummary) {
        parts.push(
          `📞 Number Analysis\n━━━━━━━━━━\nResult: ${data.phoneSummary.verdict}\nreason: ${data.phoneSummary.reason}`
        );

        if (data.phoneSummary.details) {
          const { fraud_score, recent_abuse, raw_spammer, active_status } =
            data.phoneSummary.details;

          let detailText = "";
          if (fraud_score !== undefined)
            detailText += `- Risk score: ${fraud_score}\n`;
          if (recent_abuse !== undefined)
            detailText += `- Recent report status: ${
              recent_abuse ? "Yes" : "No"
            }\n`;
          if (raw_spammer !== undefined)
            detailText += `- Spam flags: ${raw_spammer ? "Spam" : "Not Spam"}\n`;
          if (active_status)
            detailText += `- Line Status: ${active_status}\n`;

          if (detailText.length > 0) {
            parts.push(detailText.trim());
          }
        }
      }


      if (data.urlSummary) {
        parts.push(
          `🌐 URL Analysis\n━━━━━━━━━━\nResult: ${data.urlSummary.verdict}\nReason: ${data.urlSummary.reason}`
        );
        if (data.urlSummary.details) {
          parts.push(`- Additional information: ${JSON.stringify(data.urlSummary.details)}`);
        }
      }

      setResult(parts.join("\n\n"));
    } catch (err) {
      console.error("Analysis request failed:", err);
      setResult("❌ Server request failed: " + (err as Error).message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", justifyContent: "center", paddingVertical: 70, marginHorizontal:30 }}
      style={scanStyles.container}
      showsVerticalScrollIndicator={false}
    
    >
      <Text style={styles.title}>Text Message Smishing Analysis</Text>

      <Text style={styles.label}>Enter Calling Number</Text>
      <TextInput
        style={styles.input}
        placeholder="+82 10-1234-5678"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholderTextColor={COLORS.textLight}
      />

      <Text style={styles.label}>Type an in-character link (URL)</Text>
      <TextInput
        style={styles.input}
        placeholder="예: http://bit.ly/some-link"
        value={url}
        onChangeText={setUrl}
        placeholderTextColor={COLORS.textLight}
      />

      <TouchableOpacity style={styles.button} onPress={analyzeSmishing}>
        <Text style={styles.buttonText}>Analyzing</Text>
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
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  content: { 
    padding: 20 
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 20,
    textAlign:"center"
  },
  label: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginTop: 10, 
    color: COLORS.text 
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    backgroundColor: COLORS.white,
    width: '100%'
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    width: '100%'
  },
  buttonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: "700" 
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    width: '100%'
  },
  resultText: { 
    fontSize: 16, 
    color: COLORS.text, 
    lineHeight: 24, 
    width: '100%', 
    textAlign:'center' 
  },
});
