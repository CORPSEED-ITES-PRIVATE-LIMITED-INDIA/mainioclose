import { lazy } from "react";
import { Route } from "react-router-dom";
import InvoiceFeed from "../accounts/InvoiceFeed";
const CompanyApprovals = lazy(() => import("../accounts/CompanyApprovals"));
const PaymentApprovals = lazy(() => import("../accounts/PaymentApprovals"));
const CompanyForm = lazy(() => import("../accounts/CompanyForm"));
const Organizations = lazy(
  () => import("../accounts/organization/Organizations"),
);
const OrganizationDetail = lazy(
  () => import("../accounts/organization/OrganizationDetail"),
);
const Group = lazy(() => import("../accounts/organization/Group"));
const GroupLedger = lazy(() => import("../accounts/organization/GroupLedger"));
const LedgerDetail = lazy(
  () => import("../accounts/organization/LedgerDetail"),
);
const Voucher = lazy(() => import("../accounts/organization/Voucher"));
const DailyBook = lazy(() => import("../accounts/organization/DailyBook"));
const BankStatement = lazy(
  () => import("../accounts/organization/BankStatement"),
);
const PaymentRegister = lazy(
  () => import("../accounts/organization/PaymentRegister"),
);
const AllInvoice = lazy(() => import("../accounts/organization/AllInvoice"));
const PurchaseInvoices = lazy(
  () => import("../accounts/organization/PurchaseInvoices"),
);
const Unbill = lazy(() => import("../accounts/organization/Unbill"));
const ProfitLoss = lazy(() => import("../accounts/organization/ProfitLoss"));
const CashFlow = lazy(() => import("../accounts/organization/CashFlow"));
const BalanceSheet = lazy(
  () => import("../accounts/organization/BalanceSheet"),
);
const TDS = lazy(() => import("../accounts/organization/TDS"));
const LedgerType = lazy(
  () => import("../accounts/organization/settings/LedgerType"),
);
const VoucherType = lazy(
  () => import("../accounts/organization/settings/VoucherType"),
);
const Statutory = lazy(
  () => import("../accounts/organization/settings/Statutory"),
);
const OrganizationEstimate = lazy(
  () => import("../accounts/organization/OrganizationEstimate"),
);
const VendorPayments = lazy(() => import("../accounts/VendorPayments"));
const VendorPaymentHistory = lazy(
  () => import("../vendor-request/VendorPaymentHistory"),
);
const GST = lazy(() => import("../accounts/organization/GST"));
const TrailBalance = lazy(
  () => import("../accounts/organization/TrailBalance"),
);
const SalesReport = lazy(() => import("../accounts/organization/SalesReport"));
const CompanyUnitsInAccount = lazy(
  () => import("../accounts/CompanyUnitsInAccount"),
);
const Expense = lazy(() => import("../accounts/Expense"));
const Taxation = lazy(() => import("../accounts/organization/Taxation"));
const CreditNote = lazy(() => import("../accounts/CreditNote"));
const DebitNotes = lazy(() => import("../accounts/organization/DebitNotes"));
const ProcurementPaymentRequest = lazy(
  () => import("../accounts/ProcurementPaymentRequest"),
);
const PurchaseOrder = lazy(() => import("../accounts/PurchaseOrder"));
const InvoicesByUnbilled = lazy(
  () => import("../accounts/organization/InvoicesByUnbilled"),
);
const Ledger = lazy(() => import("../accounts/ledgers/Ledger"));
const LedgerEntriesPage = lazy(
  () => import("../accounts/ledgers/LedgerEntriesPage"),
);
const VendorDetails = lazy(
  () => import("../accounts/vendorDetails/VendorDetails"),
);
const AdvanceInvoices = lazy(() => import("../accounts/AdvanceInvoices"));
const VendorRestrictions = lazy(() => import("../accounts/VendorRestrictions"));

export const AccountsModuleRouting = () => {
  return (
    <>
      <Route path="accounts/companyApprovals" element={<CompanyApprovals />} />
      <Route path="accounts/expensesApprovals" element={<Expense />} />
      <Route
        path="accounts/companyApprovals/:companyId/units"
        element={<CompanyUnitsInAccount />}
      />
      <Route path="accounts/vendorDetails" element={<VendorDetails />} />
      <Route path="accounts/creditNote" element={<CreditNote />} />
      <Route path="accounts/debitNote" element={<DebitNotes />} />
      <Route path="accounts/paymentApprovals" element={<PaymentApprovals />} />
      <Route path="accounts/companyForm" element={<CompanyForm />} />
      <Route path="accounts/orgEstimate" element={<OrganizationEstimate />} />
      <Route path="accounts/bankStatement" element={<BankStatement />} />
      <Route path="accounts/paymentRegister" element={<PaymentRegister />} />
      <Route path="accounts/allInvoice" element={<AllInvoice />} />
      <Route path="accounts/invoiceFeed" element={<InvoiceFeed />} />
      <Route path="accounts/purchaseInvoices" element={<PurchaseInvoices />} />
      <Route path="accounts/advanceInvoices" element={<AdvanceInvoices />} />
      <Route path="accounts/unbilled" element={<Unbill />} />
      <Route
        path="accounts/vendorRestrictions"
        element={<VendorRestrictions />}
      />
      <Route
        path="accounts/unbilled/:unbilledId/invoices"
        element={<InvoicesByUnbilled />}
      />
      <Route path="accounts/taxation" element={<Taxation />} />
      <Route
        path="accounts/procurementPaymentRequests"
        element={<ProcurementPaymentRequest />}
      />
      <Route path="accounts/poPayments" element={<PurchaseOrder />} />
      <Route path="accounts/vendorsPayment" element={<VendorPayments />} />
      <Route
        path="accounts/vendorsPayment/:paymentId/paymentHistory"
        element={<VendorPaymentHistory />}
      />

      <Route path="accounts/organizations" element={<Organizations />}>
        <Route index element={<OrganizationDetail />} />
        <Route path="group" element={<Group />} />
        <Route path="group/:groupId/groupLedger" element={<GroupLedger />} />
        <Route path="ledger" element={<Ledger />} />
        <Route
          path="ledger/:ledgerId/entries"
          element={<LedgerEntriesPage />}
        />
        <Route
          path="ledger/:ledgerId/ledgerDetail"
          element={<LedgerDetail />}
        />
        <Route path="voucher" element={<Voucher />} />
        <Route path="dayBook" element={<DailyBook />} />
        <Route path="profitLoss" element={<ProfitLoss />} />
        <Route path="cashflow" element={<CashFlow />} />
        <Route path="balanceSheet" element={<BalanceSheet />} />
        <Route path="trailBalance" element={<TrailBalance />} />
        <Route path="tds" element={<TDS />} />
        <Route path="gst" element={<GST />} />
        <Route path="salesReport" element={<SalesReport />} />
        <Route
          path="/erp/:userId/accounts/organizations/settings/groups"
          element={<LedgerType />}
        />
        <Route
          path="/erp/:userId/accounts/organizations/settings/voucherType"
          element={<VoucherType />}
        />
        <Route
          path="/erp/:userId/accounts/organizations/settings/statutory"
          element={<Statutory />}
        />
      </Route>
    </>
  );
};

export const accountLoginModuleRouting = () => {
  return (
    <>
      <Route
        path="accounts/organizations/detail"
        element={<OrganizationDetail />}
      />
      <Route path="accounts/organizations/group" element={<Group />} />
      <Route
        path="accounts/organizations/group/:groupId/groupLedger"
        element={<GroupLedger />}
      />
      <Route path="accounts/organizations/ledger" element={<Ledger />} />
      <Route path="ledger/:ledgerId/entries" element={<LedgerEntriesPage />} />
      <Route
        path="accounts/organizations/ledger/:ledgerId/ledgerDetail"
        element={<LedgerDetail />}
      />
      <Route path="accounts/organizations/voucher" element={<Voucher />} />
      {/* <Route
        path="accounts/organizations/orgEstimate"
        element={<OrganizationEstimate />}
      /> */}
      <Route path="accounts/organizations/dayBook" element={<DailyBook />} />
      {/* <Route
        path="accounts/organizations/bankStatement"
        element={<BankStatement />}
      />
      <Route
        path="accounts/organizations/paymentRegister"
        element={<PaymentRegister />}
      />
      <Route
        path="accounts/organizations/allInvoice"
        element={<AllInvoice />}
      />
      <Route path="accounts/organizations/unbilled" element={<Unbill />} /> */}
      <Route
        path="accounts/organizations/profitLoss"
        element={<ProfitLoss />}
      />
      <Route path="accounts/organizations/cashflow" element={<CashFlow />} />
      <Route
        path="accounts/organizations/balanceSheet"
        element={<BalanceSheet />}
      />
      <Route
        path="accounts/organizations/trailBalance"
        element={<TrailBalance />}
      />
      <Route path="accounts/organizations/tds" element={<TDS />} />
      <Route path="accounts/organizations/gst" element={<GST />} />
      <Route
        path="accounts/organizations/salesReport"
        element={<SalesReport />}
      />
      <Route path="accounts/settings/ledgerType" element={<LedgerType />} />
      <Route path="accounts/settings/voucherType" element={<VoucherType />} />
      <Route path="accounts/settings/statutory" element={<Statutory />} />
    </>
  );
};
