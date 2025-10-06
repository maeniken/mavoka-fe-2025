import { Pencil } from "lucide-react";

interface ReadProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  onEdit?: () => void; // optional edit handler to show pencil
}

export default function ReadField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  disabled = false,
  onEdit,
}: ReadProps) {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          className={`text-sm mt-1 border-[2px] rounded-md px-3 py-2 bg-gray-50 
  ${disabled ? "border-gray-300 text-gray-500" : "border-[#0F67B1]"} 
  ${!disabled && "focus:border-[#0F67B1]"} 
  focus:outline-none w-full`}
        />

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0F67B1] hover:text-[#116ACC] bg-transparent p-0"
            aria-label={`Edit ${label}`}
          >
            <Pencil size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
