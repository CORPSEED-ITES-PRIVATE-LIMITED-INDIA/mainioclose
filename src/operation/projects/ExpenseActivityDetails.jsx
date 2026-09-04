import { Chip } from "@heroui/react";
import { ArrowRightLeft, Building2, ExternalLink, Landmark } from "lucide-react";
import {
  formatDateTime,
  formatEnumLabel,
  formatMoney,
  getApprovalChipColor,
  getPaymentChipColor,
} from "./projectDetailsUtils";

const MiniDetail = ({ label, value }) => {
  if (value === null || value === undefined || value === "" || value === "-") {
    return null;
  }

  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-default-400">
        {label}
      </p>
      <p
        className="mt-0.5 truncate text-xs font-semibold text-foreground"
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
};

const AmountTile = ({ label, value, emphasize }) => (
  <div
    className={`rounded-lg border px-3 py-2 ${
      emphasize
        ? "border-primary-200 bg-primary-50"
        : "border-default-200 bg-content1"
    }`}
  >
    <p className="text-[10px] font-medium uppercase tracking-wide text-default-400">
      {label}
    </p>
    <p
      className={`mt-0.5 text-sm font-bold ${emphasize ? "text-primary" : "text-foreground"}`}
    >
      {value}
    </p>
  </div>
);

const ProofLink = ({ href, label }) => {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
};

// Renders the full structured breakdown for an EXPENSE activity's `details`
// payload (requested/approved/paid amounts, approval + payment statuses,
// and the client / government-fee / fund-transfer payment legs, whichever
// of those apply to this particular expense).
const ExpenseActivityDetails = ({ details }) => {
  const currency = details?.currencyCode || "INR";

  const hasClientPayment = Boolean(
    details?.clientPaymentMode ||
      details?.clientPaymentBankName ||
      details?.clientPaymentReference ||
      details?.clientPaymentProofUrl,
  );

  const hasGovernmentPayment = Boolean(
    details?.governmentPaymentMode ||
      details?.governmentPaymentAmount ||
      details?.governmentPaymentReference,
  );

  const hasFundTransfer = Boolean(
    details?.fundTransferFromBankName ||
      details?.fundTransferToBankName ||
      details?.fundTransferReference,
  );

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-default-200 bg-default-50/60 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <AmountTile
          label="Requested"
          value={formatMoney(details?.requestedAmount, currency)}
        />
        <AmountTile
          label="Approved"
          value={formatMoney(details?.approvedAmount, currency)}
        />
        <AmountTile
          label="Paid"
          value={formatMoney(details?.paidAmount, currency)}
          emphasize
        />
        <AmountTile
          label="Outstanding"
          value={formatMoney(details?.outstandingAmount, currency)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {details?.approvalStage && (
          <Chip
            size="sm"
            variant="flat"
            color={getApprovalChipColor(details.approvalStage)}
          >
            Stage: {formatEnumLabel(details.approvalStage)}
          </Chip>
        )}
        {details?.crtApprovalStatus && (
          <Chip
            size="sm"
            variant="flat"
            color={getApprovalChipColor(details.crtApprovalStatus)}
          >
            CRT: {formatEnumLabel(details.crtApprovalStatus)}
          </Chip>
        )}
        {details?.accountsApprovalStatus && (
          <Chip
            size="sm"
            variant="flat"
            color={getApprovalChipColor(details.accountsApprovalStatus)}
          >
            Accounts: {formatEnumLabel(details.accountsApprovalStatus)}
          </Chip>
        )}
        {details?.paymentStatus && (
          <Chip
            size="sm"
            variant="flat"
            color={getPaymentChipColor(details.paymentStatus)}
          >
            Payment: {formatEnumLabel(details.paymentStatus)}
          </Chip>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
        <MiniDetail
          label="Category"
          value={formatEnumLabel(details?.expenseCategory)}
        />
        <MiniDetail label="Department" value={details?.raisedDepartmentName} />
        <MiniDetail
          label="Paid By"
          value={formatEnumLabel(details?.expensePaidBy)}
        />
        <MiniDetail
          label="Expense Date"
          value={formatDateTime(details?.expenseDate)}
        />
        <MiniDetail label="Reference" value={details?.externalReference} />
        <MiniDetail label="Unbilled No." value={details?.unbilledNumber} />
      </div>

      {(details?.remark ||
        details?.crtDecisionRemark ||
        details?.accountsDecisionRemark) && (
        <div className="space-y-1 border-t border-default-200 pt-2">
          {details?.remark && (
            <p className="text-[11px] text-default-600">
              <span className="font-medium text-default-500">Remark: </span>
              {details.remark}
            </p>
          )}
          {details?.crtDecisionRemark && (
            <p className="text-[11px] text-default-600">
              <span className="font-medium text-default-500">CRT remark: </span>
              {details.crtDecisionRemark}
            </p>
          )}
          {details?.accountsDecisionRemark && (
            <p className="text-[11px] text-default-600">
              <span className="font-medium text-default-500">
                Accounts remark:{" "}
              </span>
              {details.accountsDecisionRemark}
            </p>
          )}
        </div>
      )}

      {hasClientPayment && (
        <div className="rounded-lg border border-default-200 bg-content1 p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-default-600">
            <Landmark className="h-3.5 w-3.5" /> Client Payment
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
            <MiniDetail
              label="Mode"
              value={formatEnumLabel(details?.clientPaymentMode)}
            />
            <MiniDetail label="Bank" value={details?.clientPaymentBankName} />
            <MiniDetail
              label="Date"
              value={formatDateTime(details?.clientPaymentDate)}
            />
            <MiniDetail
              label="Reference"
              value={details?.clientPaymentReference}
            />
          </div>

          <ProofLink href={details?.clientPaymentProofUrl} label="View proof" />
        </div>
      )}

      {hasGovernmentPayment && (
        <div className="rounded-lg border border-default-200 bg-content1 p-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-default-600">
              <Building2 className="h-3.5 w-3.5" /> Government Fee Payment
            </div>

            {details?.governmentPaymentVerificationStatus && (
              <Chip
                size="sm"
                variant="flat"
                color={getApprovalChipColor(
                  details.governmentPaymentVerificationStatus,
                )}
              >
                {formatEnumLabel(details.governmentPaymentVerificationStatus)}
              </Chip>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
            <MiniDetail
              label="Mode"
              value={formatEnumLabel(details?.governmentPaymentMode)}
            />
            <MiniDetail
              label="Amount"
              value={formatMoney(details?.governmentPaymentAmount, currency)}
            />
            <MiniDetail
              label="Date"
              value={formatDateTime(details?.governmentPaymentDate)}
            />
            <MiniDetail
              label="Reference"
              value={details?.governmentPaymentReference}
            />
            <MiniDetail label="Bank" value={details?.paymentBankName} />
          </div>

          {details?.governmentPaymentRemark && (
            <p className="mt-1.5 text-[11px] text-default-600">
              <span className="font-medium text-default-500">Remark: </span>
              {details.governmentPaymentRemark}
            </p>
          )}
          {details?.governmentPaymentVerificationRemark && (
            <p className="mt-1 text-[11px] text-default-600">
              <span className="font-medium text-default-500">
                Verification remark:{" "}
              </span>
              {details.governmentPaymentVerificationRemark}
            </p>
          )}

          <ProofLink
            href={details?.governmentPaymentReceiptUrl}
            label="View receipt"
          />
        </div>
      )}

      {hasFundTransfer && (
        <div className="rounded-lg border border-default-200 bg-content1 p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-default-600">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Fund Transfer
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-foreground">
            <span>{details?.fundTransferFromBankName || "-"}</span>
            <ArrowRightLeft className="h-3 w-3 shrink-0 text-default-400" />
            <span>{details?.fundTransferToBankName || "-"}</span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
            <MiniDetail
              label="Amount"
              value={formatMoney(details?.fundTransferAmount, currency)}
            />
            <MiniDetail
              label="Date"
              value={formatDateTime(details?.fundTransferDate)}
            />
            <MiniDetail
              label="Reference"
              value={details?.fundTransferReference}
            />
          </div>

          <ProofLink href={details?.fundTransferProofUrl} label="View proof" />
        </div>
      )}

      {(details?.attachmentUrl ||
        details?.accountVoucherNumber ||
        details?.fundTransferVoucherNumber ||
        details?.governmentPaymentVoucherNumber) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-default-200 pt-2">
          <ProofLink href={details?.attachmentUrl} label="View attachment" />

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-default-400">
            {details?.accountVoucherNumber && (
              <span>Voucher: {details.accountVoucherNumber}</span>
            )}
            {details?.fundTransferVoucherNumber && (
              <span>Transfer voucher: {details.fundTransferVoucherNumber}</span>
            )}
            {details?.governmentPaymentVoucherNumber && (
              <span>
                Payment voucher: {details.governmentPaymentVoucherNumber}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseActivityDetails;
