import { useMemo, useState } from "react";
import { MetricCard, SectionHead, StatusPill } from "../components/UI.jsx";
import { overviewCards, requestsSeed, teamMembers } from "../data/mock.js";

const periods = ["This week", "This month", "Quarter"];

function DashboardPage() {
  const [period, setPeriod] = useState(periods[0]);

  const spotlight = useMemo(() => {
    if (period === "This month") return requestsSeed.slice(0, 3);
    if (period === "Quarter") return requestsSeed;
    return requestsSeed.slice(0, 2);
  }, [period]);

  const teamSnapshot = useMemo(
    () => [
      {
        label: "Key focus",
        value: "People analytics and approval speed",
      },
      {
        label: "Business units",
        value: `${new Set(teamMembers.map((member) => member.unit)).size} core departments`,
      },
      {
        label: "Primary office",
        value: "Bishkek headquarters",
      },
    ],
    [],
  );

  const capacityBars = [
    { label: "Onboarding", value: 82 },
    { label: "Requests", value: 64 },
    { label: "Documents", value: 91 },
    { label: "Access control", value: 73 },
  ];

  return (
    <section className="page-wrap">
      <SectionHead
        title="HR Operations Center"
        subtitle="Strategic view of people, documents, and approvals across Northstar Fintech"
        action={
          <div className="chip-row">
            {periods.map((item) => (
              <button
                key={item}
                className={item === period ? "chip active" : "chip"}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
        }
      />

      <section className="hero-panel">
        <div>
          <p className="panel-kicker">People Operations</p>
          <h3>Enterprise workforce control for a large fintech organization</h3>
          <p className="hero-copy">
            This platform combines employee records, internal statements,
            compliance documents, and access governance in a single operating layer.
          </p>
          <div className="hero-tags">
            <span>346 employees tracked</span>
            <span>47 active requests</span>
            <span>94% document completion</span>
          </div>
        </div>

        <div className="hero-side">
          {teamSnapshot.map((item) => (
            <div key={item.label} className="hero-stat">
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="metric-grid">
        {overviewCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Priority queue</p>
              <h3>Signals that need attention</h3>
            </div>
            <StatusPill value="Pending" />
          </div>
          <ul className="list">
            {spotlight.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.type}</strong>
                  <p>
                    {item.employee} · Manager: {item.manager}
                  </p>
                </div>
                <StatusPill value={item.priority} />
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Capacity</p>
              <h3>Load across key HR flows</h3>
            </div>
          </div>

          <div className="bar-list">
            {capacityBars.map((bar) => (
              <div key={bar.label} className="bar-row">
                <div className="bar-copy">
                  <span>{bar.label}</span>
                  <strong>{bar.value}%</strong>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${bar.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;