import { useState } from "react";

function UrlInputForm({ onSubmit }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(url);
    } else {
      // Fallback: simple demo behavior
      // eslint-disable-next-line no-alert
      alert(`Submitted URL: ${url}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        type="url"
        placeholder="Enter job posting URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        style={{ flex: 1, padding: 8 }}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default UrlInputForm;

