import { useMemo, useState } from "react";
import { MetricCard, SectionHead, StatusPill } from "../components/UI.jsx";
import { documents } from "../data/mock.js";

const statuses = ["All", "Published", "Review", "Draft"];

function DocumentsPage() {
  const [status, setStatus] = useState("All");

  const items = useMemo(() => {
    if (status === "All") return documents;
    return documents.filter((doc) => doc.status === status);
  }, [status]);

  const documentStats = [
    {
      title: "Documents in scope",
      value: documents.length,
      delta: "Core HR and compliance materials",
      tone: "ink",
      eyebrow: "Library",
    },
    {
      title: "Published",
      value: documents.filter((item) => item.status === "Published").length,
      delta: "Available across the process",
      tone: "sea",
      eyebrow: "Live",
    },
    {
      title: "In review",
      value: documents.filter((item) => item.status === "Review").length,
      delta: "Awaiting alignment",
      tone: "sun",
      eyebrow: "Review",
    },
  ];

  return (
    <section className="page-wrap">
      <SectionHead
        title="Internal documents"
        subtitle="Policies, procedures, and internal HR records for operational teams"
      />

      <div className="metric-grid compact">
        {documentStats.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="chip-row">
        {statuses.map((item) => (
          <button
            key={item}
            className={item === status ? "chip active" : "chip"}
            onClick={() => setStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="stack">
        {items.map((doc) => (
          <article key={doc.id} className="row-card">
            <div>
              <strong>{doc.name}</strong>
              <p>{doc.owner}</p>
            </div>
            <div className="row-actions">
              <StatusPill value={doc.status} />
              <button className="btn soft">Open</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DocumentsPage;