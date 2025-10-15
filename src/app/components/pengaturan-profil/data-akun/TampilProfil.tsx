//"use client";
//import { useState, useEffect, useMemo, useRef } from "react";
//import ReadField from "./ReadField";
//import EditableField from "./EditableField";

//interface ProfileFormProps {
//  role?: "sekolah" | "perusahaan" | "lpk";
//  form: any;
//  handleChange: (
//    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//  ) => void;
//  isDirty: boolean;
//  setIsDirty: (v: boolean) => void;
//  onEditAvatar?: () => void;
//  onSaveField?: (name: string, value: string) => Promise<void> | void;
//  onSaveAll?: () => Promise<void> | void;
//  onUploadSignature?: (file: File) => Promise<string | void> | string | void;
//  onShowToast?: (msg: string, type: 'success' | 'error') => void;
//  /** daftar nama field yang disembunyikan sepenuhnya */
//  hideFields?: string[];
//  /** sembunyikan tombol Simpan/Batal internal di bagian bawah form */
//  hideSaveButtons?: boolean;
//}

//type Role = "sekolah" | "perusahaan" | "lpk";

//// Helper to build candidate URLs for signature images
//function buildSignatureCandidates(raw: string, apiRoot: string): string[] {
//  if (!raw) return [];
//  let val = raw.trim();
//  // If value contains spaces, only take first token (legacy pattern)
//  val = val.split(/\s+/)[0];
//  // If somehow stored like 'blob:http://localhost:3000/<actualAbsoluteUrl>' attempt to extract last http(s) part
//  if (/^blob:https?:/i.test(val) && val.includes('http://')) {
//    const match = val.match(/(https?:\/\/[^]+)$/i);
//    if (match) val = match[1];
//  }
//  // Case: value begins with backend URL then contains '/blob:http' followed by another http(s) (malformed persistence)
//  // Example: http://localhost:8000/blob:http://localhost:3000/a25f0... -> we want the last http URL part
//  if (/^https?:\/\/[^]+\/blob:https?:/i.test(val)) {
//    const parts = val.match(/https?:\/\/[^]+/g);
//    if (parts && parts.length > 1) {
//      // choose the last segment which should be the original blob/http path (may not exist on backend)
//      val = parts[parts.length - 1];
//      // If it is a blob: URL we can't load from backend; drop it so preview shows 'No file'
//      if (val.startsWith('blob:')) return [];
//    }
//  }
//  // If value already is a fully qualified correct storage URL to our apiRoot, just return it
//  try {
//    if (/^https?:/i.test(val)) {
//      const url = new URL(val);
//      const root = new URL(apiRoot);
//      if (url.host === root.host && /\/storage\//i.test(url.pathname)) {
//        return [val];
//      }
//    }
//  } catch {}
//  // Blob or data: direct
//  if (val.startsWith('blob:') || val.startsWith('data:')) return [val];
//  // Normalize Windows path to forward slashes
//  if (/^[A-Za-z]:\\\\?/i.test(val) || /\\/g.test(val)) {
//    const asSlashes = val.replace(/\\+/g, '/');
//    const idx = asSlashes.toLowerCase().indexOf('/storage/');
//    if (idx !== -1) {
//      val = asSlashes.substring(idx + '/storage/'.length); // relative inside storage
//    } else {
//      // try to strip public/ if present
//      const pubIdx = asSlashes.toLowerCase().indexOf('/public/');
//      if (pubIdx !== -1) val = asSlashes.substring(pubIdx + '/public/'.length);
//    }
//  }
//  // If already starts with /storage/ or storage/
//  if (/^\/storage\//i.test(val)) {
//    const clean = val.replace(/^\/+/, '');
//    return [`${apiRoot.replace(/\/$/, '')}/${clean}`];
//  }
//  if (/^storage\//i.test(val)) {
//    return [`${apiRoot.replace(/\/$/, '')}/${val.replace(/^\/+/, '')}`];
//  }
//  // Absolute URL
//  if (/^(https?:)?\/\//i.test(val)) {
//    try {
//      const root = new URL(apiRoot);
//      const url = new URL(val, apiRoot);
//      if (url.host === root.host) {
//        const path = url.pathname.replace(/^\/+/, '');
//        return [`${root.origin}/storage/${path}`, `${root.origin}/${path}`, val];
//      }
//      return [val];
//    } catch {
//      return [val];
//    }
//  }
//  // Relative path (e.g., perusahaan/tanda_tangan/file.png)
//  const cleaned = val.replace(/^\/+/, '');
//  const root = apiRoot.replace(/\/$/, '');
//  return [`${root}/storage/${cleaned}`, `${root}/${cleaned}`];
//}

//function SignatureImage({ candidates, filename }: { candidates: string[]; filename: string }) {
//  const [idx, setIdx] = useState(0);
//  useEffect(() => setIdx(0), [candidates.join('|')]);
//  const current = candidates[idx];

//  // Card style used for both PDFs and images to match the provided design
//  const cardCommon = "w-full rounded-lg border-2 border-[#0F67B1] bg-white p-3 flex items-center gap-3";
//  const isPdf = /\.pdf(\?|$)/i.test(String(filename));
//  if (isPdf) {
//    const href = candidates[0] || filename;
//    return (
//      <div className="mb-2">
//        <a href={href} target="_blank" rel="noreferrer" className={`${cardCommon}`}>
//          <svg className="w-5 h-5 text-gray-700 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-8-8zM13 3.5L18.5 9H13V3.5zM6 6h6v2H6V6zm0 4h12v2H6v-2zm0 4h12v2H6v-2z"/></svg>
//          <div className="text-sm font-medium text-gray-800 truncate">{filename}</div>
//        </a>
//      </div>
//    );
//  }

//  // Image thumbnail inside the same card style
//  const thumbnail = current ? (
//    <img src={current} alt={filename || 'Tanda Tangan'} className="max-h-20 object-contain rounded-md" onError={() => setIdx(i => (i + 1 < candidates.length ? i + 1 : i))} />
//  ) : (
//    <div className="text-sm text-gray-700 truncate">{filename}</div>
//  );

//  return (
//    <div className="mb-2">
//      <div className={cardCommon}>
//        <div className="w-20 h-14 flex items-center justify-center bg-white rounded-md overflow-hidden">
//          {thumbnail}
//        </div>
//        <div className="flex-1">
//          <div className="text-sm text-gray-800 font-medium truncate">{filename}</div>
//        </div>
//      </div>
//    </div>
//  );
//}

//export default function ProfileForm({ role: propRole, form, handleChange, isDirty, setIsDirty, onEditAvatar, onSaveField, onSaveAll, onUploadSignature, onShowToast, hideFields = [], hideSaveButtons = false }: ProfileFormProps) {
//  // role can be passed from parent; fallback to localStorage detection for backward compatibility
//  const [role, setRole] = useState<Role>(propRole ?? "sekolah");
//  const [editingField, setEditingField] = useState<string | null>(null);
//  const [localToast, setLocalToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
//  const originalSignatureRef = useRef<string>('');
//  const pendingFileRef = useRef<File | null>(null);
//  const pendingObjectUrlRef = useRef<string | null>(null);
//  const [isUploadingSignature, setIsUploadingSignature] = useState(false);

//  // if no propRole was provided, try to detect from localStorage once on mount
//  useEffect(() => {
//    if (propRole) return; // parent provided the role
//    const storedUser = localStorage.getItem("user");
//    if (storedUser) {
//      try {
//        const parsed = JSON.parse(storedUser);
//        if (parsed.role) setRole(parsed.role as Role);
//      } catch (err) {
//        console.error("Gagal parse user:", err);
//      }
//    }
//  }, [propRole]);

//  // keep track of the last persisted signature so we can soft-revert on cancel
//  useEffect(() => {
//    if (!isDirty) {
//      originalSignatureRef.current = String(form.tanda_tangan || '');
//    }
//  }, [form.tanda_tangan, isDirty]);

//  const handleInputChange = (
//    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//  ) => {
//    handleChange(e);
//    setIsDirty(true);
//  };

//  const handleCancel = () => {
//    // soft revert: restore original signature stored in ref (if present) and clear dirty flag
//    try {
//      const orig = originalSignatureRef.current ?? '';
//      handleChange({ target: { name: 'tanda_tangan', value: orig } } as any);
//    } catch (e) {}
//    setIsDirty(false);
//  };

//  const handleSave = async () => {
//    // If a page-level save handler is provided, call it and only clear dirty on success
//    if (onSaveAll) {
//      try {
//        await onSaveAll();
//        setIsDirty(false);
//        (onShowToast
//          ? onShowToast('Perubahan berhasil disimpan', 'success')
//          : setLocalToast({ message: 'Perubahan berhasil disimpan', type: 'success' })
//        );
//      } catch (err) {
//        // keep isDirty true so user can retry; error is handled by parent
//        console.error('Save all failed', err);
//        (onShowToast
//          ? onShowToast('Gagal menyimpan perubahan', 'error')
//          : setLocalToast({ message: 'Gagal menyimpan perubahan', type: 'error' })
//        );
//      }
//      return;
//    }

//    // fallback: mark as saved
//    setIsDirty(false);
//  };

//  // definisi field per role
//  const fieldsByRole: Record<Role, { label: string; name: string; type?: string; editable?: boolean; placeholder?: string }[]> =
//    {
//      sekolah: [
//        { label: "Nama Sekolah", name: "nama_sekolah" },
//        { label: "NPSN", name: "npsn" },
//        { label: "Email", name: "email", type: "email", placeholder: "contoh: sekolah@gmail.com" },
//        { label: "Nomor Handphone", name: "phone", editable: true },
//        { label: "Website", name: "website", editable: true },
//        { label: "Alamat", name: "address", editable: true },
//      ],
//      perusahaan: [
//        { label: "Nama Perusahaan", name: "nama_perusahaan" },
//        { label: "Bidang Usaha", name: "bidang_usaha" },
//        { label: "Deskripsi Usaha", name: "deskripsi_usaha", editable: true },
//        { label: "Email", name: "email", type: "email", editable: true },
//        { label: "Nomor Handphone", name: "phone", editable: true },
//        { label: "Website", name: "website", editable: true },
//        { label: "Alamat", name: "address", editable: true },
//        { label: "Penanggung Jawab", name: "penanggung_jawab", editable: true },
//      ],
//      lpk: [
//        { label: "Nama Lembaga", name: "nama_lembaga" },
//        { label: "Bidang Pelatihan", name: "bidang_pelatihan" },
//        { label: "Deskripsi Lembaga", name: "deskripsi_lembaga", editable: true },
//        { label: "Email", name: "email", type: "email", editable: true },
//        { label: "Nomor Handphone", name: "phone", editable: true },
//        { label: "Website", name: "website", editable: true },
//        { label: "Alamat", name: "address", editable: true },
//        { label: "Akreditasi", name: "akreditasi", editable: true },
//      ],
//    };

//  const fields = fieldsByRole[role] || [];

//  // Only these field names should be editable and show the pencil icon.
//  // Include common name variants to be robust against different field naming.
//  const editableFieldNames = new Set([
//    'logo_perusahaan', // company logo (backend name)
//    'profilePic',
//    'profile_pic',
//    'foto',
//    'deskripsi_usaha',
//    'deskripsi_lembaga',
//    'address',
//    'alamat',
//    'phone',
//    'kontak',
//    'penanggung_jawab',
//  ]);

//  return (
//    <form>
//      {/* Toast internal (hanya muncul bila parent tidak menyediakan onShowToast) */}
//      {localToast && !onShowToast && (
//        <div
//          aria-live="polite"
//          className={`fixed left-1/2 top-8 -translate-x-1/2 z-[9999] px-5 py-3 rounded-lg shadow-2xl text-white text-sm font-medium tracking-wide flex items-center gap-2 backdrop-blur-sm bg-opacity-95 animate-fade-in-down ${localToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
//        >
//          {localToast.message}
//        </div>
//      )}

//      {fields.map((field) => {
//        if (hideFields.includes(field.name)) return null;
//        const common = {
//          key: field.name,
//          label: field.label,
//          name: field.name,
//        } as any;

//        // Determine whether this field should be editable / show the pencil
//        const isEditable = editableFieldNames.has(field.name);

//        // Prepare the main field element (editable or read)
//        const mainElement = (isEditable)
//          ? (editingField === field.name
//              ? (
//                <EditableField
//                  key={field.name}
//                  label={field.label}
//                  name={field.name}
//                  value={form[field.name] || ""}
//                  onChange={handleInputChange}
//                  onSave={async (newValue?: string) => {
//                    try {
//                      const payloadValue = typeof newValue === 'string' ? newValue : (form[field.name] || "");
//                      if (onSaveField) {
//                        await onSaveField(field.name, payloadValue);
//                        (onShowToast
//                          ? onShowToast(`${field.label} berhasil diperbarui`, 'success')
//                          : setLocalToast({ message: `${field.label} berhasil diperbarui`, type: 'success' })
//                        );
//                      }
//                      setEditingField(null);
//                    } catch (err) {
//                      console.error('Field save failed', err);
//                      (onShowToast
//                        ? onShowToast(`Gagal memperbarui ${field.label}`, 'error')
//                        : setLocalToast({ message: `Gagal memperbarui ${field.label}`, type: 'error' })
//                      );
//                    }
//                  }}
//                  onCancel={() => setEditingField(null)}
//                />
//              )
//              : (
//                <ReadField
//                  key={field.name}
//                  label={field.label}
//                  name={field.name}
//                  type={field.type}
//                  value={form[field.name] || ""}
//                  onChange={handleChange as any}
//                  placeholder={field.placeholder}
//                  disabled={true}
//                  onEdit={() => setEditingField(field.name)}
//                />
//              )
//            )
//          : (
//            <ReadField
//              key={field.name}
//              label={field.label}
//              name={field.name}
//              type={field.type}
//              value={form[field.name] || ""}
//              onChange={handleChange as any}
//              placeholder={field.placeholder}
//              disabled={true}
//            />
//          );

//        // If this is the penanggung_jawab field for perusahaan, render the signature UI next to/under it
//        if (field.name === 'penanggung_jawab' && role === 'perusahaan') {
//          return (
//            <div key={`wrapper-${field.name}`} className="mb-4">
//              {mainElement}
//                    <div className="mt-2 relative">
//                <label className="block text-sm font-medium mb-1">Tanda Tangan</label>
//                {/* main preview rendered below together with file picker - removed duplicate top preview */}
//                <input id="tanda_tangan_input" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
//                  const f = e.target.files?.[0];
//                  if (!f) return;
//                  // Validasi file
//                  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
//                  const allowedTypes = ['image/png','image/jpeg','image/jpg','image/webp','application/pdf'];
//                  if (!allowedTypes.includes(f.type)) {
//                    onShowToast?.('Tipe file tidak didukung. Gunakan PNG/JPG/WebP/PDF.', 'error');
//                    return;
//                  }
//                  if (f.size > MAX_SIZE) {
//                    onShowToast?.('Ukuran file melebihi 2MB.', 'error');
//                    return;
//                  }
//                  // Revoke object URL lama jika ada
//                  if (pendingObjectUrlRef.current) {
//                    try { URL.revokeObjectURL(pendingObjectUrlRef.current); } catch {}
//                  }
//                  pendingFileRef.current = f;
//                  const url = URL.createObjectURL(f);
//                  pendingObjectUrlRef.current = url;
//                  handleChange({ target: { name: 'tanda_tangan', value: url } } as any);
//                  setIsDirty(true);
//                }} />

//                {/* Unified signature card row: thumbnail + filename + actions */}
//                <div className="w-full rounded-lg border-2  bg-white px-3 py-2 flex items-center gap-4">
//                  {/* Thumbnail */}
//                  <div className="w-16 h-12 flex items-center justify-center overflow-hidden rounded-md bg-white border border-transparent">
//                    {(() => {
//                      const raw = String(form.tanda_tangan || '').trim();
//                      if (!raw) return <span className="text-xs text-gray-400">No file</span>;
//                      if (raw.startsWith('blob:') || raw.startsWith('data:')) {
//                        return <img src={raw.split(/\s+/)[0]} alt="preview" className="max-h-12 object-contain" />;
//                      }
//                      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
//                      const API_ROOT = API_BASE.replace(/\/?api\/?$/i, '');
//                      const candidates = buildSignatureCandidates(raw, API_ROOT);
//                      if (!candidates.length) return <span className="text-xs text-gray-400">No file</span>;
//                      const filename = (raw.split(/\s+/)[0].split('/').pop()) || 'file';
//                      if (/\.pdf(\?|$)/i.test(filename)) {
//                        return <a href={candidates[0]} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 underline text-center px-1">PDF</a>;
//                      }
//                      const ImgWithFallback: React.FC = () => {
//                        const [idx, setIdx] = useState(0);
//                        return <img src={candidates[idx]} alt={filename} className="max-h-12 object-contain" onError={() => setIdx(i => (i + 1 < candidates.length ? i + 1 : i))} />;
//                      };
//                      return <ImgWithFallback />;
//                    })()}
//                  </div>
//                  {/* Filename */}
//                  <div className="flex-1 min-w-0">
//                    <div className="text-sm text-gray-800 truncate">
//                      {(String(form.tanda_tangan || '')).trim() ? (String(form.tanda_tangan || '').split(/\s+/)[0].split('/').pop()) : 'Belum ada tanda tangan'}
//                    </div>
//                  </div>
//                  {/* Actions */}
//                  <div className="flex items-center gap-2">
//                    {!isDirty && (
//                      <label htmlFor="tanda_tangan_input" className="px-4 py-1.5 bg-white border rounded-md shadow-sm text-sm cursor-pointer hover:bg-gray-50">
//                        Pilih file
//                      </label>
//                    )}
//                  </div>
//                </div>

//                {isDirty && (
//                  <div className="mt-3 flex gap-2 justify-end">
//                    <button
//                      type="button"
//                      onClick={() => {
//                        try {
//                          const orig = originalSignatureRef.current ?? '';
//                          handleChange({ target: { name: 'tanda_tangan', value: orig } } as any);
//                          pendingFileRef.current = null;
//                          if (pendingObjectUrlRef.current) {
//                            try { URL.revokeObjectURL(pendingObjectUrlRef.current); } catch {}
//                            pendingObjectUrlRef.current = null;
//                          }
//                        } catch (e) {}
//                        setIsDirty(false);
//                      }}
//                      className="px-4 py-2 bg-white text-[#0F67B1] border border-[#0F67B1] rounded-md text-sm disabled:opacity-50"
//                      disabled={isUploadingSignature}
//                    >
//                      Batal
//                    </button>
//                    <button
//                      type="button"
//                      onClick={async () => {
//                        try {
//                          if (pendingFileRef.current && onUploadSignature) {
//                            setIsUploadingSignature(true);
//                            const result = await onUploadSignature(pendingFileRef.current);
//                            // Jika backend mengembalikan path/url definitif, ganti state agar bukan blob
//                            const pathResult = result as any;
//                            if (typeof pathResult === 'string' && pathResult.trim()) {
//                              handleChange({ target: { name: 'tanda_tangan', value: pathResult } } as any);
//                              onShowToast?.('Tanda tangan berhasil diunggah', 'success');
//                            } else {
//                              onShowToast?.('Upload tanda tangan selesai', 'success');
//                            }
//                            pendingFileRef.current = null;
//                            if (pendingObjectUrlRef.current) {
//                              try { URL.revokeObjectURL(pendingObjectUrlRef.current); } catch {}
//                              pendingObjectUrlRef.current = null;
//                            }
//                          }
//                          if (onSaveAll) await onSaveAll();
//                          setIsDirty(false);
//                        } catch (err) {
//                          console.error('Save all failed', err);
//                          onShowToast?.('Gagal menyimpan perubahan', 'error');
//                        } finally {
//                          setIsUploadingSignature(false);
//                        }
//                      }}
//                      className="px-4 py-2 bg-[#0F67B1] text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-60"
//                      disabled={isUploadingSignature}
//                    >
//                      {isUploadingSignature && (
//                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
//                        </svg>
//                      )}
//                      {isUploadingSignature ? 'Menyimpan...' : 'Simpan'}
//                    </button>
//                  </div>
//                )}

//                {/* moved Save/Cancel into the right column to avoid overlap */}
//              </div>
//            </div>
//          );
//        }

//        // otherwise just return the main element
//        return mainElement;
//      })}

//      {isDirty && role !== 'perusahaan' && !hideSaveButtons && (
//        <div className="flex gap-2 mt-4 justify-end">
//          <button
//            type="button"
//            onClick={handleCancel}
//            className="bg-white text-[#0F67B1] border border-[#0F67B1] px-4 py-2 rounded-md"
//          >
//            Batal
//          </button>
//          <button
//            type="button"
//            onClick={handleSave}
//            className="bg-[#0F67B1] text-white px-4 py-2 rounded-md"
//          >
//            Simpan
//          </button>
//        </div>
//      )}
//    </form>
//  );
//}

"use client";
import { useState, useEffect, useRef } from "react";
import ReadField from "./ReadField";

interface ProfileFormProps {
  role?: "sekolah" | "perusahaan" | "lpk";
  form: any;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  isDirty: boolean;
  setIsDirty: (v: boolean) => void;
  onEditAvatar?: () => void;
  onSaveAll?: () => Promise<void> | void;
  onUploadSignature?: (file: File) => Promise<string | void> | string | void;
  onShowToast?: (msg: string, type: "success" | "error") => void;
  hideFields?: string[];
  hideSaveButtons?: boolean;
}

type Role = "sekolah" | "perusahaan" | "lpk";

// ===== Helper kecil =====
const fileNameOf = (v: string) =>
  (
    String(v || "")
      .split(/\s+/)[0]
      .split("/")
      .pop() || ""
  ).trim();

export default function ProfileForm({
  role: propRole,
  form,
  handleChange,
  isDirty,
  setIsDirty,
  onSaveAll,
  onUploadSignature,
  onShowToast,
  hideFields = [],
  hideSaveButtons = false,
}: ProfileFormProps) {
  // role bisa dari parent; fallback dari localStorage agar kompatibel
  const [role, setRole] = useState<Role>(propRole ?? "sekolah");

  // tanda tangan: tunda upload sampai tombol Simpan bawah ditekan
  const originalSignatureRef = useRef<string>("");
  const pendingFileRef = useRef<File | null>(null);
  const pendingObjectUrlRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (propRole) return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role) setRole(parsed.role as Role);
      } catch {}
    }
  }, [propRole]);

  // simpan versi “persisted” tanda tangan untuk revert ketika batal
  useEffect(() => {
    if (!isDirty) {
      originalSignatureRef.current = String(form.tanda_tangan || "");
    }
  }, [form.tanda_tangan, isDirty]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    handleChange(e);
    setIsDirty(true);
  };

  const handleCancel = () => {
    // kembalikan tanda tangan, bersihkan pending
    try {
      const orig = originalSignatureRef.current ?? "";
      handleChange({ target: { name: "tanda_tangan", value: orig } } as any);
    } catch {}
    pendingFileRef.current = null;
    if (pendingObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(pendingObjectUrlRef.current);
      } catch {}
      pendingObjectUrlRef.current = null;
    }
    setIsDirty(false);
  };

  const handleSave = async () => {
    try {
      // jika ada file tanda tangan menunggu, upload dulu
      if (pendingFileRef.current && onUploadSignature) {
        setUploading(true);
        const result = await onUploadSignature(pendingFileRef.current);
        if (typeof result === "string" && result.trim()) {
          handleChange({
            target: { name: "tanda_tangan", value: result },
          } as any);
        }
        pendingFileRef.current = null;
        if (pendingObjectUrlRef.current) {
          try {
            URL.revokeObjectURL(pendingObjectUrlRef.current);
          } catch {}
          pendingObjectUrlRef.current = null;
        }
      }

      await onSaveAll?.();
      setIsDirty(false);
      onShowToast?.("Perubahan berhasil disimpan", "success");
    } catch (e) {
      onShowToast?.("Gagal menyimpan perubahan", "error");
    } finally {
      setUploading(false);
    }
  };

  // ===== Definisi field per role =====
  const fieldsByRole: Record<
    Role,
    {
      label: string;
      name: string;
      type?: string;
      editable?: boolean;
      placeholder?: string;
    }[]
  > = {
    sekolah: [
      { label: "Nama Sekolah", name: "nama_sekolah" },
      { label: "NPSN", name: "npsn" },
      {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "contoh: sekolah@gmail.com",
      },
      { label: "Nomor Handphone", name: "phone", editable: true },
      { label: "Website", name: "website", editable: true },
      { label: "Alamat", name: "address", editable: true },
    ],
    perusahaan: [
      { label: "Nama Perusahaan", name: "nama_perusahaan" }, // disable
      { label: "Bidang Usaha", name: "bidang_usaha" }, // disable
      {
        label: "Deskripsi Usaha",
        name: "deskripsi_usaha",
        editable: true,
        type: "textarea",
        placeholder: "Tulis deskripsi perusahaan...",
      },
      { label: "Email", name: "email", type: "email" }, // disable
      { label: "Nomor Handphone", name: "phone", editable: true },
      { label: "Website", name: "website" }, // disable
      { label: "Alamat", name: "address", editable: true },
      { label: "Penanggung Jawab", name: "penanggung_jawab", editable: true },
    ],
    lpk: [
      { label: "Nama Lembaga", name: "nama_lembaga" },
      { label: "Bidang Pelatihan", name: "bidang_pelatihan" },
      {
        label: "Deskripsi Lembaga",
        name: "deskripsi_lembaga",
        editable: true,
        type: "textarea",
        placeholder: "Tulis deskripsi lembaga...",
      },
      { label: "Email", name: "email", type: "email", editable: true },
      { label: "Nomor Handphone", name: "phone", editable: true },
      { label: "Website", name: "website", editable: true },
      { label: "Alamat", name: "address", editable: true },
      { label: "Akreditasi", name: "akreditasi", editable: true },
    ],
  };

  const fields = fieldsByRole[role] || [];

  // field non-editable khusus perusahaan
  const disabledPerusahaan = new Set([
    "nama_perusahaan",
    "bidang_usaha",
    "email",
    "website",
  ]);

  return (
    <form>
      {/* Render semua field */}
      {fields.map((field) => {
        if (hideFields.includes(field.name)) return null;

        const disabled =
          role === "perusahaan"
            ? disabledPerusahaan.has(field.name)
            : !field.editable;

        const isTextarea =
          field.type === "textarea" || /^deskripsi/i.test(field.name);

        const el = (
          <ReadField
            key={field.name}
            label={field.label}
            name={field.name}
            type={isTextarea ? "textarea" : field.type}
            value={form[field.name] || ""}
            placeholder={field.placeholder}
            onChange={handleInputChange as any}
            disabled={disabled}
            rows={isTextarea ? 6 : undefined}
          />
        );

        // sisipkan UI tanda tangan setelah Penanggung Jawab (khusus perusahaan)
        if (role === "perusahaan" && field.name === "penanggung_jawab") {
          return (
            <div key={`wrapper-${field.name}`} className="mb-4">
              {el}

              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">
                  Tanda Tangan
                </label>

                {/* input file tersembunyi */}
                <input
                  id="tanda_tangan_input"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;

                    // validasi sederhana
                    const allowed = [
                      "image/png",
                      "image/jpeg",
                      "image/jpg",
                      "image/webp",
                      "application/pdf",
                    ];
                    if (!allowed.includes(f.type)) {
                      onShowToast?.(
                        "Tipe file tidak didukung (PNG/JPG/WebP/PDF)",
                        "error"
                      );
                      return;
                    }
                    if (f.size > 2 * 1024 * 1024) {
                      onShowToast?.("Ukuran file maks 2MB", "error");
                      return;
                    }

                    // bersihkan preview lama
                    if (pendingObjectUrlRef.current) {
                      try {
                        URL.revokeObjectURL(pendingObjectUrlRef.current);
                      } catch {}
                    }

                    pendingFileRef.current = f;
                    const url = URL.createObjectURL(f);
                    pendingObjectUrlRef.current = url;

                    // taruh ke form untuk preview & set dirty
                    handleChange({
                      target: { name: "tanda_tangan", value: url },
                    } as any);
                    setIsDirty(true);
                  }}
                />

                {/* kartu preview + tombol pilih */}
                <div className="w-full rounded-lg border-2 bg-white px-3 py-2 flex items-center gap-4">
                  <div className="w-16 h-12 flex items-center justify-center overflow-hidden rounded-md bg-white">
                    {form.tanda_tangan ? (
                      /\.pdf(\?|$)/i.test(String(form.tanda_tangan)) ? (
                        <a
                          href={String(form.tanda_tangan)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 underline"
                        >
                          PDF
                        </a>
                      ) : (
                        <img
                          src={String(form.tanda_tangan)}
                          alt="Tanda Tangan"
                          className="max-h-12 object-contain"
                        />
                      )
                    ) : (
                      <span className="text-xs text-gray-400">No file</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-sm truncate">
                    {fileNameOf(String(form.tanda_tangan)) ||
                      "Belum ada tanda tangan"}
                  </div>

                  <label
                    htmlFor="tanda_tangan_input"
                    className="px-4 py-1.5 bg-white border rounded-md text-sm cursor-pointer hover:bg-gray-50"
                  >
                    Pilih file
                  </label>
                </div>
              </div>
            </div>
          );
        }

        return el;
      })}

      {/* Tombol bawah global */}
      {isDirty && !hideSaveButtons && (
        <div className="flex gap-2 mt-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-white text-[#0F67B1] border border-[#0F67B1] px-4 py-2 rounded-md"
            disabled={uploading}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#0F67B1] text-white px-4 py-2 rounded-md disabled:opacity-60"
            disabled={uploading}
          >
            {uploading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      )}
    </form>
  );
}
