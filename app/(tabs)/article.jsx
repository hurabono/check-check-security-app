import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';


const securityArticles = [
  {
    id: '1',
    title: 'Phishing scams, you can avoid them as much as you know',
    excerpt: 'We will find out various phishing methods and prevention methods such as smishing and farming that are popular recently.',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800',
    readTime: '5min',
    articleUrl: 'https://privacy.naver.com/knowledge/phishing_prevention?menu=knowledge_info_classroom_phishing_prevention', 
  },
  {
    id: '2',
    title: 'A strong password, the first step in security',
    excerpt: 'Here are some tips on creating passwords that are difficult to hack without easily forgetting.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800',
    readTime: '3min',
    articleUrl: 'https://www.clien.net/service/board/lecture/17519488', 
  },
  {
    id: '3',
    title: 'Public Wi-Fi, Dangers Behind Freebies',
    excerpt: 'I will tell you how to use public Wi-Fi safely in cafes or subways.',
    imageUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=800',
    readTime: '4min',
    articleUrl: 'https://blog.naver.com/haionnet486/223517323626', 
  },
];

const ArticleScreen = () => {
  const router = useRouter();
  const handleArticlePress = async (article) => {
    const supported = await Linking.canOpenURL(article.articleUrl);

    if (supported) {
      await Linking.openURL(article.articleUrl);
    } else {
      Alert.alert("Error", `'${article.articleUrl}' Unable to open address.`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>A story about security</Text>
        <Text style={styles.headerSubtitle}>Check out the latest security trends and helpful tips.</Text>
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
                <Text style={styles.cardMetaText}>{article.readTime} </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ArticleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
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
