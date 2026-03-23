import { adminUsers, documents, teamMembers } from "./mock.js";

export const departmentsSeed = [
  {
    id: "data_analytics",
    code: "OAID",
    name: "ОАиД - Отдел аналитики и отчетности данных",
    leadEmail: "kasiet.moldalieva@bpc.kg",
    city: "Бишкек",
    slaHours: 24,
  },
  {
    id: "devops",
    code: "DEVOPS",
    name: "Отдел DevOps",
    leadEmail: "aibek.atiev@bpc.kg",
    city: "Бишкек",
    slaHours: 12,
  },
  {
    id: "accounting",
    code: "FIN",
    name: "Отдел бухгалтерии",
    leadEmail: "raya.tashtanalieva@bpc.kg",
    city: "Бишкек",
    slaHours: 24,
  },
  {
    id: "infra_network",
    code: "OIP",
    name: "ОИП - Отдел серверов и сетевой связи",
    leadEmail: "nursultan.abdyldaev@bpc.kg",
    city: "Бишкек",
    slaHours: 8,
  },
  {
    id: "support",
    code: "STP",
    name: "СТП - Служба технической поддержки",
    leadEmail: "pavel.titov@bpc.kg",
    city: "Бишкек",
    slaHours: 6,
  },
  {
    id: "marketing",
    code: "MKT",
    name: "Отдел маркетинга",
    leadEmail: "alina.zholdosheva@bpc.kg",
    city: "Бишкек",
    slaHours: 24,
  },
  {
    id: "people_ops",
    code: "OPRP",
    name: "ОПРП - Отдел по работе с персоналом",
    leadEmail: "gulnura.kasymbekova@bpc.kg",
    city: "Бишкек",
    slaHours: 12,
  },
  {
    id: "board",
    code: "BOARD",
    name: "Члены правления",
    leadEmail: "kubanychbek.maksatov@bpc.kg",
    city: "Бишкек",
    slaHours: 48,
  },
  {
    id: "risk_management",
    code: "RISK",
    name: "Департамент риск-менеджмента",
    leadEmail: "aida.kasmalieva@bpc.kg",
    city: "Бишкек",
    slaHours: 8,
  },
  {
    id: "aml_monitoring",
    code: "AML",
    name: "Отдел AML и мониторинга транзакций",
    leadEmail: "elnura.sultanova@bpc.kg",
    city: "Бишкек",
    slaHours: 4,
  },
  {
    id: "digital_banking",
    code: "DIGI",
    name: "Отдел цифрового банкинга",
    leadEmail: "bekzat.ashyraliev@bpc.kg",
    city: "Бишкек",
    slaHours: 18,
  },
  {
    id: "information_security",
    code: "SEC",
    name: "Отдел информационной безопасности",
    leadEmail: "marlen.usenov@bpc.kg",
    city: "Бишкек",
    slaHours: 4,
  },
];

export const roleDefinitions = [
  {
    id: "employee",
    title: "Employee",
    scope: ["profile:read:self", "requests:create:self", "documents:read:public"],
  },
  {
    id: "manager",
    title: "Manager",
    scope: ["team:read", "requests:review:team", "documents:read:public"],
  },
  {
    id: "hr_admin",
    title: "HR Admin",
    scope: ["employees:read", "employees:write", "requests:manage", "documents:manage"],
  },
  {
    id: "finance_view",
    title: "Finance View",
    scope: ["requests:read", "documents:read", "reports:read"],
  },
  {
    id: "security_officer",
    title: "Security Officer",
    scope: ["security:read", "security:triage", "employees:read"],
  },
  {
    id: "super_admin",
    title: "Super Admin",
    scope: ["*"],
  },
];

export const requestTypeDefinitions = [
  {
    id: "vacation_request",
    label: "Vacation request",
    targetDepartmentId: "people_ops",
    defaultPriority: "Normal",
  },
  {
    id: "sick_leave",
    label: "Sick leave",
    targetDepartmentId: "people_ops",
    defaultPriority: "High",
  },
  {
    id: "schedule_change",
    label: "Schedule change",
    targetDepartmentId: "people_ops",
    defaultPriority: "Normal",
  },
  {
    id: "remote_work",
    label: "Remote work request",
    targetDepartmentId: "people_ops",
    defaultPriority: "Normal",
  },
  {
    id: "payroll_issue",
    label: "Payroll issue",
    targetDepartmentId: "accounting",
    defaultPriority: "High",
  },
  {
    id: "access_request",
    label: "Access request",
    targetDepartmentId: "information_security",
    defaultPriority: "High",
  },
  {
    id: "service_note_absence",
    label: "Service note for work absence",
    targetDepartmentId: "people_ops",
    defaultPriority: "High",
  },
];

export const workflowDefinitions = [
  {
    id: "people_ops_standard",
    requestTypeIds: [
      "vacation_request",
      "sick_leave",
      "schedule_change",
      "remote_work",
      "service_note_absence",
    ],
    route: ["submitted", "triaged", "in_review", "approved", "closed"],
    ownerDepartmentId: "people_ops",
  },
  {
    id: "finance_review",
    requestTypeIds: ["payroll_issue"],
    route: ["submitted", "triaged", "in_review", "resolved", "closed"],
    ownerDepartmentId: "accounting",
  },
  {
    id: "security_access",
    requestTypeIds: ["access_request"],
    route: ["submitted", "triaged", "security_review", "approved", "closed"],
    ownerDepartmentId: "information_security",
  },
];

export const employeeSeed = teamMembers.map((member) => ({
  ...member,
  status: "active",
  roleId: member.email === "kasiet.moldalieva@bpc.kg" ? "hr_admin" : "employee",
  source: "seed",
}));

export const adminSeed = adminUsers.map((user) => ({
  ...user,
  status: user.status ?? "active",
  source: "seed",
}));

export const documentSeed = documents.map((item) => ({
  ...item,
  category: "hr_policy",
  source: "seed",
}));
