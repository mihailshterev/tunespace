export default interface MusicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  location?: string;
  bandId: string;
  bandName: string;
  imageUrl?: string;
  ticketPrice?: number;
  ticketUrl?: string;
  venueAddress?: string;
}
