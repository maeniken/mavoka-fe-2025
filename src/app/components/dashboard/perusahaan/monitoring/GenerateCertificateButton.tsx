type Props = {
  onClick: () => void;
};

export default function GenerateCertificateButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-[#0F67B1] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
    >
      + Hasilkan Sertifikat
    </button>
  );
}
