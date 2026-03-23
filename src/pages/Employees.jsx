import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { MetricCard, SectionHead } from "../components/UI.jsx";
import { teamMembers } from "../data/mock.js";
import { db } from "../firebase.js";
import { COLLECTIONS } from "../firebase/collections.js";
import { useAuth } from "../auth/useAuth.jsx";

function EmployeesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("All");

  const [people, setPeople] = useState([]);
  const [peopleLoaded, setPeopleLoaded] = useState(false);
  const [ownProfileLoaded, setOwnProfileLoaded] = useState(false);
  const [hasOwnProfile, setHasOwnProfile] = useState(false);

  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    role: "",
    unit: "",
    mobilePhone: "",
    address: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.employees),
      (snapshot) => {
        setPeople(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
        );
        setPeopleLoaded(true);
      },
      (error) => {
        setSaveError(error.message);
        setPeopleLoaded(true);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setOwnProfileLoaded(true);
      setHasOwnProfile(false);
      setProfileForm((prev) => ({ ...prev, email: "" }));
      return undefined;
    }

    setProfileForm((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
    }));

    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.employees, user.uid),
      (snapshot) => {
        setHasOwnProfile(snapshot.exists());
        setOwnProfileLoaded(true);
      },
      () => {
        setHasOwnProfile(false);
        setOwnProfileLoaded(true);
      },
    );

    return unsubscribe;
  }, [user]);

  const normalizedMockPeople = useMemo(
    () =>
      teamMembers.map((person) => ({
        id: `mock-${person.id}`,
        fullName: person.name,
        role: person.role,
        unit: person.unit,
        office: person.office,
        mobilePhone: person.mobilePhone ?? "-",
        address: person.address ?? "-",
        email: person.email ?? "",
      })),
    [],
  );

  const firePeople = useMemo(
    () =>
      people.map((person) => ({
        id: person.id,
        fullName: person.fullName ?? person.name ?? "",
        role: person.role ?? "",
        unit: person.unit ?? "",
        office: person.office ?? "Bishkek",
        mobilePhone: person.mobilePhone ?? "-",
        address: person.address ?? "-",
        email: person.email ?? "",
      })),
    [people],
  );

  const mergedPeople = useMemo(() => {
    const byEmail = new Set(firePeople.map((person) => person.email).filter(Boolean));
    const byName = new Set(
      firePeople.map((person) => person.fullName.trim().toLowerCase()),
    );

    const mockUnique = normalizedMockPeople.filter((person) => {
      const keyName = person.fullName.trim().toLowerCase();
      return !byName.has(keyName) && !byEmail.has(person.email);
    });

    return [...firePeople, ...mockUnique];
  }, [firePeople, normalizedMockPeople]);

  const units = useMemo(
    () => ["All", ...new Set(mergedPeople.map((person) => person.unit).filter(Boolean))],
    [mergedPeople],
  );

  const filtered = useMemo(() => {
    return mergedPeople.filter((person) => {
      const byUnit = unit === "All" || person.unit === unit;
      const normalized =
        `${person.fullName} ${person.email} ${person.role} ${person.office} ${person.mobilePhone} ${person.address}`.toLowerCase();
      const byQuery = normalized.includes(query.toLowerCase().trim());
      return byUnit && byQuery;
    });
  }, [mergedPeople, query, unit]);

  const onFormChange = (key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    if (!user) {
      setSaveError("Please sign in first.");
      return;
    }

    if (
      !profileForm.fullName.trim() ||
      !profileForm.email.trim() ||
      !profileForm.role.trim() ||
      !profileForm.unit.trim() ||
      !profileForm.mobilePhone.trim() ||
      !profileForm.address.trim()
    ) {
      setSaveError("Fill in all employee card fields.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await setDoc(doc(db, COLLECTIONS.employees, user.uid), {
        uid: user.uid,
        email: profileForm.email.trim().toLowerCase(),
        fullName: profileForm.fullName.trim(),
        role: profileForm.role.trim(),
        unit: profileForm.unit.trim(),
        mobilePhone: profileForm.mobilePhone.trim(),
        address: profileForm.address.trim(),
        office: "Bishkek",
        roleId: "employee",
        status: "active",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const employeeStats = [
    {
      title: "Profiles total",
      value: mergedPeople.length,
      delta: "Firestore plus internal directory",
      tone: "ink",
      eyebrow: "Directory",
    },
    {
      title: "Departments",
      value: units.length - 1,
      delta: "Teams in one operating layer",
      tone: "sea",
      eyebrow: "Org",
    },
    {
      title: "Visible now",
      value: filtered.length,
      delta: "Based on filters and search",
      tone: "sun",
      eyebrow: "Filter",
    },
  ];

  return (
    <section className="page-wrap">
      <SectionHead
        title="Employee directory"
        subtitle="Unified employee catalog with self-registration for new internal profiles"
        action={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input"
            placeholder="Search by name, email, role, or phone"
          />
        }
      />

      <div className="metric-grid compact">
        {employeeStats.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      {user && ownProfileLoaded && !hasOwnProfile ? (
        <article className="panel panel-form">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Self onboarding</p>
              <h3>Create employee card</h3>
            </div>
          </div>
          <p className="panel-copy">
            Your account exists, but your employee card has not been created yet.
            Once submitted, it will appear in the shared directory.
          </p>

          <div className="statement-grid">
            <label>
              Full name
              <input
                className="form-control"
                value={profileForm.fullName}
                onChange={(event) => onFormChange("fullName", event.target.value)}
              />
            </label>
            <label>
              Email
              <input
                className="form-control"
                value={profileForm.email}
                onChange={(event) => onFormChange("email", event.target.value)}
                placeholder="name@company.kg"
              />
            </label>
            <label>
              Role
              <input
                className="form-control"
                value={profileForm.role}
                onChange={(event) => onFormChange("role", event.target.value)}
              />
            </label>
            <label>
              Department
              <input
                className="form-control"
                value={profileForm.unit}
                onChange={(event) => onFormChange("unit", event.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                className="form-control"
                value={profileForm.mobilePhone}
                onChange={(event) => onFormChange("mobilePhone", event.target.value)}
              />
            </label>
            <label>
              Address
              <input
                className="form-control"
                value={profileForm.address}
                onChange={(event) => onFormChange("address", event.target.value)}
              />
            </label>
          </div>

          <div className="panel-actions">
            <button className="btn solid" onClick={saveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Add to directory"}
            </button>
            {saveError ? <p className="auth-error">{saveError}</p> : null}
          </div>
        </article>
      ) : null}

      <div className="chip-row">
        {units.map((item) => (
          <button
            key={item}
            className={item === unit ? "chip active" : "chip"}
            onClick={() => setUnit(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Office</th>
            </tr>
          </thead>
          <tbody>
            {peopleLoaded
              ? filtered.map((person) => (
                  <tr key={person.id}>
                    <td>{person.fullName}</td>
                    <td>{person.email || "-"}</td>
                    <td>{person.role}</td>
                    <td>{person.unit}</td>
                    <td>{person.mobilePhone}</td>
                    <td>{person.address}</td>
                    <td>{person.office}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default EmployeesPage;
