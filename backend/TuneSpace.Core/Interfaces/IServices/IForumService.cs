using TuneSpace.Core.DTOs.Requests.Forum;
using TuneSpace.Core.DTOs.Responses.Forum;

namespace TuneSpace.Core.Interfaces.IServices;

/// <summary>
/// Service interface for managing forum-related operations
/// </summary>
public interface IForumService
{
    /// <summary>
    /// Retrieves all forum categories
    /// </summary>
    /// <returns>A list of all forum categories</returns>
    Task<List<CategoryResponse>> GetAllCategoriesAsync();

    /// <summary>
    /// Retrieves a specific forum category by its ID
    /// </summary>
    /// <param name="categoryId">The ID of the category to retrieve</param>
    /// <returns>The category if found, null otherwise</returns>
    Task<CategoryResponse?> GetCategoryByIdAsync(Guid categoryId);

    /// <summary>
    /// Retrieves all threads in a specific category
    /// </summary>
    /// <param name="categoryId">The ID of the category</param>
    /// <returns>A list of threads belonging to the category</returns>
    Task<List<ThreadResponse>> GetThreadsByCategoryAsync(Guid categoryId);

    /// <summary>
    /// Retrieves detailed information about a thread including its posts
    /// </summary>
    /// <param name="threadId">The ID of the thread to retrieve</param>
    /// <param name="userId">The ID of the user viewing the thread (for like status)</param>
    /// <returns>Detailed information about the thread if found, null otherwise</returns>
    Task<ThreadDetailResponse?> GetThreadDetailAsync(Guid threadId, Guid userId);

    /// <summary>
    /// Retrieves all forum threads associated with a specific band
    /// </summary>
    /// <param name="bandId">The ID of the band whose threads to retrieve</param>
    /// <returns>A list of threads associated with the specified band</returns>
    Task<List<ThreadResponse>?> GetBandThreads(Guid bandId);

    /// <summary>
    /// Retrieves a specific forum post with like information for the requesting user
    /// </summary>
    /// <param name="postId">The ID of the post to retrieve</param>
    /// <param name="userId">The ID of the user viewing the post (for like status)</param>
    /// <returns>The post information if found, null otherwise</returns>
    Task<ForumPostResponse?> GetPostByIdAsync(Guid postId, Guid userId);

    /// <summary>
    /// Creates a new forum category
    /// </summary>
    /// <param name="request">The category creation request containing category details</param>
    /// <returns>A response containing the created category information</returns>
    Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);

    /// <summary>
    /// Creates a new forum thread
    /// </summary>
    /// <param name="request">The thread creation request containing thread details</param>
    /// <param name="userId">The ID of the user creating the thread</param>
    /// <returns>A response containing the created thread information</returns>
    Task<ThreadResponse> CreateThreadAsync(CreateThreadRequest request, Guid userId);

    /// <summary>
    /// Creates a new forum post in a thread
    /// </summary>
    /// <param name="request">The post creation request containing post details</param>
    /// <param name="userId">The ID of the user creating the post</param>
    /// <returns>A response containing the created post information</returns>
    Task<ForumPostResponse> CreatePostAsync(CreatePostRequest request, Guid userId);

    /// <summary>
    /// Increments the view count for a specific thread
    /// </summary>
    /// <param name="threadId">The ID of the thread</param>
    /// <returns>A task representing the asynchronous operation</returns>
    Task IncrementThreadViewAsync(Guid threadId);

    /// <summary>
    /// Likes a forum post by a user
    /// </summary>
    /// <param name="postId">The ID of the post to like</param>
    /// <param name="userId">The ID of the user liking the post</param>
    /// <returns>True if the post was successfully liked, false otherwise</returns>
    Task<bool> LikePostAsync(Guid postId, Guid userId);

    /// <summary>
    /// Removes a user's like from a forum post
    /// </summary>
    /// <param name="postId">The ID of the post to unlike</param>
    /// <param name="userId">The ID of the user unliking the post</param>
    /// <returns>True if the post was successfully unliked, false otherwise</returns>
    Task<bool> UnlikePostAsync(Guid postId, Guid userId);
}
