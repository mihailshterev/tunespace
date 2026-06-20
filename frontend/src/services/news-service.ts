import { NewsApiResponse } from "@/interfaces/news/NewsArticle";

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || "YOUR_API_KEY";
const NEWS_API_BASE_URL = "https://newsapi.org/v2";

export const getMusicNews = async (
  page: number = 1,
  pageSize: number = 10,
): Promise<NewsApiResponse> => {
  const params = new URLSearchParams({
    q: '"music industry" OR "new album" OR "music release" OR "band announce" OR "concert tour" OR "music festival" OR "billboard chart" OR "grammy" OR "music award" OR "artist" OR "songwriter" OR "record label" OR "musician" OR "singer" -politics -crime -weather',
    language: "en",
    domains:
      "rollingstone.com,billboard.com,pitchfork.com,nme.com,consequence.net,stereogum.com,spin.com,loudwire.com,musicradar.com,thefader.com",
    sortBy: "publishedAt",
    pageSize: String(pageSize),
    page: String(page),
    apiKey: NEWS_API_KEY,
  });

  const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params}`);

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return response.json();
};
