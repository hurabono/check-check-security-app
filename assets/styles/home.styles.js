import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 16,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: COLORS.card,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  featuredImageContainer: {
    height: 240,
    backgroundColor: COLORS.primary,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    padding: 20,
  },
  featuredBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  featuredBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredContent: {
    justifyContent: "flex-end",
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  featuredMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
  titleSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  // ... (다른 스타일들은 그대로 유지) ...
  selectedCategoryText: {
    color: COLORS.white,
  },

  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  
  // ## 여기가 최종 수정된 부분입니다 ##
  menuCard: {
    width: "48%",
    height: 240,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    // alignItems로 가로 중앙 정렬
    alignItems: "center",
    // justifyContent로 세로 중앙 정렬 (flex-end에서 변경)
    justifyContent: "center", 
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  menuCardImage: {
    width: 120, // 이미지 너비
    height: 120, // 이미지 높이
    borderRadius: 12,
    marginBottom: 16, // 이미지와 텍스트 사이 간격
  },

  menuCardText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },

  signoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
    width: 100,
    height: 40,
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
  },
});
