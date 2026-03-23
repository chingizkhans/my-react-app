import { doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase.js";
import {
  adminSeed,
  departmentsSeed,
  documentSeed,
  employeeSeed,
  requestTypeDefinitions,
  roleDefinitions,
  workflowDefinitions,
} from "../data/firestoreSeed.js";
import { COLLECTIONS } from "./collections.js";

function withMeta(record, currentUser) {
  return {
    ...record,
    seededAt: new Date().toISOString(),
    seededBy: currentUser?.email ?? "local_admin",
  };
}

export async function seedWorkspaceData(currentUser) {
  const batch = writeBatch(db);

  departmentsSeed.forEach((item) => {
    batch.set(
      doc(db, COLLECTIONS.departments, item.id),
      withMeta(item, currentUser),
      { merge: true },
    );
  });

  roleDefinitions.forEach((item) => {
    batch.set(doc(db, COLLECTIONS.roles, item.id), withMeta(item, currentUser), {
      merge: true,
    });
  });

  requestTypeDefinitions.forEach((item) => {
    batch.set(
      doc(db, COLLECTIONS.requestTypes, item.id),
      withMeta(item, currentUser),
      { merge: true },
    );
  });

  workflowDefinitions.forEach((item) => {
    batch.set(
      doc(db, COLLECTIONS.workflows, item.id),
      withMeta(item, currentUser),
      { merge: true },
    );
  });

  employeeSeed.forEach((item) => {
    batch.set(
      doc(db, COLLECTIONS.employees, `seed-${item.id}`),
      withMeta(item, currentUser),
      { merge: true },
    );
  });

  adminSeed.forEach((item) => {
    batch.set(
      doc(db, COLLECTIONS.employees, `admin-${item.id}`),
      withMeta(
        {
          fullName: item.name,
          email: item.email,
          roleId: item.role,
          status: item.status,
          office: "Bishkek",
          source: item.source,
        },
        currentUser,
      ),
      { merge: true },
    );
  });

  documentSeed.forEach((item) => {
    batch.set(
      doc(db, COLLECTIONS.documents, String(item.id)),
      withMeta(item, currentUser),
      { merge: true },
    );
  });

  await batch.commit();
}
