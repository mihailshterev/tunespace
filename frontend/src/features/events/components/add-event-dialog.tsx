import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { DatePicker } from "@/shared/ui/date-picker";
import useEvents from "@/features/events/hooks/useEvents";

interface AddEventDialogProps {
  bandId: string | undefined;
}

const AddEventDialog = ({ bandId }: AddEventDialogProps) => {
  const { addEvent } = useEvents(bandId || "");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    bandId: bandId,
    title: "",
    description: "",
    date: "",
    time: "",
    address: "",
    venue: "",
    city: "",
    country: "",
    lat: "",
    lon: "",
    ticketPrice: "",
    ticketUrl: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [time, setTime] = useState<string>("10:00");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLocationSelect = (location: any) => {
    const { display_name, lat, lon } = location;

    setForm({
      ...form,
      address: display_name,
      lat,
      lon,
    });
    setLocations([]);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const { venue, city, country } = form;
      if (venue || city || country) {
        const query = encodeURIComponent(`${venue}, ${city}, ${country}`);
        setLoading(true);
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setLocations(data);
            } else {
              setLocations([]);
            }
          })
          .catch(() => {
            toast.error("Error fetching locations.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.venue, form.city, form.country]);

  const handleSubmit = async () => {
    try {
      const [hours, minutes] = form.time.split(":").map(Number);
      console.log(form.date, form.time);
      const eventDate = date;
      eventDate?.setHours(hours, minutes);

      const formData = new FormData();
      formData.append("bandId", form.bandId || "");
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("eventDate", eventDate?.toISOString() || "");
      formData.append(
        "location",
        form.lat && form.lon ? `${form.lat}, ${form.lon}` : ""
      );
      formData.append("venueAddress", form.address || "");
      formData.append("city", form.city || "");
      formData.append("country", form.country || "");
      formData.append("ticketPrice", form.ticketPrice || "");
      formData.append("ticketUrl", form.ticketUrl || "");

      console.log(Object.fromEntries(formData.entries()));
      addEvent(formData);
      toast.success("Concert added successfully!");
      setOpen(false);
      //setForm(null);
    } catch (error) {
      console.log(error);
      toast.error("Could not add concert. Please try again.");
    }
  };
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    setForm({ ...form, time: newTime });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto text-sm px-3 py-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md">
          Add Concert
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                name="venue"
                value={form.venue}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Label htmlFor="location">Address</Label>
              <Input
                id="location"
                name="location"
                value={form.address}
                onChange={handleChange}
                placeholder="Type address, city, or venue"
              />
              {locations.length > 0 && (
                <div className="absolute z-10 bg-background w-full border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                  {locations.map((location) => (
                    <div
                      key={location.place_id}
                      className="cursor-pointer p-2 hover:bg-primary"
                      onClick={() => handleLocationSelect(location)}
                    >
                      {location.display_name}
                    </div>
                  ))}
                </div>
              )}
              {loading && <div className="absolute z-10">Loading...</div>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="ticketPrice">Ticket Price $</Label>
              <Input
                id="ticketPrice"
                name="ticketPrice"
                type="number"
                step="0.01"
                value={form.ticketPrice}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="ticketUrl">Ticket URL</Label>
              <Input
                id="ticketUrl"
                name="ticketUrl"
                value={form.ticketUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <DatePicker selected={date} onSelect={setDate} />
            </div>
            <div>
              <Label htmlFor="time">Time (24-hour format)</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
