import { useState } from "react";

function UrlInputForm({ onSubmit }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(url);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Submitted URL: ${url}`);
    }
    setUrl("");
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <label className="input-label" htmlFor="job-url">
        Job URL
      </label>
      <div className="url-form-row">
        <input
          id="job-url"
          className="text-input"
          type="url"
          placeholder="Paste a job link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button className="accent-button" type="submit">
          Add job
        </button>
      </div>
      <p className="input-hint">Currently does not support Linkedin & Indeed.</p>
    </form>
  );
}

export default UrlInputForm;

