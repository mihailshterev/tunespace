export default interface CreatePost {
  content: string;
  threadId: string;
  parentPostId?: string | null;
}
