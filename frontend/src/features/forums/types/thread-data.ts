import type ThreadPost from "./thread-post";

export default interface ThreadData {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  posts: ThreadPost[];
}
