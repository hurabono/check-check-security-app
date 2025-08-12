import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
// useAuth는 현재 코드에서 직접 사용되지 않으므로, 필요 없다면 제거해도 됩니다.
// import { useAuth } from "@clerk/clerk-expo";

// home.styles.js를 참고한 디자인 시스템
const COLORS = {
  primary: '#6a1b9a',
  accent: '#e1bee7',
  gray: '#ccc',
  white: '#fff',
  text: '#333',
  background: '#f4f4f8',
  borderColor: '#ddd',
};

// 6개의 새로운 보안 질문 목록
const surveyQuestions = [
  {
    id: 'q1',
    question: '비밀번호를 만들 때 가장 중요하다고 생각하는 것은 무엇인가요?',
    options: ['길고 복잡하게 만들기', '기억하기 쉽게 만들기', '자주 사용하는 단어 포함하기'],
  },
  {
    id: 'q2',
    question: '모르는 사람에게 온 이메일의 링크를 클릭하는 것에 대해 어떻게 생각하시나요?',
    options: ['필요하면 클릭한다', '절대 클릭하면 안 된다', '보낸 사람을 확인 후 결정한다'],
  },
  {
    id: 'q3',
    question: '카페와 같은 공용 와이파이(Public Wi-Fi) 사용 시, 금융 거래를 하는 것은 안전할까요?',
    options: ['급하면 괜찮다', '안전하지 않으므로 피해야 한다', '비밀번호만 안 쓰면 괜찮다'],
  },
  {
    id: 'q4',
    question: "은행에서 보낸 '계좌가 잠겼습니다'라는 내용의 문자를 받았다면 어떻게 해야 할까요?",
    options: ['문자의 링크를 클릭해 확인한다', '은행 공식 앱이나 웹사이트로 직접 확인한다', '답장을 보내 내 정보가 맞는지 묻는다'],
  },
  {
    id: 'q5',
    question: '스마트폰이나 컴퓨터의 소프트웨어 업데이트 알림이 뜨면 어떻게 하는 것이 가장 안전한가요?',
    options: ["'나중에 하기'를 누른다", '즉시 업데이트를 설치한다', '업데이트는 불필요하므로 무시한다'],
  },
  {
    id: 'q6',
    text: '로그인 시 아이디와 비밀번호 외에 추가 인증(2FA)을 요구하는 기능에 대한 설명으로 가장 올바른 것은 무엇인가요?',
    options: ['불편하므로 사용하지 않는 것이 좋다', '계정 보안을 크게 강화하는 필수 기능이다', '해커에게는 아무 소용 없는 기능이다'],
  },
];

// 새로운 질문에 대한 점수 매핑 (정답: 2점, 오답: 0점)
const scoreMapping = {
  '길고 복잡하게 만들기': 2,
  '보낸 사람을 확인 후 결정한다': 2,
  '안전하지 않으므로 피해야 한다': 2,
  '은행 공식 앱이나 웹사이트로 직접 확인한다': 2,
  '즉시 업데이트를 설치한다': 2,
  '계정 보안을 크게 강화하는 필수 기능이다': 2,
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
      // scoreMapping에 있는 정답이면 2점, 없으면 0점을 더합니다.
      score += scoreMapping[answer] || 0;
    }

    setTotalScore(score);

    // 총점 12점 만점 기준
    if (score >= 10) return "안전";       // 5문제 이상 정답
    if (score >= 6) return "보안 권장";   // 3~4문제 정답
    return "위험";                       // 0~2문제 정답
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < surveyQuestions.length) {
      Alert.alert("설문 미완료", "모든 문항에 응답해주세요.");
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
        // --- 설문조사 진행 화면 ---
        <>
          <Text style={styles.title}>기본 보안 인식 설문조사</Text>
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
            <Text style={styles.submitButtonText}>제출하고 결과 보기</Text>
          </TouchableOpacity>
        </>
      ) : (
        // --- 설문조사 결과 화면 ---
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>설문 결과: {result}</Text>
          <Text style={styles.resultScore}>보안 점수: {totalScore} / 12</Text>
          <Text style={styles.resultDescription}>
            {result === "안전"
              ? "훌륭합니다! 기본적인 보안 수칙을 잘 지키고 계십니다."
              : result === "보안 권장"
              ? "좋습니다. 하지만 몇 가지 습관을 개선하면 더욱 안전해질 수 있습니다."
              : "주의가 필요합니다. 계정 보안을 위해 즉각적인 개선이 필요합니다."}
          </Text>
          <TouchableOpacity onPress={handleStartScan} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>자동 스캔 검사 시작하기</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestartSurvey} style={styles.restartButton}>
            <Text style={styles.restartButtonText}>처음부터 다시하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// home.styles.js를 참고하여 개선된 스타일
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
  // 결과 화면 스타일
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
    backgroundColor: '#aaa', // '다시하기'는 다른 색상으로
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