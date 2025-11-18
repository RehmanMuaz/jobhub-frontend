import { useEffect, useState } from "react";
import {
  FaLink,
  FaRegBuilding,
  FaDollarSign,
  FaCommentDollar,
  FaRegStar,
  FaRegCheckCircle,
  FaRegUser,
} from "react-icons/fa";

const STATUS_OPTIONS = ["New", "Applied", "Rejected", "Interview", "Offer"];

function getStatusClass(status) {
  if (!status) return "status-new";
  switch (String(status).toLowerCase()) {
    case "applied":
      return "status-applied";
    case "rejected":
      return "status-rejected";
    case "interview":
      return "status-interview";
    case "offer":
      return "status-offer";
    case "new":
    default:
      return "status-new";
  }
}

function formatSalary(value) {
  if (value === undefined || value === null || value === "") {
    return { text: "Not available", placeholder: true };
  }
  const str = String(value).trim();
  if (!str) return { text: "Not available", placeholder: true };
  const withCurrency = str.startsWith("$") ? str : `$${str}`;
  return { text: withCurrency, placeholder: false };
}

function getScoreInfo(rawScore) {
  if (rawScore === undefined || rawScore === null || rawScore === "") {
    return { hasScore: false, score: null };
  }
  const n = Number(rawScore);
  if (Number.isNaN(n)) return { hasScore: false, score: null };
  const clamped = Math.max(0, Math.min(100, n));
  return { hasScore: true, score: clamped };
}

function openSnapshot(html) {
  if (!html) return;
  try {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");
    const win = window.open("", "_blank");
    if (!win) return;
    const doc = win.document;
    const newDocElement = doc.importNode(parsed.documentElement, true);
    doc.replaceChild(newDocElement, doc.documentElement);
  } catch (e) {
    // ignore snapshot open failures
  }
}

function JobsTable({ jobs, loading, error, pendingSubmissions = [] }) {
  const [statusById, setStatusById] = useState({});
  const [openJobId, setOpenJobId] = useState(null);

  useEffect(() => {
    const initial = {};
    (jobs || []).forEach((job) => {
      const raw = job.status && String(job.status).trim();
      initial[job.id] = raw || "New";
    });
    setStatusById(initial);
  }, [jobs]);

  const handleStatusChange = (jobId, value) => {
    setStatusById((prev) => ({ ...prev, [jobId]: value }));
  };

  const hasJobs = !loading && !error && jobs && jobs.length > 0;

  return (
    <table>
      <thead>
        <tr>
          <th>
            <FaRegBuilding className="icon" /> Company
          </th>
          <th>
            <FaRegCheckCircle className="icon" /> Status
          </th>
          <th>
            <FaRegUser className="icon" /> Position
          </th>
          <th>
            <FaRegStar className="icon" /> Score
          </th>
          <th>
            <FaDollarSign className="icon" /> Salary (Posted)
          </th>
          <th>
            <FaCommentDollar className="icon" /> Salary (Estimate)
          </th>
          <th>Links</th>
        </tr>
      </thead>
      <tbody>
        {pendingSubmissions.map((pending) => (
          <tr key={pending.id}>
            <td>
              <span className="placeholder">Fetching...</span>
            </td>
            <td>
              <div className="status-cell">
                <span className="status-badge status-new">New</span>
              </div>
            </td>
            <td>
              <span className="placeholder">Waiting for analysis</span>
            </td>
            <td>
              <div className="score-container">
                <div className="score-bar">
                  <div
                    className="score-bar-fill score-bar-fill-loading"
                    style={{ width: "40%" }}
                  />
                </div>
                <span className="score-label">Pending</span>
              </div>
            </td>
            <td>
              <span className="placeholder">Pending</span>
            </td>
            <td>
              <span className="placeholder">Pending</span>
            </td>
            <td>
              <div className="link-actions">
                {pending.url && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => window.open(pending.url, "_blank")}
                    title="Open submitted URL"
                  >
                    <FaLink className="link" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
        {loading && (
          <tr>
            <td colSpan="7">Loading jobs…</td>
          </tr>
        )}
        {!loading && error && (
          <tr>
            <td colSpan="7">Error: {error}</td>
          </tr>
        )}
        {!loading && !error && (!jobs || jobs.length === 0) && (
          <tr>
            <td colSpan="7">No jobs found</td>
          </tr>
        )}
        {hasJobs &&
          jobs.map((job) => {
            const status = statusById[job.id] || "New";
            const statusClass = getStatusClass(status);
            const { text: postedSalaryText, placeholder: postedIsPlaceholder } =
              formatSalary(job.salaryPosted);
            const {
              text: estimateSalaryText,
              placeholder: estimateIsPlaceholder,
            } = formatSalary(job.salaryEstimate);
            const { hasScore, score } = getScoreInfo(job.score);
            const scoreIsLoading = !hasScore;

            return (
              <tr key={job.id}>
                <td>
                  {job.company ? (
                    job.company
                  ) : (
                    <span className="placeholder">Unknown</span>
                  )}
                </td>
                <td>
                  <div className="status-cell">
                    <button
                      type="button"
                      className={`status-badge ${statusClass}`}
                      onClick={() =>
                        setOpenJobId(openJobId === job.id ? null : job.id)
                      }
                    >
                      {status}
                    </button>
                    {openJobId === job.id && (
                      <div className="status-menu">
                        {STATUS_OPTIONS.filter(
                          (option) => option !== status
                        ).map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`status-option-badge status-badge ${getStatusClass(
                              option
                            )}`}
                            onClick={() => {
                              handleStatusChange(job.id, option);
                              setOpenJobId(null);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  {job.position ? (
                    job.position
                  ) : (
                    <span className="placeholder">Not specified</span>
                  )}
                </td>
                <td>
                  <div className="score-container">
                    <div className="score-bar">
                      <div
                        className={`score-bar-fill${
                          scoreIsLoading ? " score-bar-fill-loading" : ""
                        }`}
                        style={{
                          width: `${hasScore ? score : 40}%`,
                        }}
                      />
                    </div>
                    <span className="score-label">
                      {hasScore ? `${score}` : "Pending"}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    className={postedIsPlaceholder ? "placeholder" : undefined}
                  >
                    {postedSalaryText}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      estimateIsPlaceholder ? "placeholder" : undefined
                    }
                  >
                    {estimateSalaryText}
                  </span>
                </td>
                <td>
                  <div className="link-actions">
                    {job.url && (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() =>
                          window.open(job.url, "_blank") &&
                          console.log(job.snapshot)
                        }
                        title="Open original job posting"
                      >
                        <FaLink className="link" />
                      </button>
                    )}
                    {job.snapshot && (
                      <button
                        type="button"
                        className="snapshot-button"
                        onClick={() =>
                          console.log(job.snapshot) &&
                          openSnapshot(job.snapshot)
                        }
                      >
                        <FaLink className="link" />
                      </button>
                    )}
                    {!job.url && !job.snapshot && (
                      <span className="placeholder">No link</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

export default JobsTable;
