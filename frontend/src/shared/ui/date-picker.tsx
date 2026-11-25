import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface Props {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export function DatePicker({ selected, onSelect }: Props) {
  return (
    <div className="max-w-xs text-sm">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        captionLayout="dropdown"
        fromYear={2000}
        toYear={2030}
        footer={
          selected
            ? `Selected: ${format(selected, "dd/MM/yyyy")}`
            : "Pick a date."
        }
      />
    </div>
  );
}
