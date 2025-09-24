import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  primary: '#6a1b9a',
  accent: '#e1bee7',
  gray: '#ccc',
  white: '#fff',
  text: '#333',
  background: '#f4f4f8',
  borderColor: '#ddd',
};


const surveyQuestions = [
  {
    id: 'q1',
    question: 'What do you think is the most important thing when creating passwords?',
    options: ['Make it long and complicated', 'Make it easier to remember', 'Include frequently used words.'],
  },
  {
    id: 'q2',
    question: 'What do you think about clicking on a link in an email to someone you dont know?',
    options: ['Click if necessary', 'Never click', 'Check the sender and decide'],
  },
  {
    id: 'q3',
    question: 'When using public Wi-Fi such as cafes, is it safe to make financial transactions?',
    options: ['Its okay if youre in a hurry', 'Its not safe, so you have to avoid it', 'Its okay as long as you dont use the password'],
  },
 {
    id: 'q4',
    question: "What should I do if I got a text from the bank saying 'account is locked'?",
    options: ['Click the link in the text to check it', 'Check it directly with the banks official app or website', 'Send them a reply and ask if my information is correct.'],
  },
  {
    id: 'q5',
    question: 'What is the safest way to do when you get a software update notification on your smartphone or computer?',
    options: ["Press 'Do it later'", 'Install updates immediately', 'Ignore updates because they are unnecessary'],
  },
  {
    id: 'q6',
    text: 'What is the most correct description of a feature that requires additional authentication (2FA) in addition to ID and password when logging in?',
    options: ['Its uncomfortable, so its better not to use it', 'Its an essential function that greatly enhances account security', 'Its a function thats useless to hackers.'],
  },
];


const scoreMapping = {
  'Make it long and complicated': 2,
  'Check the sender and decide': 2,
  'Its not safe, so you have to avoid it': 2,
  'Check it directly with the banks official app or website': 2,
  'Install updates immediately': 2,
  'Its an essential function that greatly enhances account security': 2,
};

const SurveyScreen = () => {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateResult = () => {
    let score = 0;
    for (const question of surveyQuestions) {
      const answer = answers[question.id];
      score += scoreMapping[answer] || 0;
    }

    setTotalScore(score);

    if (score >= 10) return "safe";
    if (score >= 6) return "Security recommended"; 
    return "Dangers";                 
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < surveyQuestions.length) {
      Alert.alert("Questionnaire not completed", "Please answer all the questions.");
      return;
    }
    const surveyResult = calculateResult();
    setResult(surveyResult);
    setSubmitted(true);
  };

  const handleStartScan = () => {
    router.push({
      pathname: "/(tabs)/scan",
      params: {
        score: totalScore.toString(),
        result,
        answers: JSON.stringify(answers),
      },
    });
  };

  const handleRestartSurvey = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setTotalScore(0);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {!submitted ? (
        <>
          <Text style={styles.title}>Basic Security Awareness Survey</Text>
          {surveyQuestions.map((q) => (
            <View key={q.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>{q.question || q.text}</Text>
              {q.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    answers[q.id] === option && styles.optionSelected
                  ]}
                  onPress={() => handleAnswer(q.id, option)}
                >
                  <Text style={[
                      styles.optionText,
                      answers[q.id] === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit and view results</Text>
          </TouchableOpacity>
        </>
      ) : (
        // --- 설문조사 결과 화면 ---
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Results of the survey: {result}</Text>
          <Text style={styles.resultScore}>Security Score: {totalScore} / 12</Text>
          <Text style={styles.resultDescription}>
            {result === "Safe"
              ? "Excellent! You are following the basic security rules well."
              : result === "Security recommended"
              ? "That's great, but if you improve some habits, you can be safer."
              : "I need attention, I need immediate improvement for account security."}
          </Text>
          <TouchableOpacity onPress={handleStartScan} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Starting an automatic scan</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestartSurvey} style={styles.restartButton}>
            <Text style={styles.restartButtonText}>Do it all over again</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 50,
    padding: 20,
    paddingTop: 40,
  },
  questionContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 20,
    borderRadius: 8,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
    lineHeight: 24,
  },
  optionButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 150,
  },
  resultTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    marginTop: 50,
    textAlign:"center"
  },
  resultScore: {
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 20,
  },
  resultDescription: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  restartButton: {
    backgroundColor: '#aaa', 
    marginHorizontal: 15,
    marginTop: 10,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  restartButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SurveyScreen;