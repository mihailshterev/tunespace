using Microsoft.EntityFrameworkCore;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Infrastructure.Data;

namespace TuneSpace.Infrastructure.Repositories;

internal class ForumRepository(TuneSpaceDbContext context) : IForumRepository
{
    private readonly TuneSpaceDbContext _context = context;

    async Task<List<ForumCategory>> IForumRepository.GetAllCategoriesAsync()
    {
        return await _context.ForumCategories
            .Include(c => c.Threads)
                .ThenInclude(t => t.Posts)
            .Where(c => c.IsActive)
            .ToListAsync();
    }

    async Task<ForumCategory?> IForumRepository.GetCategoryByIdAsync(Guid categoryId)
    {
        return await _context.ForumCategories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.IsActive);
    }

    async Task<List<ForumThread>> IForumRepository.GetThreadsByCategoryAsync(Guid categoryId)
    {
        return await _context.ForumThreads
            .Include(t => t.Author)
            .Include(t => t.Posts)
            .Include(t => t.Category)
            .Where(t => t.CategoryId == categoryId)
            .OrderByDescending(t => t.IsPinned)
            .ThenByDescending(t => t.LastActivityAt)
            .ToListAsync();
    }

    async Task<ForumThread?> IForumRepository.GetThreadByIdAsync(Guid threadId)
    {
        return await _context.ForumThreads
            .Include(t => t.Category)
            .Include(t => t.Author)
            .FirstOrDefaultAsync(t => t.Id == threadId);
    }

    async Task<List<ForumThread>?> IForumRepository.GetThreadsByAuthorId(Guid authorId)
    {
        return await _context.ForumThreads
            .Include(t => t.Category)
            .Include(t => t.Author)
            .Include(t => t.Posts)
                .ThenInclude(p => p.Author)
            .Where(t => t.AuthorId == authorId)
            .ToListAsync();
    }

    async Task<List<ForumThread>> IForumRepository.GetThreadsByAuthorIds(IReadOnlyCollection<Guid> authorIds)
    {
        if (authorIds.Count == 0)
        {
            return [];
        }

        return await _context.ForumThreads
            .Include(t => t.Category)
            .Include(t => t.Author)
            .Include(t => t.Posts)
                .ThenInclude(p => p.Author)
            .Where(t => authorIds.Contains(t.AuthorId))
            .OrderByDescending(t => t.LastActivityAt)
            .ToListAsync();
    }

    async Task<ForumThread?> IForumRepository.GetThreadDetailWithPostsAsync(Guid threadId)
    {
        return await _context.ForumThreads
            .Include(t => t.Category)
            .Include(t => t.Author)
            .Include(t => t.Posts)
                .ThenInclude(p => p.Author)
            .Include(t => t.Posts)
                .ThenInclude(p => p.Likes)
            .FirstOrDefaultAsync(t => t.Id == threadId);
    }

    async Task<ForumPost?> IForumRepository.GetPostByIdAsync(Guid postId)
    {
        return await _context.ForumPosts
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .FirstOrDefaultAsync(p => p.Id == postId);
    }

    async Task<ForumPostLike?> IForumRepository.GetPostLikeAsync(Guid postId, Guid userId)
    {
        return await _context.ForumPostLikes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
    }

    async Task<int> IForumRepository.GetPostLikeCountAsync(Guid postId)
    {
        return await _context.ForumPostLikes
            .CountAsync(l => l.PostId == postId);
    }

    async Task<bool> IForumRepository.HasUserLikedPostAsync(Guid postId, Guid userId)
    {
        return await _context.ForumPostLikes
            .AnyAsync(l => l.PostId == postId && l.UserId == userId);
    }

    async Task<ForumCategory> IForumRepository.InsertCategoryAsync(ForumCategory category)
    {
        _context.ForumCategories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    async Task<ForumThread> IForumRepository.InsertThreadAsync(ForumThread thread)
    {
        _context.ForumThreads.Add(thread);
        await _context.SaveChangesAsync();
        return thread;
    }

    async Task<ForumPost> IForumRepository.InsertPostAsync(ForumPost post)
    {
        _context.ForumPosts.Add(post);
        await _context.SaveChangesAsync();
        return post;
    }

    async Task<ForumPostLike> IForumRepository.InsertPostLikeAsync(ForumPostLike like)
    {
        _context.ForumPostLikes.Add(like);
        await _context.SaveChangesAsync();
        return like;
    }

    async Task IForumRepository.UpdateThreadLastActivityAsync(Guid threadId, DateTime activityDate)
    {
        var thread = await _context.ForumThreads.FindAsync(threadId);
        if (thread != null)
        {
            thread.LastActivityAt = activityDate;
            await _context.SaveChangesAsync();
        }
    }

    async Task IForumRepository.IncrementThreadViewAsync(Guid threadId)
    {
        var thread = await _context.ForumThreads.FindAsync(threadId);
        if (thread != null)
        {
            thread.Views++;
            await _context.SaveChangesAsync();
        }
    }

    async Task IForumRepository.RemovePostLikeAsync(ForumPostLike like)
    {
        _context.ForumPostLikes.Remove(like);
        await _context.SaveChangesAsync();
    }
}
