function normalizeJob(raw) {
  return {
    id:
      raw?.id ??
      raw?._id ??
      raw?.jobId ??
      raw?.uuid ??
      raw?.url ??
      String(Math.random()),
    company: raw?.company ?? raw?.companyName ?? raw?.employer ?? "",
    status: raw?.status ?? raw?.currentStatus ?? raw?.state ?? "",
    position: raw?.position ?? raw?.title ?? raw?.role ?? "",
    score: raw?.score ?? raw?.fitScore ?? raw?.matchScore ?? "",
    // Map salary fields from the API to both generic and display-friendly keys.
    salary:
      raw?.salary ??
      raw?.salaryPosted ??
      raw?.postedSalary ??
      raw?.salary_posted ??
      "",
    salary_predicted:
      raw?.salary_predicted ??
      raw?.salaryPredicted ??
      raw?.salaryEstimate ??
      raw?.estimatedSalary ??
      raw?.salaryRange ??
      "",
    salaryPosted:
      raw?.salaryPosted ?? raw?.postedSalary ?? raw?.salary ?? "",
    salaryEstimate:
      raw?.salaryEstimate ?? raw?.estimatedSalary ?? raw?.salaryRange ?? "",
    snapshot:
      raw?.latest_snapshot?.raw_html_preview ??
      raw?.raw_html_preview ??
      raw?.snapshotHtml ??
      raw?.snapshot_html ??
      raw?.htmlSnapshot ??
      raw?.html_snapshot ??
      "",
    url: raw?.url,
  };
}

export async function getJobs() {
  const directUrl = (import.meta.env.VITE_JOBS_API_URL || "").trim();
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

  // In dev, force relative paths so Vite proxy handles routing
  const dev = import.meta.env.DEV;
  const effectiveBase = dev
    ? baseUrl.startsWith("/")
      ? baseUrl
      : "/api/v1"
    : baseUrl;

  const url =
    (!dev && directUrl) ||
    (effectiveBase
      ? `${effectiveBase.replace(/\/$/, "")}/job-postings/`
      : null);
  if (!url) throw new Error("Missing VITE_JOBS_API_URL or VITE_API_BASE_URL");

  console.log(url);

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return list.map(normalizeJob);
}

export async function scrapeJobUrl(urlToScrape) {
  if (!urlToScrape) throw new Error("URL is required");
  const directUrl = (import.meta.env.VITE_SCRAPE_API_URL || "").trim();
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

  const dev = import.meta.env.DEV;
  const effectiveBase = dev
    ? baseUrl.startsWith("/")
      ? baseUrl
      : "/api/v1"
    : baseUrl;

  const url =
    (!dev && directUrl) ||
    (effectiveBase ? `${effectiveBase.replace(/\/$/, "")}/scrape/jobs` : null);
  if (!url) throw new Error("Missing VITE_SCRAPE_API_URL or VITE_API_BASE_URL");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url: urlToScrape }),
  });
  if (!res.ok) throw new Error(`Scrape request failed: ${res.status}`);
  try {
    return await res.json();
  } catch (e) {
    return { ok: true };
  }
}

export async function updateJobStatus(jobId, status) {
  if (!jobId || !status) throw new Error("jobId and status are required");
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const dev = import.meta.env.DEV;
  const effectiveBase = dev
    ? baseUrl.startsWith("/")
      ? baseUrl
      : "/api/v1"
    : baseUrl;
  const url = `${effectiveBase.replace(/\/$/, "")}/job-postings/${jobId}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update status: ${res.status}`);
  return res.json();
}
