import { IoInformationCircle } from "react-icons/io5";
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { BiSolidContact, BiSolidSchool } from "react-icons/bi";
import { IoMdTime } from "react-icons/io";
import { LuIdCard } from "react-icons/lu";
import { FaLink } from "react-icons/fa6";

interface Props {
  type: "lowongan" | "organisasi" | "sekolah";
  title?: string;
  description?: string;
  email?: string | null;
  address?: string | null;
  npsn?: string | null;
  website?: string | null;
  deadline_lamaran?: string | null;
}

export default function DetailDescription({
  type,
  title,
  description,
  email,
  address,
  npsn,
  website,
  deadline_lamaran,
}: Props) {
  return (
    <section className="mt-10 bg-white rounded-xl border p-6 space-y-6">
      {title && description && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <IoInformationCircle className="text-[#0F67B1] text-xl" />
            <h3 className="font-bold ">{title}</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{description}</p>
          <hr className="my-4" />
        </div>
      )}

      {type === "sekolah" && (npsn || website) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BiSolidSchool className="text-[#0F67B1] text-xl" />
            <h3 className="font-bold ">Informasi Sekolah</h3>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 text-gray-700">
            {npsn && (
              <div className="flex items-start gap-2 flex-1">
                <LuIdCard className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>NPSN</p>
                  <p className="font-semibold">{npsn}</p>
                </div>
              </div>
            )}
            {website && (
              <div className="flex items-start gap-2 flex-1">
                <FaLink className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>Website</p>
                  <p className="font-semibold">{website}</p>
                </div>
              </div>
            )}
          </div>
          <hr className="my-4" />
        </div>
      )}

      {type === "sekolah" && (email || address) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BiSolidContact className="text-[#0F67B1] text-xl" />
            <h3 className="font-bold ">Informasi Kontak</h3>
          </div>
          <div className="flex flex-col tablet:flex-row gap-10 text-gray-700">
            {email && (
              <div className="flex items-start gap-2 flex-1">
                <HiOutlineMail className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>Email</p>
                  <p className="font-semibold">{email}</p>
                </div>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2 flex-1">
                <HiOutlineLocationMarker className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>Alamat</p>
                  <p className="font-semibold">{address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {type === "lowongan" && (deadline_lamaran || address) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BiSolidContact className="text-[#0F67B1] text-xl" />
            <h3 className="font-bold">Informasi Magang</h3>
          </div>
          <div className="flex flex-col tablet:flex-row gap-10 text-gray-700">
            {deadline_lamaran && (
              <div className="flex items-start gap-2 flex-1">
                <IoMdTime className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>Deadline Lamaran</p>
                  <p className="font-semibold">{deadline_lamaran}</p>
                </div>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2 flex-1">
                <HiOutlineLocationMarker className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>Alamat</p>
                  <p className="font-semibold">{address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {type === "organisasi" && (email || address) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BiSolidContact className="text-[#0F67B1] text-xl" />
            <h3 className="font-bold">Informasi Kontak</h3>
          </div>
          <div className="flex flex-col tablet:flex-row gap-10 text-gray-700">
            {email && (
              <div className="flex items-start gap-2 flex-1">
                <HiOutlineMail className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>Email</p>
                  <p className="font-semibold">{email}</p>
                </div>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2 flex-1">
                <HiOutlineLocationMarker className="text-[#0F67B1] text-lg mt-1" />
                <div>
                  <p>Alamat</p>
                  <p className="font-semibold">{address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
