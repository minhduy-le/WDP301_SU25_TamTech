import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import { getActiveBlogsAPI } from "@/utils/api";
import { IBlog } from "@/types/model";
import Toast from "react-native-root-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import AntDesign from "@expo/vector-icons/AntDesign";

const { width } = Dimensions.get("window");

const BlogPage = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getActiveBlogsAPI();
      if (response.data) {
        setBlogs(response.data.blogs || []);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Toast.show("Không thể tải danh sách blog", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.CANCEL,
        opacity: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBlogs();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return "N/A";
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleBlogPress = (blog: IBlog) => {
    Toast.show(`Đang xem: ${blog.title}`, {
      duration: Toast.durations.SHORT,
      textColor: "white",
      backgroundColor: APP_COLOR.ORANGE,
      opacity: 1,
    });
  };

  const renderBlogCard = (blog: IBlog) => (
    <TouchableOpacity
      key={blog.id}
      style={styles.blogCard}
      onPress={() => handleBlogPress(blog)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: blog.image }} style={styles.blogImage} />
      </View>

      <View style={styles.blogContent}>
        <View style={styles.blogHeader}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {blog.title}
          </Text>
          <View style={styles.authorContainer}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {blog.Author.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{blog.Author.fullName}</Text>
              <Text style={styles.blogDate}>{formatDate(blog.createdAt)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.blogExcerpt}>
          {truncateText(blog.content.replace(/\\n/g, " "), 150)}
        </Text>

        <View style={styles.blogFooter}>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Cơm Tấm</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Ẩm Thực</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
        <Text style={styles.loadingText}>Đang tải blog...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blog Ẩm Thực</Text>
        <Text style={styles.headerSubtitle}>
          Khám phá những câu chuyện thú vị về ẩm thực Việt Nam
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {blogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="inbox" size={64} color={APP_COLOR.GREY} />
            <Text style={styles.emptyTitle}>Chưa có blog nào</Text>
            <Text style={styles.emptySubtitle}>
              Hãy quay lại sau để xem những bài viết mới nhất
            </Text>
          </View>
        ) : (
          blogs.map(renderBlogCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: APP_COLOR.WHITE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: APP_COLOR.GREY,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: APP_COLOR.GREY,
    textAlign: "center",
    lineHeight: 22,
  },
  blogCard: {
    backgroundColor: APP_COLOR.WHITE,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  blogImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readTimeText: {
    color: APP_COLOR.WHITE,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginLeft: 4,
  },
  blogContent: {
    padding: 20,
  },
  blogHeader: {
    marginBottom: 12,
  },
  blogTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    lineHeight: 26,
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_COLOR.ORANGE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  authorInitial: {
    color: APP_COLOR.WHITE,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
    marginBottom: 2,
  },
  blogDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: APP_COLOR.GREY,
  },
  blogExcerpt: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
    lineHeight: 20,
    marginBottom: 16,
  },
  blogFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flex: 1,
  },
  tag: {
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: APP_COLOR.ORANGE,
  },
});

export default BlogPage;
