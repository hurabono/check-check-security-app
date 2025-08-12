import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors'; // 기존 constants 파일 사용

// --- 보안 이야기 데이터 ---

const securityArticles = [
  {
    id: '1',
    title: '피싱 사기, 아는 만큼 피할 수 있어요',
    excerpt: '최근 유행하는 스미싱, 파밍 등 다양한 피싱 수법과 예방법을 알아봅니다.',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800',
    readTime: '5분',
    articleUrl: 'https://privacy.naver.com/knowledge/phishing_prevention?menu=knowledge_info_classroom_phishing_prevention', 
  },
  {
    id: '2',
    title: '강력한 비밀번호, 보안의 첫걸음',
    excerpt: '쉽게 잊어버리지 않으면서도 해킹하기 어려운 비밀번호를 만드는 꿀팁을 소개합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800',
    readTime: '3분',
    articleUrl: 'https://www.clien.net/service/board/lecture/17519488', 
  },
  {
    id: '3',
    title: '공용 와이파이, 공짜 뒤에 숨은 위험',
    excerpt: '카페나 지하철의 공용 와이파이를 안전하게 사용하는 방법을 알려드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=800',
    readTime: '4분',
    articleUrl: 'https://blog.naver.com/haionnet486/223517323626', 
  },
];

const ArticleScreen = () => {
  const router = useRouter();

  // ## 수정된 부분 ##: 외부 링크를 여는 기능으로 변경
  const handleArticlePress = async (article) => {
    const supported = await Linking.canOpenURL(article.articleUrl);

    if (supported) {
      await Linking.openURL(article.articleUrl);
    } else {
      Alert.alert("오류", `'${article.articleUrl}' 주소를 열 수 없습니다.`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>보안에 관한 이야기</Text>
        <Text style={styles.headerSubtitle}>최신 보안 트렌드와 유용한 팁을 확인해보세요.</Text>
      </View>

      <View style={styles.articleList}>
        {securityArticles.map((article) => (
          <TouchableOpacity 
            key={article.id} 
            style={styles.card} 
            onPress={() => handleArticlePress(article)}
            activeOpacity={1} 
          >
            <Image source={{ uri: article.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{article.title}</Text>
              <Text style={styles.cardExcerpt}>{article.excerpt}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.cardMetaText}>{article.readTime} 소요</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ArticleScreen;

// --- 스타일 시트 ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  articleList: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  cardExcerpt: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  cardMetaText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.textLight,
  },
});
