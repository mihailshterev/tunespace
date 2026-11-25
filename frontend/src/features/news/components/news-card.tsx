import type NewsArticle from "@/features/news/types/news-article";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ExternalLink } from "lucide-react";
import { getTimeAgo } from "@/shared/utils/helpers";

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard = ({ article }: NewsCardProps) => {
  const timeAgo = getTimeAgo(article.publishedAt);

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <CardHeader className="p-0">
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={
              article.urlToImage ||
              "https://placehold.co/600x400?text=Music+News"
            }
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
            >
              {article.source.name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        <CardTitle className="line-clamp-2 mb-2 text-xl">
          {article.title}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {article.description || "No description available"}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t border-border/30">
        <div className="text-sm text-muted-foreground">{timeAgo}</div>
        <Button variant="link" size="sm" asChild className="gap-1">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read more <ExternalLink size={14} />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
