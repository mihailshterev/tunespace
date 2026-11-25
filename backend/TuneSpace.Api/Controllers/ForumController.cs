using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneSpace.Core.DTOs.Requests.Forum;
using TuneSpace.Core.DTOs.Responses.Forum;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ForumController(
    IForumService forumService,
    ILogger<ForumController> logger) : ControllerBase
{
    private readonly IForumService _forumService = forumService;
    private readonly ILogger<ForumController> _logger = logger;

    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryResponse>>> GetAllCategories()
    {
        try
        {
            var categories = await _forumService.GetAllCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving forum categories");
            return StatusCode(500, "An error occurred while retrieving forum categories");
        }
    }

    [HttpGet("categories/{categoryId}")]
    public async Task<ActionResult<CategoryResponse>> GetCategoryById(Guid categoryId)
    {
        if (categoryId == Guid.Empty)
        {
            return BadRequest("Category ID cannot be empty");
        }

        try
        {
            var category = await _forumService.GetCategoryByIdAsync(categoryId);
            if (category is null)
            {
                return NotFound("Forum category not found");
            }

            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving forum category");
            return StatusCode(500, "An error occurred while retrieving the forum category");
        }
    }

    [HttpGet("categories/{categoryId}/threads")]
    public async Task<ActionResult<List<ThreadResponse>>> GetThreadsByCategory(Guid categoryId)
    {
        try
        {
            var threads = await _forumService.GetThreadsByCategoryAsync(categoryId);
            return Ok(threads);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving threads for category {CategoryId}", categoryId);
            return StatusCode(500, "An error occurred while retrieving threads");
        }
    }

    [HttpGet("threads/{threadId}")]
    public async Task<ActionResult<ThreadDetailResponse>> GetThreadDetail(Guid threadId)
    {
        if (threadId == Guid.Empty)
        {
            return BadRequest("Thread ID cannot be empty");
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid or missing user ID");
        }

        try
        {
            var thread = await _forumService.GetThreadDetailAsync(threadId, userId);
            if (thread is null)
            {
                return NotFound("Thread not found");
            }

            await _forumService.IncrementThreadViewAsync(threadId);

            return Ok(thread);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving thread details for thread {ThreadId}", threadId);
            return StatusCode(500, "An error occurred while retrieving thread details");
        }
    }

    [HttpGet("posts/{postId}")]
    public async Task<ActionResult<ForumPostResponse>> GetPostById(Guid postId)
    {
        if (postId == Guid.Empty)
        {
            return BadRequest("Post ID cannot be empty");
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid or missing user ID");
        }

        try
        {
            var post = await _forumService.GetPostByIdAsync(postId, userId);
            if (post is null)
            {
                return NotFound("Post not found");
            }

            return Ok(post);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving post {PostId}", postId);
            return StatusCode(500, "An error occurred while retrieving the post");
        }
    }

    [HttpGet("threads/band/{bandId}")]
    public async Task<ActionResult<List<ThreadResponse>>> GetBandThreads(Guid bandId)
    {
        if (bandId == Guid.Empty)
        {
            return BadRequest("Band ID cannot be empty");
        }

        try
        {
            var threads = await _forumService.GetBandThreads(bandId);
            return Ok(threads);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving threads for band {bandId}", bandId);
            return StatusCode(500, "An error occurred while retrieving threads");
        }
    }

    [HttpPost("categories")]
    public async Task<ActionResult<CategoryResponse>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        try
        {
            var category = await _forumService.CreateCategoryAsync(request);
            return CreatedAtAction(nameof(GetCategoryById), new { categoryId = category.Id }, category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating forum category");
            return StatusCode(500, "An error occurred while creating the forum category");
        }
    }

    [HttpPost("threads")]
    public async Task<ActionResult<ThreadResponse>> CreateThread([FromBody] CreateThreadRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var thread = await _forumService.CreateThreadAsync(request, userId);
            return CreatedAtAction(nameof(GetThreadDetail), new { threadId = thread.Id }, thread);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid arguments when creating thread");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating thread");
            return StatusCode(500, "An error occurred while creating the thread");
        }
    }

    [HttpPost("posts")]
    public async Task<ActionResult<ForumPostResponse>> CreatePost([FromBody] CreatePostRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var post = await _forumService.CreatePostAsync(request, userId);
            return CreatedAtAction(nameof(GetPostById), new { postId = post.Id }, post);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid arguments when creating post");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating post");
            return StatusCode(500, "An error occurred while creating the post");
        }
    }

    [HttpPost("posts/{postId}/like")]
    public async Task<ActionResult> LikePost(Guid postId)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var result = await _forumService.LikePostAsync(postId, userId);
            return Ok(new { success = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error liking post {PostId}", postId);
            return StatusCode(500, "An error occurred while liking the post");
        }
    }

    [HttpDelete("posts/{postId}/unlike")]
    public async Task<ActionResult> UnlikePost(Guid postId)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var result = await _forumService.UnlikePostAsync(postId, userId);
            return Ok(new { success = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unliking post {PostId}", postId);
            return StatusCode(500, "An error occurred while unliking the post");
        }
    }
}
