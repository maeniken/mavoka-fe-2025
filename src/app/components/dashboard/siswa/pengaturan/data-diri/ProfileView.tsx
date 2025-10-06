interface ProfileViewProps {
  form: any;
}

export default function ProfileView({ form }: ProfileViewProps) {
  const fields = [
    { label: "Nama Lengkap", value: form.fullName, colSpan: 2 },
    { label: "Email", value: form.email, colSpan: 2 },
    { label: "Jenis Kelamin", value: form.gender, colSpan: 1 },
    { label: "Tanggal Lahir", value: form.birthDate, colSpan: 1 },
    { label: "Nomor Handphone", value: form.phone, colSpan: 2 },
    { label: "Alamat", value: form.address, colSpan: 2 },
    { label: "Provinsi", value: form.province, colSpan: 1 },
    { label: "Kota", value: form.city, colSpan: 1 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => (
        <div
          key={field.label}
          className={`flex flex-col ${
            field.colSpan === 2 ? "md:col-span-2" : ""
          }`}
        >
          <p className="font-medium text-black">
            {field.label}
          </p>
          <p className="mt-1 text-gray-500 border rounded-md px-3 py-2 bg-gray-50">
            {field.value || "-"}
          </p>
        </div>
      ))}
    </div>
  );
}
