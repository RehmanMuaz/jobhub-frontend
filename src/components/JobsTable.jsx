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
import StatusPill from "./StatusPill.jsx";

const STATUS_OPTIONS = ["New", "Applied", "Rejected", "Interview", "Offer"];

function getStatusKey(status) {
  if (!status) return "new";
  return String(status).toLowerCase();
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
    <div className="table-wrapper">
      <table className="jobs-table">
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
            <tr key={pending.id} className="pending-row">
              <td>
                <div className="cell-title">Fetching...</div>
                <p className="cell-subtitle">Queued for scraping</p>
              </td>
              <td>
                <div className="status-cell">
                  <StatusPill status="new" subtle label="Pending" />
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
              <td className="muted" colSpan="7">
                Loading jobs…
              </td>
            </tr>
          )}
          {!loading && error && (
            <tr>
              <td className="danger" colSpan="7">
                Error: {error}
              </td>
            </tr>
          )}
          {!loading && !error && (!jobs || jobs.length === 0) && (
            <tr>
              <td className="muted" colSpan="7">
                No jobs found
              </td>
            </tr>
          )}
          {hasJobs &&
            jobs.map((job) => {
              const status = statusById[job.id] || "New";
              const statusKey = getStatusKey(status);
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
                    <div className="cell-title">
                      {job.company ? (
                        job.company
                      ) : (
                        <span className="placeholder">Unknown</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="status-cell">
                      <StatusPill
                        status={statusKey}
                        label={status}
                        onClick={() =>
                          setOpenJobId(openJobId === job.id ? null : job.id)
                        }
                      />
                      {openJobId === job.id && (
                        <div className="status-menu">
                          {STATUS_OPTIONS.filter(
                            (option) => getStatusKey(option) !== statusKey
                          ).map((option) => (
                            <StatusPill
                              key={option}
                              status={option}
                              label={option}
                              subtle
                              size="sm"
                              onClick={() => {
                                handleStatusChange(job.id, option);
                                setOpenJobId(null);
                              }}
                              className="status-option"
                            />
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
                      className={
                        postedIsPlaceholder ? "placeholder" : "value-strong"
                      }
                    >
                      {postedSalaryText}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        estimateIsPlaceholder ? "placeholder" : "value-strong"
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
    </div>
  );
}

export default JobsTable;
