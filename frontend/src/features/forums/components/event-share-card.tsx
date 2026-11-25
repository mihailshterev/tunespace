import { Card, CardContent } from "@/shared/ui/card";
import {
  CalendarDays,
  Clock,
  MapPin,
  Building,
  Ticket,
  Music,
} from "lucide-react";

interface EventShareCardProps {
  content: string;
}

const EventShareCard = ({ content }: EventShareCardProps) => {
  if (!content || typeof content !== "string") {
    return null;
  }
  const parseEventShare = (content: string) => {
    const isEventShare =
      content.includes("🎵") && content.includes("# 🎵 Event Announcement:");

    if (!isEventShare) {
      return null;
    }

    const result: Record<string, string> = { type: "event" };

    const titleMatch = content.match(/# 🎵 Event Announcement: (.+?)(?:\n|$)/);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    }

    const bandMatch = content.match(/🎤 \*\*Band:\*\* (.+?)(?:\n|$)/);
    if (bandMatch) {
      result.bandName = bandMatch[1].trim();
    }

    const dateMatch = content.match(/📅 \*\*Date:\*\* (.+?)(?:\n|$)/);
    if (dateMatch) {
      result.date = dateMatch[1].trim();
    }

    const timeMatch = content.match(/⏰ \*\*Time:\*\* (.+?)(?:\n|$)/);
    if (timeMatch) {
      result.time = timeMatch[1].trim();
    }

    const locationMatch = content.match(/📍 \*\*Location:\*\* (.+?)(?:\n|$)/);
    if (locationMatch) {
      result.location = locationMatch[1].trim();
    }

    const venueMatch = content.match(/🏢 \*\*Venue:\*\* (.+?)(?:\n|$)/);
    if (venueMatch) {
      result.venue = venueMatch[1].trim();
    }

    const addressMatch = content.match(/🗺️ \*\*Address:\*\* (.+?)(?:\n|$)/);
    if (addressMatch) {
      result.address = addressMatch[1].trim();
    }

    const priceMatch = content.match(
      /🎫 \*\*Ticket Price:\*\* \$(.+?)(?:\n|$)/
    );
    if (priceMatch) {
      result.ticketPrice = priceMatch[1].trim();
    }

    const ticketUrlMatch = content.match(
      /🎟️ \*\*Get Tickets:\*\* \[Buy Tickets Here\]\(([^)]+)\)/
    );
    if (ticketUrlMatch) {
      result.ticketUrl = ticketUrlMatch[1];
    }

    const descriptionMatch = content.match(
      /## 📝 Event Description\n\n([\s\S]*?)(?:\n## |$)/
    );
    if (descriptionMatch) {
      result.description = descriptionMatch[1].trim();
    }

    const commentMatch = content.match(
      /## 💭 Why I'm Sharing This\n\n([\s\S]*?)(?:\n\*|$)/
    );
    if (commentMatch) {
      result.userComment = commentMatch[1].trim();
    }

    return result.title ? result : null;
  };

  const eventData = parseEventShare(content);

  if (!eventData || !eventData.title) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
              <CalendarDays className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {eventData.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  by {eventData.bandName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              {eventData.date && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{eventData.date}</span>
                </div>
              )}
              {eventData.time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{eventData.time}</span>
                </div>
              )}
              {eventData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{eventData.location}</span>
                </div>
              )}
            </div>

            {(eventData.venue ||
              eventData.address ||
              eventData.ticketPrice) && (
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {eventData.venue && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{eventData.venue}</span>
                  </div>
                )}
                {eventData.ticketPrice && (
                  <div className="flex items-center gap-1">
                    <Ticket className="h-4 w-4" />
                    <span>${eventData.ticketPrice}</span>
                  </div>
                )}
              </div>
            )}

            {eventData.description && (
              <div className="bg-card rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">
                  {eventData.description}
                </p>
              </div>
            )}

            {/* no tickets system yet */}
            {/* <div className="pt-2">
              {eventData.ticketUrl && (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => window.open(eventData.ticketUrl, "_blank")}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Get Tickets
                </Button>
              )}
            </div> */}
          </div>
        </div>

        {eventData.userComment && (
          <div className="mt-4 p-4 bg-card rounded-lg shadow-sm border-l-2 border-l-primary">
            {" "}
            <p className="text-muted-foreground italic">
              &quot;{eventData.userComment}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventShareCard;
