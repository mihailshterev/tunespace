export default interface ForumCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  totalThreads: number;
  totalPosts: number;
  pinned?: boolean;
}
