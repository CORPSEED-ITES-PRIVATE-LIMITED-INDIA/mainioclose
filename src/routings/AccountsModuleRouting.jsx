import { Route } from "react-router-dom";
import CompanyApprovals from "../accounts/CompanyApprovals";
import PaymentApprovals from "../accounts/PaymentApprovals";
import CompanyForm from "../accounts/CompanyForm";
import Organizations from "../accounts/organization/Organizations";
import OrganizationDetail from "../accounts/organization/OrganizationDetail";
import Group from "../accounts/organization/Group";
import GroupLedger from "../accounts/organization/GroupLedger";
import Ledger from "../accounts/organization/Ledger";
import LedgerDetail from "../accounts/organization/LedgerDetail";
import Voucher from "../accounts/organization/Voucher";
import DailyBook from "../accounts/organization/DailyBook";
import BankStatement from "../accounts/organization/BankStatement";
import PaymentRegister from "../accounts/organization/PaymentRegister";
import AllInvoice from "../accounts/organization/AllInvoice";
import Unbill from "../accounts/organization/Unbill";
import ProfitLoss from "../accounts/organization/ProfitLoss";
import CashFlow from "../accounts/organization/CashFlow";
import BalanceSheet from "../accounts/organization/BalanceSheet";
import TDS from "../accounts/organization/TDS";
import LedgerType from "../accounts/organization/settings/LedgerType";
import VoucherType from "../accounts/organization/settings/VoucherType";
import Statutory from "../accounts/organization/settings/Statutory";
import OrganizationEstimate from "../accounts/organization/OrganizationEstimate";
import VendorPayments from "../accounts/VendorPayments";

export const AccountsModuleRouting = () => {
  return (
    <>
      <Route path="accounts/companyApprovals" element={<CompanyApprovals />} />
      <Route path="accounts/paymentApprovals" element={<PaymentApprovals />} />
      <Route path="accounts/companyForm" element={<CompanyForm />} />
      <Route path="accounts/orgEstimate" element={<OrganizationEstimate />} />
      <Route path="accounts/bankStatement" element={<BankStatement />} />
      <Route path="accounts/paymentRegister" element={<PaymentRegister />} />
      <Route path="accounts/allInvoice" element={<AllInvoice />} />
      <Route path="accounts/unbilled" element={<Unbill />} />
      <Route path="accounts/vendor-payments" element={<VendorPayments />} />

      <Route path="accounts/organizations" element={<Organizations />}>
        <Route index element={<OrganizationDetail />} />
        <Route path="group" element={<Group />} />
        <Route path="group/:groupId/groupLedger" element={<GroupLedger />} />
        <Route path="ledger" element={<Ledger />} />
        <Route
          path="ledger/:ledgerId/ledgerDetail"
          element={<LedgerDetail />}
        />
        <Route path="voucher" element={<Voucher />} />
        <Route path="dayBook" element={<DailyBook />} />
        <Route path="profitLoss" element={<ProfitLoss />} />
        <Route path="cashflow" element={<CashFlow />} />
        <Route path="balanceSheet" element={<BalanceSheet />} />
        <Route path="tds" element={<TDS />} />
        <Route
          path="/erp/:userId/accounts/organizations/settings/ledgerType"
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
      <Route path="accounts/organizations/tds" element={<TDS />} />
      <Route path="accounts/settings/ledgerType" element={<LedgerType />} />
      <Route path="accounts/settings/voucherType" element={<VoucherType />} />
      <Route path="accounts/settings/statutory" element={<Statutory />} />
    </>
  );
};
