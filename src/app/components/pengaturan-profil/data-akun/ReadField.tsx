//import { Pencil } from "lucide-react";

//interface ReadProps {
//  label: string;
//  name: string;
//  type?: string;
//  value: string;
//  placeholder?: string;
//  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
//  disabled?: boolean;
//  className?: string;
//  onEdit?: () => void; // optional edit handler to show pencil
//}

//export default function ReadField({
//  label,
//  name,
//  type = "text",
//  value,
//  placeholder,
//  onChange,
//  disabled = false,
//  onEdit,
//}: ReadProps) {
//  return (
//    <div className="flex flex-col mb-4">
//      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
//      <div className="relative">
//        <input
//          type={type}
//          name={name}
//          value={value}
//          placeholder={placeholder}
//          onChange={onChange}
//          disabled={disabled}
//          className={`text-sm mt-1 border-[2px] rounded-md px-3 py-2 bg-gray-50 
//  ${disabled ? "border-gray-300 text-gray-500" : "border-[#0F67B1]"} 
//  ${!disabled && "focus:border-[#0F67B1]"} 
//  focus:outline-none w-full`}
//        />

//        {onEdit && (
//          <button
//            type="button"
//            onClick={onEdit}
//            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0F67B1] hover:text-[#116ACC] bg-transparent p-0"
//            aria-label={`Edit ${label}`}
//          >
//            <Pencil size={16} />
//          </button>
//        )}
//      </div>
//    </div>
//  );
//}

interface ReadProps {
  label: string;
  name: string;
  type?: string; // "text" | "email" | "textarea" | ...
  value: string;
  placeholder?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  disabled?: boolean;
  className?: string;
  rows?: number; // opsional untuk textarea
}

export default function ReadField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  disabled = false,
  className = "",
  rows = 4,
}: ReadProps) {
  const base =
    "text-sm mt-1 border rounded-md px-3 py-2 w-full focus:outline-none transition";
  const disabledCls =
    "border-[#B7B7B7] text-[#858585] placeholder-[#858585] bg-gray-50 cursor-not-allowed";
  const editableCls = "border-[#0F67B1] focus:border-2 focus:border-[#0F67B1]";

  const cls =
    [base, disabled ? disabledCls : editableCls, className].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col mb-4">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange as any}
            disabled={disabled}
            rows={rows}
            className={[
              cls,
              // ukuran responsif agar nyaman di mobile/tablet
              "min-h-28 tablet:min-h-36 desktop:min-h-40 resize-y",
              // biar teks rapi kalau ada newline/panjang
              "whitespace-pre-wrap leading-relaxed"
            ].join(" ")}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange as any}
            disabled={disabled}
            className={cls}
          />
        )}
      </div>
    </div>
  );
}
