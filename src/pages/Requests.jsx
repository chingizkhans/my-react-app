import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { MetricCard, SectionHead, StatusPill } from "../components/UI.jsx";
import { requestsSeed } from "../data/mock.js";
import { db } from "../firebase.js";
import { COLLECTIONS } from "../firebase/collections.js";
import { useAuth } from "../auth/useAuth.jsx";

const statementTypes = [
  "Absence statement",
  "Vacation request",
  "Day-off request",
  "Remote work request",
  "Service note for work absence",
];

const salaryModes = [
  "Without salary retention",
  "With salary retention",
];

const hourModes = ["Without hour recovery", "With hour recovery"];

function buildTemplateByType(form) {
  const fromDate = form.fromDate || "__/__/____";
  const toDate = form.toDate || "__/__/____";
  const fullName = form.fullName || "Full name";

  if (form.statementType === "Vacation request") {
    return `I, ${fullName}, request annual leave from ${fromDate} to ${toDate}. Payment mode: ${form.salaryMode}. Reason: ${form.reason}. Please route this request to People Operations for approval.`;
  }

  if (form.statementType === "Day-off request") {
    return `I, ${fullName}, request a day off from ${fromDate} to ${toDate}. Hour mode: ${form.hourMode}. Payment mode: ${form.salaryMode}. Reason: ${form.reason}. Please route this request to People Operations for processing.`;
  }

  if (form.statementType === "Remote work request") {
    return `I, ${fullName}, request approval for remote work from ${fromDate} to ${toDate}. Reason: ${form.reason}. Hour mode: ${form.hourMode}. Please route this request to People Operations and the line manager.`;
  }

  if (form.statementType === "Service note for work absence") {
    return `I, ${fullName}, submit a service note for absence from ${fromDate} to ${toDate}. Reason: ${form.reason}. Payment mode: ${form.salaryMode}. Please register the note and route it to People Operations for review.`;
  }

  return `I, ${fullName}, was unable to attend work from ${fromDate} to ${toDate} because of ${form.reason}. ${form.salaryMode}. ${form.hourMode}. Please route this request to People Operations for processing.`;
}

function RequestsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState(
    requestsSeed.map((item) => ({ ...item, decision: "Pending" })),
  );
  const [form, setForm] = useState({
    statementType: statementTypes[0],
    fullName: "",
    fromDate: "",
    toDate: "",
    reason: "medical leave",
    salaryMode: salaryModes[0],
    hourMode: hourModes[0],
  });
  const [queueItems, setQueueItems] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    if (!user) {
      setQueueItems([]);
      return undefined;
    }

    const q = query(
      collection(db, COLLECTIONS.requests),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setQueueItems(next);
      },
      (error) => {
        setSendError(error.message);
      },
    );

    return unsubscribe;
  }, [user]);

  const approve = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, decision: "Approved" } : item)),
    );
  };

  const reject = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, decision: "Rejected" } : item)),
    );
  };

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.decision === "Approved") acc.approved += 1;
        if (item.decision === "Rejected") acc.rejected += 1;
        return acc;
      },
      { total: 0, approved: 0, rejected: 0 },
    );
  }, [items]);

  const templatePreview = useMemo(() => buildTemplateByType(form), [form]);

  const sendToWorkflow = async () => {
    if (!user) {
      setSendError("You must sign in before sending a request.");
      return;
    }

    if (!form.fullName.trim() || !form.fromDate || !form.toDate) {
      setSendError("Fill in the full name and both dates.");
      return;
    }

    setIsSending(true);
    setSendError("");

    try {
      const requestRef = await addDoc(collection(db, COLLECTIONS.requests), {
        type: form.statementType,
        fullName: form.fullName.trim(),
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason.trim(),
        salaryMode: form.salaryMode,
        hourMode: form.hourMode,
        payload: templatePreview,
        status: "submitted",
        priority:
          form.statementType === "Service note for work absence" ? "High" : "Normal",
        targetUnit: "People Operations",
        route: {
          currentDepartmentId: "people_ops",
          workflowId: "people_ops_standard",
          currentStage: "submitted",
        },
        history: [
          {
            stage: "submitted",
            actorEmail: user?.email ?? "guest",
            at: new Date().toISOString(),
          },
        ],
        createdByEmail: user?.email ?? "guest",
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, COLLECTIONS.actionLogs), {
        entityType: "request",
        entityId: requestRef.id,
        action: "request_submitted",
        actorEmail: user?.email ?? "guest",
        createdAt: serverTimestamp(),
      });

      setForm((prev) => ({
        ...prev,
        fullName: "",
        fromDate: "",
        toDate: "",
        reason: "medical leave",
      }));
    } catch (error) {
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const onFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const requestStats = [
    {
      title: "Cases total",
      value: summary.total,
      delta: `Approved ${summary.approved} · Rejected ${summary.rejected}`,
      tone: "ink",
      eyebrow: "Flow",
    },
    {
      title: "Requests in Firestore",
      value: queueItems.length,
      delta: "Live workflow records from Firebase",
      tone: "sea",
      eyebrow: "Queue",
    },
    {
      title: "Authorization",
      value: user ? "Active" : "Required",
      delta: user ? "Workflow submission available" : "Sign in to submit statements",
      tone: "sun",
      eyebrow: "Access",
    },
  ];

  return (
    <section className="page-wrap">
      <SectionHead
        title="Employee requests"
        subtitle="Create, submit, and review internal employee statements"
      />

      <div className="metric-grid compact">
        {requestStats.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="panel panel-form">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Statement builder</p>
              <h3>Create a new request</h3>
            </div>
          </div>

          <div className="statement-grid">
            <label>
              Document type
              <select
                value={form.statementType}
                onChange={(event) => onFormChange("statementType", event.target.value)}
                className="form-control"
              >
                {statementTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Full name
              <input
                className="form-control"
                value={form.fullName}
                onChange={(event) => onFormChange("fullName", event.target.value)}
                placeholder="Enter employee full name"
              />
            </label>

            <label>
              From
              <input
                type="date"
                className="form-control"
                value={form.fromDate}
                onChange={(event) => onFormChange("fromDate", event.target.value)}
              />
            </label>

            <label>
              To
              <input
                type="date"
                className="form-control"
                value={form.toDate}
                onChange={(event) => onFormChange("toDate", event.target.value)}
              />
            </label>

            <label>
              Salary mode
              <select
                className="form-control"
                value={form.salaryMode}
                onChange={(event) => onFormChange("salaryMode", event.target.value)}
              >
                {salaryModes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Hour mode
              <select
                className="form-control"
                value={form.hourMode}
                onChange={(event) => onFormChange("hourMode", event.target.value)}
              >
                {hourModes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Reason
            <input
              className="form-control"
              value={form.reason}
              onChange={(event) => onFormChange("reason", event.target.value)}
            />
          </label>

          <div className="template-box">
            <p className="template-title">Template preview</p>
            <p>{templatePreview}</p>
          </div>

          <div className="panel-actions">
            <button
              className="btn solid"
              onClick={sendToWorkflow}
              disabled={isSending || !user}
            >
              {isSending ? "Sending..." : "Send to workflow"}
            </button>
            {!user ? (
              <p className="auth-error">Please sign in before submitting.</p>
            ) : null}
            {sendError ? <p className="auth-error">{sendError}</p> : null}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Workflow queue</p>
              <h3>Requests stored in Firebase</h3>
            </div>
          </div>

          {queueItems.length > 0 ? (
            <div className="stack">
              {queueItems.map((item) => (
                <article key={item.id} className="row-card">
                  <div>
                    <strong>{item.type}</strong>
                    <p>{item.fullName}</p>
                  </div>
                  <StatusPill value={item.status ?? "submitted"} />
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-card">
              <strong>Queue is empty</strong>
              <p>Submitted statements will appear here automatically.</p>
            </div>
          )}
        </article>
      </div>

      <div className="stack">
        {items.map((item) => (
          <article key={item.id} className="row-card">
            <div>
              <strong>{item.type}</strong>
              <p>
                {item.employee} · Manager: {item.manager}
              </p>
            </div>

            <div className="row-actions">
              <StatusPill value={item.decision} />
              <button className="btn soft" onClick={() => approve(item.id)}>
                Approve
              </button>
              <button className="btn danger" onClick={() => reject(item.id)}>
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RequestsPage;
