//"use client";
//import { useState } from "react";
//import ProfileHeader from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileHeader";
//import ProfileAvatar from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileAvatar";
//import ProfileView from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileView";
//import ProfileForm from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileForm";
//import AkunHeader from "@/app/components/dashboard/siswa/pengaturan/akun/AkunHeader";
//import AkunView from "@/app/components/dashboard/siswa/pengaturan/akun/AkunView";
//import ChangePasswordFlow from "@/app/components/dashboard/siswa/pengaturan/akun/ChangePasswordFlow";
//import SekolahHeader from "@/app/components/dashboard/siswa/pengaturan/sekolah/SekolahHeader";
//import SekolahView from "@/app/components/dashboard/siswa/pengaturan/sekolah/SekolahView";

//export default function SettingsTabs() {
//  const [activeTab, setActiveTab] = useState<"dataDiri" | "akun" | "sekolah">(
//    "dataDiri"
//  );
//  const [isEditing, setIsEditing] = useState(false);

//  const [form, setForm] = useState({
//    username: "Lisa Mariana Aja",
//    password: "Lisa12345",
//    fullName: "Lisa Mariana Treynggar Amsori",
//    profilePic: "",
//    email: "Lisaaja@gmail.com",
//    gender: "Perempuan",
//    birthDate: "2025-07-12",
//    phone: "0821345566",
//    address: "Gamping",
//    city: "Bojonggede",
//    province: "Jawa Bagian Barat",
//    schoolName: "SMK Negeri 1 Yogyakarta",
//    nisn: "1234567890",
//    kelas: "12",
//    jurusan: "Rekayasa Perangkat Lunak",
//    tahunAjaran: "2024/2025",
//  });

//  const handleChange = (
//    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//  ) => {
//    setForm({ ...form, [e.target.name]: e.target.value });
//  };

//  const handleSave = () => {
//    // nanti kalau ada API, panggil di sini
//    setIsEditing(false);
//  };

//  const handleCancel = () => {
//    setIsEditing(false);
//  };

//  return (
//    <>
//      <div className="flex border-b border-gray-300">
//        {["dataDiri", "akun", "sekolah"].map((tab) => (
//          <button
//            key={tab}
//            className={`rounded-none shadow-none font-semibold ${
//              activeTab === tab
//                ? "border-b-2 border-[#0F67B1] text-[#0F67B1] bg-[#0F67B1]/5"
//                : "text-gray-600 hover:text-[#0F67B1]"
//            }`}
//            onClick={() => setActiveTab(tab as typeof activeTab)}
//          >
//            {tab === "dataDiri" && "Data Diri"}
//            {tab === "akun" && "Akun"}
//            {tab === "sekolah" && "Sekolah"}
//          </button>
//        ))}
//      </div>

//      <div className="bg-white rounded-lg shadow-sm p-6 overflow-auto max-h-[calc(100vh-150px)]">
//        {activeTab === "dataDiri" && (
//          <>
//            <ProfileHeader onEdit={() => setIsEditing(true)} />
//            <ProfileAvatar src={form.profilePic} name={form.fullName} />

//            {!isEditing && <ProfileView form={form} />}

//            {isEditing && (
//              <>
//                <ProfileForm form={form} handleChange={handleChange} />

//                <div className="flex justify-end gap-3 mt-6">
//                  <button
//                    type="button"
//                    onClick={handleCancel}
//                    className="px-4 py-2 rounded-[6px] shadow-md border border-gray-300 text-gray-600 hover:bg-gray-100"
//                  >
//                    Batal
//                  </button>
//                  <button
//                    type="button"
//                    onClick={handleSave}
//                    className="px-4 py-2 rounded-[6px] shadow-md bg-[#0F67B1] text-white hover:opacity-70"
//                  >
//                    Simpan
//                  </button>
//                </div>
//              </>
//            )}
//          </>
//        )}

//        {activeTab === "akun" && (
//          <>
//            <AkunHeader />
//            {!isEditing && (
//              <AkunView
//                form={form}
//                setForm={setForm}
//                onChangePassword={() => setIsEditing(true)}
//              />
//            )}
//            {isEditing && (
//              <ChangePasswordFlow onCancel={() => setIsEditing(false)} />
//            )}
//          </>
//        )}

//        {activeTab === "sekolah" && (
//          <>
//            <SekolahHeader />
//            {!isEditing && <SekolahView form={form} />}
//          </>
//        )}
//      </div>
//    </>
//  );
//}
