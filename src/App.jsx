import { useEffect, useState } from "react";
import logo from "./assets/logo-bg.png";
import "./App.css";
import UrlInputForm from "./components/UrlInputForm.jsx";
import JobsTable from "./components/JobsTable.jsx";
import { getJobs, scrapeJobUrl } from "./services/jobsApi.js";

// Mock data for development (replace with API later)
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

  return (
    <>
      <div>
        <section style={{ marginBottom: "50px" }}>
          <img className="logo" src={logo} alt="Logo" />
          <h1>JobHub</h1>
          <h2 style={{ marginBottom: "1em" }}>Demo</h2>
          <b style={{ marginBottom: "50px" }}>
            A demo app showcasing microservices, scraping, and AI-driven
            insights for managing job applications efficiently.
          </b>
        </section>
        <section className="tech-badges">
          <h2>Tech Stack</h2>
          <div className="badges">
            <span className="badge python">Python</span>
            <span className="badge fastapi">FastAPI</span>
            <span className="badge pydantic">Pydantic</span>
            <span className="badge html">HTML</span>
            <span className="badge css">CSS</span>
            <span className="badge js">React</span>
            <span className="badge docker">Docker</span>
            <span className="badge uvicorn">Uvicorn</span>
            <span className="badge postgres">PostgreSQL</span>
            <span className="badge github">GitHub</span>
            <span className="badge jira">Jira</span>
            <span className="badge openai">OpenAI API</span>
          </div>
        </section>
        <section className="dashboard">
          <UrlInputForm onSubmit={handleUrlSubmit} />
          <JobsTable
            jobs={jobs}
            loading={loading}
            error={error}
            pendingSubmissions={pendingSubmissions}
          />
        </section>
      </div>
    </>
  );
}

export default App;
