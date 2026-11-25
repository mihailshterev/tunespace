using TuneSpace.Core.Entities;

namespace TuneSpace.Core.Interfaces.IRepositories;

/// <summary>
/// Repository interface for forum-related data operations
/// </summary>
public interface IForumRepository
{
    /// <summary>
    /// Retrieves all forum categories
    /// </summary>
    /// <returns>A list of all forum categories</returns>
    Task<List<ForumCategory>> GetAllCategoriesAsync();

    /// <summary>
    /// Retrieves a specific forum category by its ID
    /// </summary>
    /// <param name="categoryId">The ID of the category to retrieve</param>
    /// <returns>The category if found, null otherwise</returns>
    Task<ForumCategory?> GetCategoryByIdAsync(Guid categoryId);

    /// <summary>
    /// Retrieves all threads in a specific category
    /// </summary>
    /// <param name="categoryId">The ID of the category</param>
    /// <returns>A list of threads belonging to the category</returns>
    Task<List<ForumThread>> GetThreadsByCategoryAsync(Guid categoryId);

    /// <summary>
    /// Retrieves a specific forum thread by its ID
    /// </summary>
    /// <param name="threadId">The ID of the thread to retrieve</param>
    /// <returns>The thread if found, null otherwise</returns>
    Task<ForumThread?> GetThreadByIdAsync(Guid threadId);

    /// <summary>
    /// Retrieves all forum threads created by a specific user
    /// </summary>
    /// <param name="authorId">The ID of the thread author</param>
    /// <returns>A list of threads created by the specified user</returns>
    Task<List<ForumThread>?> GetThreadsByAuthorId(Guid authorId);

    /// <summary>
    /// Retrieves threads written by any of the given authors, most recently active first.
    /// </summary>
    Task<List<ForumThread>> GetThreadsByAuthorIds(IReadOnlyCollection<Guid> authorIds);

    /// <summary>
    /// Retrieves a thread with all its associated posts
    /// </summary>
    /// <param name="threadId">The ID of the thread</param>
    /// <returns>The thread with its posts if found, null otherwise</returns>
    Task<ForumThread?> GetThreadDetailWithPostsAsync(Guid threadId);

    /// <summary>
    /// Retrieves a specific forum post by its ID
    /// </summary>
    /// <param name="postId">The ID of the post to retrieve</param>
    /// <returns>The post if found, null otherwise</returns>
    Task<ForumPost?> GetPostByIdAsync(Guid postId);

    /// <summary>
    /// Retrieves a like for a specific post by a specific user
    /// </summary>
    /// <param name="postId">The ID of the post</param>
    /// <param name="userId">The ID of the user</param>
    /// <returns>The like if found, null otherwise</returns>
    Task<ForumPostLike?> GetPostLikeAsync(Guid postId, Guid userId);

    /// <summary>
    /// Gets the total number of likes for a specific post
    /// </summary>
    /// <param name="postId">The ID of the post</param>
    /// <returns>The count of likes for the post</returns>
    Task<int> GetPostLikeCountAsync(Guid postId);

    /// <summary>
    /// Checks if a user has liked a specific post
    /// </summary>
    /// <param name="postId">The ID of the post</param>
    /// <param name="userId">The ID of the user</param>
    /// <returns>True if the user has liked the post, false otherwise</returns>
    Task<bool> HasUserLikedPostAsync(Guid postId, Guid userId);

    /// <summary>
    /// Creates a new forum category
    /// </summary>
    /// <param name="category">The category to create</param>
    /// <returns>The created category with assigned ID</returns>
    Task<ForumCategory> InsertCategoryAsync(ForumCategory category);

    /// <summary>
    /// Creates a new forum thread
    /// </summary>
    /// <param name="thread">The thread to create</param>
    /// <returns>The created thread with assigned ID</returns>
    Task<ForumThread> InsertThreadAsync(ForumThread thread);

    /// <summary>
    /// Creates a new forum post
    /// </summary>
    /// <param name="post">The post to create</param>
    /// <returns>The created post with assigned ID</returns>
    Task<ForumPost> InsertPostAsync(ForumPost post);

    /// <summary>
    /// Creates a new like for a forum post
    /// </summary>
    /// <param name="like">The like to create</param>
    /// <returns>The created like with assigned ID</returns>
    Task<ForumPostLike> InsertPostLikeAsync(ForumPostLike like);

    /// <summary>
    /// Updates the last activity timestamp for a thread
    /// </summary>
    /// <param name="threadId">The ID of the thread</param>
    /// <param name="activityDate">The new activity date and time</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task UpdateThreadLastActivityAsync(Guid threadId, DateTime activityDate);

    /// <summary>
    /// Increments the view count for a specific thread
    /// </summary>
    /// <param name="threadId">The ID of the thread</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task IncrementThreadViewAsync(Guid threadId);

    /// <summary>
    /// Removes a like from a forum post
    /// </summary>
    /// <param name="like">The like to remove</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task RemovePostLikeAsync(ForumPostLike like);
}
