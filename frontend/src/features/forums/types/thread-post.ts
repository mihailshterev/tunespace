export default interface ThreadPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: "listener" | "admin" | "moderator" | "user";
  content: string;
  createdAt: Date;
  likesCount: number;
  userHasLiked: boolean;
  parentPostId?: string | null;
  replies?: ThreadPost[];
}
