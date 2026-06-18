export const navItems = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    url: "dashboard",
    key: "dashboard",
  },
  {
    title: "Sales",
    icon: "Briefcase",
    url: "/sales",
    key: "sales",
    children: [
      { title: "Leads", icon: "", url: "sales/leads", key: "leads" },
      { title: "Company", icon: "", url: "sales/company", key: "company" },
      // { title: "Lead form", icon: "", url: "sales/leadForm", key: "leadForm" },
      { title: "Estimate", icon: "", url: "sales/estimate", key: "estimate" },
      { title: "Proposal", icon: "", url: "sales/proposal", key: "proposal" },
      {
        title: "All invoice",
        url: "sales/allInvoice",
        key: "allInvoice",
      },
      {
        title: "Unbilled",
        url: "sales/unbilled",
        key: "unbilled",
      },
      // {
      //   title: "Discounted Estimate",
      //   icon: "",
      //   url: "sales/discountedEstimate",
      //   key: "discountedEstimate",
      // },
      {
        title: "Auto history",
        icon: "",
        url: "sales/autoHistory",
        key: "autoHistory",
      },
      {
        title: "Sales report",
        icon: "",
        url: "sales/salesReport",
        key: "salesReport",
      },
      // {
      //   title: "Automation report",
      //   icon: "",
      //   url: "sales/automationReport",
      //   key: "automationReport",
      // },
      // { title: "Projects", icon: "", url: "sales/projects", key: "projects" },
      // {
      //   title: "Serving Companies",
      //   icon: "",
      //   url: "sales/servingCompanies",
      //   key: "servingCompanies",
      // },
    ],
  },
  {
    title: "Accounts",
    icon: "HandCoins",
    url: "/accounts",
    key: "accounts",
    children: [
      {
        title: "Organization",
        icon: "",
        url: "accounts/organizations",
        key: "organizations",
      },
      // {
      //   title: "Company form",
      //   icon: "",
      //   url: "accounts/companyForm",
      //   key: "companyForm",
      // },
      {
        title: "Company approvals",
        icon: "",
        url: "accounts/companyApprovals",
        key: "companyApprovals",
      },
      // {
      //   title: "Payment approvals",
      //   icon: "",
      //   url: "accounts/paymentApprovals",
      //   key: "paymentApprovals",
      // },
      // {
      //   title: "Bank statement",
      //   url: "accounts/bankStatement",
      //   key: "bankStatement",
      // },
      // {
      //   title: "Payment register",
      //   url: "accounts/paymentRegister",
      //   key: "paymentRegister",
      // },
      {
        title: "Expenses",
        url: "accounts/expensesApprovals",
        key: "allInvoice",
      },
      {
        title: "Unbilled",
        url: "accounts/unbilled",
        key: "unbilled",
      },
      {
        title: "All invoice",
        url: "accounts/allInvoice",
        key: "allInvoice",
      },
      {
        title: "Taxation",
        url: "accounts/taxation",
        key: "taxation",
      },
      {
        title: "Procurement PR",
        url: "accounts/procurementPaymentRequests",
        key: "procurementPaymentRequests",
      },
      {
        title: "Procurement PO",
        url: "accounts/procurementPurchaseOrders",
        key: "procurementPurchaseOrders",
      },

      // {
      //   title: "Estimate",
      //   url: "accounts/orgEstimate",
      //   key: "accounts/orgEstimate",
      //   icon: "",
      // },
      // {
      //   title: "Vendors payment",
      //   url: "accounts/vendorsPayment",
      //   key: "accounts/vendorsPayment",
      //   icon: "",
      // },
      {
        title: "Credit Note",
        url: "accounts/creditNote",
        key: "creditnote",
      },
    ],
  },
  {
    title: "Industry",
    icon: "Factory",
    url: "/industry",
    key: "industry",
    children: [
      {
        title: "Industry",
        icon: "",
        url: "industry/industries",
        key: "industries",
      },
      {
        title: "Sub industries",
        icon: "",
        url: "industry/subindustries",
        key: "subindustries",
      },
      {
        title: "Category",
        icon: "",
        url: "industry/categories",
        key: "categories",
      },
      {
        title: "Business activity",
        icon: "",
        url: "industry/businessActivity",
        key: "businessActivity",
      },
    ],
  },
  {
    title: "HR",
    icon: "SquareUserRound",
    url: "/hr",
    key: "hr",
    children: [
      { title: "Users list", icon: "", url: "hr/usersList", key: "usersList" },
      {
        title: "Users approval list",
        icon: "",
        url: "hr/usersApprovalList",
        key: "usersApprovalList",
      },
      { title: "Services", icon: "", url: "hr/services", key: "services" },
    ],
  },
  {
    title: "Admin approvals",
    icon: "User2",
    url: "/admin",
    key: "admin",
    children: [
      {
        title: "Vendor payment",
        icon: "",
        url: "admin/vendorPaymentApproval",
        key: "vendorPaymentApproval",
      },
      {
        title: "Discounted estimate",
        icon: "",
        url: "admin/discountedEstimate",
        key: "discountedEstimate",
      },
    ],
  },
  {
    title: "Quality",
    icon: "FlaskConical",
    url: "/quality",
    key: "quality",
    children: [
      { title: "IVR", icon: "", url: "quality/ivr", key: "ivr" },
      { title: "Report", icon: "", url: "quality/report", key: "report" },
      {
        title: "Lead search",
        url: "quality/leadsSearch",
        key: "leadsSearch",
      },
    ],
  },
  {
    title: "Operation",
    icon: "GitCommitHorizontal",
    url: "/operation",
    key: "operation",
    children: [
      {
        title: "Projects",
        icon: "",
        url: "operation/projects",
        key: "projects",
      },
      {
        title: "Legal requests",
        icon: "",
        url: "operation/legalRequests",
        key: "legalRequests",
      },
      {
        title: "Settings",
        icon: "",
        url: "operation/settings",
        key: "settings",
      },
    ],
  },
  {
    title: "Users",
    icon: "User2",
    url: "users",
    key: "users",
    children: [
      {
        title: "Users List",
        key: "usersList",
        url: "users/usersList",
      },
      {
        title: "Approval list",
        key: "approvalList",
        url: "users/approvalList",
      },
      {
        title: "Mail Configuration",
        key: "mailConfig",
        url: "users/usersMailConfig",
      },
    ],
  },
  {
    title: "Procurement",
    icon: "SquareUserRound",
    url: "",
    key: "Procurement",
    children: [
      {
        title: "Solutions",
        url: "procurement/solutions",
        key: "solutions",
      },
      {
        title: "Vendor request",
        url: "procurement/vendors-requests",
        key: "vendorRequest",
      },
      {
        title: "Vendor list",
        url: "procurement/vendorList",
        key: "vendorList",
      },
      {
        title: "Projects",
        url: "procurement/projects",
        key: "projects",
      },
      {
        title: "Payments",
        url: "procurement/vendors-payments",
        key: "vendors-payments",
      },
      {
        title: "Estimate",
        url: "procurement/vendors-estimates",
        key: "vendors-estimates",
      },
    ],
  },
  {
    title: "Settings",
    icon: "Settings",
    url: "/settings",
    key: "settings",
    children: [
      { title: "Status", icon: "", url: "settings/status", key: "status" },
      {
        title: "Solutions",
        icon: "",
        url: "settings/solutions",
        key: "solutions",
      },
      {
        title: "Comments",
        icon: "",
        url: "settings/comments",
        key: "comments",
      },
      {
        title: "IP",
        icon: "",
        url: "settings/ipAddress",
        key: "ipAddress",
      },
      {
        title: "Applicant type",
        icon: "",
        url: "settings/applicantType",
        key: "applicantType",
      },
      {
        title: "Slug",
        icon: "",
        url: "settings/slug",
        key: "slug",
      },
      {
        title: "Urls",
        icon: "",
        url: "settings/urls",
        key: "urls",
      },
      {
        title: "Department",
        icon: "",
        url: "settings/department",
        key: "department",
      },
      {
        title: "Desigination",
        icon: "",
        url: "settings/designation",
        key: "designation",
      },
      {
        title: "Procurement category",
        icon: "",
        url: "settings/procurementCategory",
        key: "procurementCategory",
      },
      {
        title: "Proposal menu",
        icon: "",
        url: "settings/menu",
        key: "menu",
      },
      {
        title: "Payment terms",
        icon: "",
        url: "settings/paymentTerms",
        key: "paymentTerms",
      },
    ],
  },
];

export const accountNavItems = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    url: "accounts/dashboard",
    key: "dashboard",
  },
  // {
  //   title: "Company form",
  //   icon: "BookText",
  //   url: "accounts/companyForm",
  //   key: "companyForm",
  // },
  {
    title: "Company approvals",
    icon: "BookCheck",
    url: "accounts/companyApprovals",
    key: "companyApprovals",
  },
  // {
  //   title: "Payment approvals",
  //   icon: "BadgeCheck",
  //   url: "accounts/paymentApprovals",
  //   key: "paymentApprovals",
  // },
  // {
  //   title: "Bank statement",
  //   url: "accounts/bankStatement",
  //   key: "bankStatement",
  //   icon: "NotebookText",
  // },
  // {
  //   title: "Payment register",
  //   url: "accounts/paymentRegister",
  //   key: "paymentRegister",
  //   icon: "BanknoteArrowDown",
  // },
  {
    title: "Unbilled",
    url: "accounts/unbilled",
    key: "unbilled",
    icon: "ReceiptText",
  },
  {
    title: "Expenses",
    url: "accounts/expensesApprovals",
    key: "expensesApprovals",
    icon: "FileText",
  },
  {
    title: "All invoice",
    url: "accounts/allInvoice",
    key: "allInvoice",
    icon: "FileText",
  },
  {
    title: "Taxation",
    url: "accounts/taxation",
    key: "taxation",
    icon: "FileText",
  },

  {
    title: "Procurement PR",
    url: "accounts/procurementPaymentRequests",
    key: "procurementPaymentRequests",
    icon: "FileText",
  },
  {
    title: "Procurement PO",
    url: "accounts/procurementPurchaseOrders",
    key: "procurementPurchaseOrders",
    icon: "FileText",
  },
  {
    title: "Credit Note",
    url: "accounts/creditNote",
    key: "creditnote",
    icon: "FileText",
  },

  // {
  //   title: "Estimate",
  //   url: "accounts/orgEstimate",
  //   key: "accounts/orgEstimate",
  //   icon: "Book",
  // },
  // {
  //   title: "Vendor's payments",
  //   url: "accounts/vendorsPayment",
  //   key: "accounts/vendorsPayment",
  //   icon: "HandCoins",
  // },
  {
    title: "Organization",
    icon: "Building2",
    url: "accounts/organizations",
    key: "organizations",
    children: [
      {
        title: "Group",
        url: "accounts/organizations/group",
        key: "group",
      },
      {
        title: "Ledger",
        url: "accounts/organizations/ledger",
        key: "ledger",
      },
      {
        title: "Voucher",
        url: "accounts/organizations/voucher",
        key: "voucher",
      },
      {
        title: "Daily book",
        url: "accounts/organizations/dayBook",
        key: "dayBook",
      },
      {
        title: "Profit/Loss",
        url: "accounts/organizations/profitLoss",
        key: "profitLoss",
      },
      {
        title: "Cashflow",
        url: "accounts/organizations/cashflow",
        key: "cashflow",
      },
      {
        title: "Balance sheet",
        url: "accounts/organizations/balanceSheet",
        key: "organizations/balanceSheet",
      },
      {
        title: "Trail balance",
        url: "accounts/organizations/trailBalance",
        key: "organizations/trailBalance",
      },
      {
        title: "Tds",
        url: "accounts/organizations/tds",
        key: "tds",
      },
    ],
  },
  {
    title: "Setting",
    icon: "Settings",
    key: "settings",
    children: [
      {
        title: "Ledger type",
        url: "accounts/settings/ledgerType",
        key: "ledgerType",
      },
      {
        title: "Voucher type",
        url: "accounts/settings/voucherType",
        key: "voucherType",
      },
      {
        title: "Statutory",
        url: "accounts/settings/statutory",
        key: "statutory",
      },
    ],
  },
];

export const salesNavItems = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    url: "sales/dashboard",
    key: "dashboard",
  },

  {
    title: "Leads",
    icon: "PanelBottomClose",
    url: "sales/leads",
    key: "leads",
  },
  { title: "Company", icon: "Building", url: "sales/company", key: "company" },
  // {
  //   title: "Lead form",
  //   icon: "FileText",
  //   url: "sales/leadForm",
  //   key: "leadForm",
  // },
  {
    title: "Estimate",
    icon: "FileText",
    url: "sales/estimate",
    key: "estimate",
  },
  {
    title: "Proposal",
    icon: "BookOpenText",
    url: "sales/proposal",
    key: "proposal",
  },
  {
    title: "All invoice",
    url: "sales/allInvoice",
    icon: "BookOpenText",
    key: "allInvoice",
  },
  {
    title: "Unbilled",
    url: "sales/unbilled",
    icon: "BookOpenText",
    key: "unbilled",
  },
  // {
  //   title: "Discounted Estimate",
  //   icon: "FileMinus",
  //   url: "sales/discountedEstimate",
  //   key: "discountedEstimate",
  // },
  // {
  //   title: "Projects",
  //   icon: "FolderKanban",
  //   url: "sales/projects",
  //   key: "projects",
  // },
  // {
  //   title: "Serving Companies",
  //   icon: "University",
  //   url: "sales/servingCompanies",
  //   key: "servingCompanies",
  // },
];

export const qualityNavItems = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    url: "quality/dashboard",
    key: "dashboard",
  },
  {
    title: "Leads",
    icon: "PanelBottomClose",
    url: "quality/leads",
    key: "leads",
  },
  {
    title: "Lead search",
    icon: "FileSearch2",
    url: "quality/leadsSearch",
    key: "leadsSearch",
  },
  { title: "IVR", icon: "PhoneCall", url: "quality/ivr", key: "ivr" },
  {
    title: "Report",
    icon: "NotepadTextDashed",
    url: "quality/report",
    key: "report",
  },
];

export const procurementItems = [
  {
    title: "Solutions",
    icon: "FileText",
    url: "procurement/solutions",
    key: "solutions",
  },
  {
    title: "Projects",
    icon: "FileText",
    url: "procurement/projects",
    key: "projects",
  },
  {
    title: "Vendor list",
    icon: "User2",
    url: "procurement/vendorList",
    key: "vendorList",
  },

  {
    title: "Payments",
    icon: "HandCoins",
    url: "procurement/vendors-payments",
    key: "vendors-payments",
  },
  {
    title: "Vendor requests",
    icon: "User2",
    url: "procurement/vendors-requests",
    key: "vendors-requests",
  },
  {
    title: "Estimate",
    icon: "FileText",
    url: "procurement/vendors-estimates",
    key: "vendors-estimates",
  },
];

export const hrItems = [
  { title: "Users list", icon: "User2", url: "hr/usersList", key: "usersList" },
  {
    title: "Users approval list",
    icon: "User2",
    url: "hr/usersApprovalList",
    key: "usersApprovalList",
  },
  { title: "Services", icon: "FileText", url: "hr/services", key: "services" },
];

export const operationNavItems = [
  {
    title: "Projects",
    icon: "GitCommitHorizontal",
    url: "operation/projects",
    key: "projects",
  },
  {
    title: "Settings",
    icon: "Settings",
    url: "operation/settings",
    key: "settings",
  },
];

export const operationEmpItems = [
  {
    title: "Projects",
    icon: "GitCommitHorizontal",
    url: "operation/projects",
    key: "projects",
  },
  {
    title: "Legal request",
    icon: "Scale",
    url: "operation/legalRequests",
    key: "legalRequests",
  },
];
