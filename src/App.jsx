import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo-bg.png";
import "./App.css";
import UrlInputForm from "./components/UrlInputForm.jsx";
import JobsTable from "./components/JobsTable.jsx";
import Panel from "./components/Panel.jsx";
import MetricCard from "./components/MetricCard.jsx";
import StatusPill from "./components/StatusPill.jsx";
import { getJobs, scrapeJobUrl } from "./services/jobsApi.js";

const mockJobs = [
  {
    id: 1,
    company: "Acme Corp",
    status: "Applied",
    position: "Frontend Engineer",
    score: 72,
    salaryPosted: "$120,000",
    salaryEstimate: "$115,000",
  },
  {
    id: 2,
    company: "Globex",
    status: "Interview",
    position: "Full Stack Developer",
    score: 84,
    salaryPosted: "$130,000",
    salaryEstimate: "$128,000",
  },
  {
    id: 3,
    company: "Initech",
    status: "Offer",
    position: "Backend Engineer",
    score: 90,
    salaryPosted: "$140,000",
    salaryEstimate: "$135,000",
  },
  {
    id: 4,
    company: "Umbrella",
    status: "Rejected",
    position: "Data Engineer",
    score: 65,
    salaryPosted: "$125,000",
    salaryEstimate: "$123,000",
  },
  {
    id: 5,
    company: "Soylent",
    status: "Applied",
    position: "DevOps Engineer",
    score: 77,
    salaryPosted: "$118,000",
    salaryEstimate: "$120,000",
  },
];

const techStack = [
  "FastAPI",
  "Pydantic",
  "PostgreSQL",
  "React",
  "Docker",
  "OpenAI",
  "Uvicorn",
  "Jira",
  "GitHub",
];

function getStatusKey(status) {
  if (!status) return "new";
  return String(status).toLowerCase();
}

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  const useMock =
    !import.meta.env.VITE_JOBS_API_URL && !import.meta.env.VITE_API_BASE_URL;

  async function reloadJobs(cancelledRef) {
    if (useMock) {
      setJobs(mockJobs);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const rows = await getJobs();
      if (!cancelledRef?.current) setJobs(rows);
    } catch (err) {
      if (!cancelledRef?.current)
        setError(err?.message || "Failed to load jobs");
    } finally {
      if (!cancelledRef?.current) setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    const ref = { current: cancelled };
    reloadJobs(ref);
    return () => {
      cancelled = true;
      ref.current = true;
    };
  }, [useMock]);

  useEffect(() => {
    if (!pendingSubmissions.length || !jobs.length) return;
    setPendingSubmissions((prev) =>
      prev.filter(
        (pending) => !jobs.some((job) => job.url && job.url === pending.url)
      )
    );
  }, [jobs, pendingSubmissions.length]);

  async function handleUrlSubmit(value) {
    const placeholder = {
      id: `pending-${Date.now()}`,
      company: "",
      status: "New",
      position: "",
      score: "",
      salaryPosted: "",
      salaryEstimate: "",
      snapshot: "",
      url: value,
    };

    setPendingSubmissions((prev) => [placeholder, ...prev]);

    try {
      setLoading(true);
      await scrapeJobUrl(value);
    } catch (err) {
      setError(err?.message || "Failed to submit URL for scraping");
    } finally {
      await reloadJobs({ current: false });
    }
  }

  const statusCounts = useMemo(() => {
    const counts = {
      new: 0,
      applied: 0,
      rejected: 0,
      interview: 0,
      offer: 0,
    };
    (jobs || []).forEach((job) => {
      const key = getStatusKey(job.status);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  const averageScore = useMemo(() => {
    const scores = (jobs || [])
      .map((job) => Number(job.score))
      .filter((score) => !Number.isNaN(score));
    if (!scores.length) return null;
    const sum = scores.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / scores.length);
  }, [jobs]);

  const totalTracked = (jobs?.length || 0) + pendingSubmissions.length;
  const interviewCount = statusCounts.interview || 0;
  const offerCount = statusCounts.offer || 0;

  const metrics = [
    {
      label: "Total tracked",
      value: totalTracked,
      hint: `${pendingSubmissions.length} pending job scrapes`,
      trend:
        pendingSubmissions.length > 0 ? `+${pendingSubmissions.length}` : null,
      accent: "primary",
    },
    {
      label: "Interviews",
      value: interviewCount,
      hint: "Moving through the funnel",
      trend: interviewCount > 0 ? "+on schedule" : null,
      accent: "accent",
    },
    {
      label: "Average fit",
      value: averageScore !== null ? `${averageScore}%` : "Pending",
      hint: "Based on AI scoring",
      trend:
        averageScore !== null
          ? `${averageScore - 70 >= 0 ? "+" : ""}${averageScore - 70}% vs target`
          : null,
      accent: "muted",
    },
    {
      label: "Offers",
      value: offerCount,
      hint: "Ready for decision",
      trend: offerCount > 0 ? "+progress" : null,
      accent: "success",
    },
  ];

  const topJob = useMemo(() => {
    if (!jobs?.length) return null;
    return [...jobs].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  }, [jobs]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-mark" src={logo} alt="JobHub logo" />
          <div>
            <h1 className="brand-title">JobHub</h1>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="eyebrow">Navigation</p>
          <div className="pill-nav">
            <button type="button" className="pill-nav-item active">
              Overview
            </button>
            <button type="button" className="pill-nav-item inactive disabled">
              Insights <span className="pill-badge">Coming soon</span>
            </button>
            <button type="button" className="pill-nav-item inactive disabled">
              Automation <span className="pill-badge">Coming soon</span>
            </button>
            <button type="button" className="pill-nav-item inactive disabled">
              Settings <span className="pill-badge">Coming soon</span>
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="eyebrow">Tech stack</p>
          <div className="badge-grid">
            {techStack.map((item) => (
              <span key={item} className="tech-chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <p className="muted">
            Muaz Rehman 2025 &#8226; Built with FastAPI & React
          </p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="page-header">
          <div>
            <h2>Job Dashboard</h2>
            <p className="muted">
              Scrape, and monitor job applications.
            </p>
          </div>
          <div className="header-actions">
            <a className="ghost-button" href="#jobs">
              View Jobs
            </a>
            <a className="primary-button" href="#capture">
              Add job
            </a>
          </div>
        </header>

        <div className="metric-grid">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
              trend={metric.trend}
              accent={metric.accent}
            />
          ))}
        </div>

        <div className="panels-grid">
          <div id="capture">
            <Panel
              title="Capture"
              subtitle="Scrape a new posting"
              action={<StatusPill status="new" label="Live scrape" subtle />}
            >
              <UrlInputForm onSubmit={handleUrlSubmit} />
            </Panel>
          </div>

          <Panel
            title="Insight"
            subtitle="Highest-fit role"
            action={
              <span className="pill subtle">
                {averageScore !== null ? "AI scoring active" : "Waiting on data"}
              </span>
            }
            className="insight-panel"
          >
            {topJob ? (
              <div className="insight">
                <div>
                  <p className="eyebrow">{topJob.company}</p>
                  <h4>{topJob.position}</h4>
                  <p className="muted">
                    Offer potential based on compensation and application stage.
                  </p>
                </div>
                <div className="insight-meta">
                  <StatusPill status={topJob.status} label={topJob.status} />
                  <div className="score-container compact">
                    <div className="score-bar">
                      <div
                        className="score-bar-fill"
                        style={{ width: `${topJob.score || 0}%` }}
                      />
                    </div>
                    <span className="score-label">{topJob.score}% match</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">Add a posting to start seeing highlights.</p>
            )}
          </Panel>

          <Panel
            id="jobs"
            title="Jobs"
            subtitle="Applications"
            className="pipeline-panel"
            action={
              <div className="status-legend">
                <StatusPill
                  status="applied"
                  label={`Applied: ${statusCounts.applied || 0}`}
                  subtle
                  size="sm"
                />
                <StatusPill
                  status="interview"
                  label={`Interview: ${interviewCount}`}
                  subtle
                  size="sm"
                />
                <StatusPill
                  status="offer"
                  label={`Offers: ${offerCount}`}
                  subtle
                  size="sm"
                />
              </div>
            }
          >
            <JobsTable
              jobs={jobs}
              loading={loading}
              error={error}
              pendingSubmissions={pendingSubmissions}
            />
          </Panel>
        </div>
      </main>
    </div>
  );
}

export default App;
