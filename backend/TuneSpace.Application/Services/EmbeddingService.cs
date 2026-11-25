using System.Data;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using Microsoft.ML.Tokenizers;
using Pgvector;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Application.Services;

//TODO: Use actual ONNX model and tokenizer for embeddings and refactor
internal class EmbeddingService : IEmbeddingService, IDisposable
{
    private readonly InferenceSession? _session;
    private readonly Tokenizer? _tokenizer;
    private bool _disposed = false;

    public EmbeddingService()
    {
        try
        {
            var modelPath = GetModelPath();
            if (File.Exists(modelPath) && new FileInfo(modelPath).Length > 10)
            {
                _session = new InferenceSession(modelPath);
            }
            _tokenizer = GetTokenizer();
        }
        catch
        {

        }
    }

    async Task<Vector> IEmbeddingService.GenerateEmbeddingAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return new Vector(new float[384]);
        }

        var embeddings = await ((IEmbeddingService)this).GenerateBatchEmbeddingsAsync([text]);
        return embeddings.FirstOrDefault() ?? new Vector(new float[384]);
    }

    async Task<List<Vector>> IEmbeddingService.GenerateBatchEmbeddingsAsync(List<string> texts)
    {
        var results = new List<Vector>();

        if (_session == null || _tokenizer == null)
        {
            await Task.Delay(1);
            return [.. texts.Select(GenerateSimpleEmbedding)];
        }

        try
        {
            foreach (var text in texts)
            {
                if (string.IsNullOrWhiteSpace(text))
                {
                    results.Add(new Vector(new float[384]));
                    continue;
                }

                var tokens = SimpleTokenize(text);
                var inputIds = tokens.Take(512).ToArray();

                var paddedIds = new long[512];
                for (int i = 0; i < inputIds.Length; i++)
                {
                    paddedIds[i] = inputIds[i];
                }

                var attentionMask = paddedIds.Select(id => id != 0 ? 1L : 0L).ToArray();

                var inputTensor = new DenseTensor<long>(paddedIds, [1, 512]);
                var attentionTensor = new DenseTensor<long>(attentionMask, [1, 512]);

                var inputs = new List<NamedOnnxValue>
                {
                    NamedOnnxValue.CreateFromTensor("input_ids", inputTensor),
                    NamedOnnxValue.CreateFromTensor("attention_mask", attentionTensor)
                };

                using var outputs = _session.Run(inputs);
                var rawEmbedding = outputs[0].AsTensor<float>().ToArray();

                var pooled = new float[384];
                for (int i = 0; i < Math.Min(384, rawEmbedding.Length); i++)
                {
                    pooled[i] = rawEmbedding[i];
                }

                var norm = Math.Sqrt(pooled.Sum(x => x * x));
                if (norm > 0)
                {
                    for (int i = 0; i < pooled.Length; i++)
                    {
                        pooled[i] /= (float)norm;
                    }
                }

                results.Add(new Vector(pooled));
            }
        }
        catch
        {
            while (results.Count < texts.Count)
            {
                results.Add(new Vector(new float[384]));
            }
        }

        return results;
    }

    async Task<Vector> IEmbeddingService.GenerateArtistEmbeddingAsync(string artistName, List<string> genres, string? location, string? description)
    {
        var parts = new List<string> { artistName };
        if (genres.Count != 0) parts.Add($"Genres: {string.Join(", ", genres)}");
        if (!string.IsNullOrEmpty(location)) parts.Add($"Location: {location}");
        if (!string.IsNullOrEmpty(description)) parts.Add($"Description: {description}");

        return await ((IEmbeddingService)this).GenerateEmbeddingAsync(string.Join(". ", parts));
    }

    async Task<Vector> IEmbeddingService.GenerateUserPreferenceEmbeddingAsync(List<string> topArtists, List<string> genres, List<string> recentlyPlayed)
    {
        var parts = new List<string>();
        if (topArtists.Count != 0) parts.Add($"Favorite artists: {string.Join(", ", topArtists.Take(10))}");
        if (genres.Count != 0) parts.Add($"Preferred genres: {string.Join(", ", genres.Take(10))}");
        if (recentlyPlayed.Count != 0) parts.Add($"Recently played: {string.Join(", ", recentlyPlayed.Take(10))}");

        return await ((IEmbeddingService)this).GenerateEmbeddingAsync(string.Join(". ", parts));
    }

    double IEmbeddingService.CalculateSimilarity(Vector v1, Vector v2)
    {
        var a = v1.Memory.ToArray();
        var b = v2.Memory.ToArray();

        if (a.Length != b.Length) return 0;

        var dot = a.Zip(b, (x, y) => x * y).Sum();
        var magA = Math.Sqrt(a.Sum(x => x * x));
        var magB = Math.Sqrt(b.Sum(x => x * x));

        return (magA == 0 || magB == 0) ? 0 : dot / (magA * magB);
    }

    async Task<bool> IEmbeddingService.IsServiceAvailableAsync()
    {
        try
        {
            var test = await ((IEmbeddingService)this).GenerateEmbeddingAsync("test");
            return test.Memory.Length > 0;
        }
        catch
        {
            return false;
        }
    }

    private static string GetModelPath()
    {
        var baseDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "MlModels");
        return Path.Combine(baseDir, "sentence-transformer.onnx");
    }

    private static Tokenizer? GetTokenizer()
    {
        try
        {
            return null;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Failed to load tokenizer: {e.Message}");
            return null;
        }
    }

    private static Vector GenerateSimpleEmbedding(string text)
    {
        var embedding = new float[384];
        if (string.IsNullOrWhiteSpace(text)) return new Vector(embedding);

        var rand = new Random(text.GetHashCode());
        for (int i = 0; i < embedding.Length; i++)
        {
            embedding[i] = (float)(rand.NextDouble() * 2 - 1);
        }

        var norm = Math.Sqrt(embedding.Sum(x => x * x));
        if (norm > 0)
        {
            for (int i = 0; i < embedding.Length; i++)
            {
                embedding[i] /= (float)norm;
            }
        }

        return new Vector(embedding);
    }

    private static long[] SimpleTokenize(string text)
    {
        var tokens = text.ToLowerInvariant()
            .Split([' ', '.', ',', '!', '?', '\n', '\t'], StringSplitOptions.RemoveEmptyEntries)
            .Select(w => (long)(Math.Abs(w.GetHashCode()) % 30000 + 1000))
            .ToArray();

        return tokens;
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _session?.Dispose();
            _disposed = true;
        }
    }
}
