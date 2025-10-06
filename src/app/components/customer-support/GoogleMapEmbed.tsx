export default function GoogleMapEmbed() {
  // Menggunakan koordinat dan query untuk lokasi Fitinline.
  // Jika nanti ingin ganti, cukup ubah consts di bawah.
  const lat = -7.785233;
  const lng = 110.4330181;
  const placeQuery = 'Fitinline';
  // mapType: 'roadmap' | 'satellite'
  const mapType: 'roadmap' | 'satellite' = 'satellite';
  // Google Maps embed param: &t=k -> satellite
  const typeParam = mapType === 'satellite' ? '&t=k' : '';
  // Format embed: using ll (lat,lng) + query + map type.
  const src = `https://www.google.com/maps?ll=${lat},${lng}&q=${encodeURIComponent(placeQuery)}&z=18&hl=id${typeParam}&output=embed`;

  return (
    <div className="w-full lg:w-1/2">
      <div className="relative w-full" style={{height:380}}>
        <iframe
          title="Lokasi Fitinline"
          src={src}
          width="100%"
          height="380"
            style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-xl w-full h-full"
        />
      </div>
  <p className="mt-2 text-xs text-gray-500">Jika peta tidak tampil, <a className="text-blue-600 underline" href={`https://www.google.com/maps/place/${encodeURIComponent(placeQuery)}/@${lat},${lng},18z/data=!3m1!1e3`} target="_blank" rel="noopener noreferrer">buka di Google Maps</a>.</p>
    </div>
  );
}
