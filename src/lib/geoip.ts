interface GeoData {
  ip: string;
  region: string;
  city: string;
  country: string;
  isp: string;
}

export async function getGeoIP(): Promise<GeoData> {
  try {
    // ip-api.com — free, no key needed, 45 req/min
    const res = await fetch("http://ip-api.com/json/?fields=query,regionName,city,country,isp");
    if (!res.ok) throw new Error("Failed to fetch geo data");
    const data = await res.json();
    return {
      ip: data.query ?? "unknown",
      region: data.regionName ?? "unknown",
      city: data.city ?? "unknown",
      country: data.country ?? "unknown",
      isp: data.isp ?? "unknown",
    };
  } catch {
    // Fallback: at least get the IP
    try {
      const res = await fetch("https://api64.ipify.org?format=json");
      const data = await res.json();
      return { ip: data.ip ?? "unknown", region: "unknown", city: "unknown", country: "unknown", isp: "unknown" };
    } catch {
      return { ip: "unknown", region: "unknown", city: "unknown", country: "unknown", isp: "unknown" };
    }
  }
}
