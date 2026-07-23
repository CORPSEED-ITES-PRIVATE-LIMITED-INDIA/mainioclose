import React, { useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider,
  Tooltip,
} from "@heroui/react";
import {
  BadgeIndianRupee,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  ShieldCheck,
  Trophy,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  CircleCheckBig,
} from "lucide-react";
import { getVendorsDashboardSummaryByProductId } from "../../toolkit/slices/vendorsSlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllVendorRFQs,
  getProcurementProcessFlow,
  getVendorAssignmentCount,
  getVendorQuotationResponseRate,
  getVendorVerificationRate,
} from "../../toolkit/slices/dashboardSlice";

const vendors = [
  {
    id: 1,
    rank: 1,
    vendorName: "Raj Traders",
    quotedPrice: 48000,
    gstPanVerified: true,
    quotationStatus: "RECEIVED",
    selectionStatus: "SELECTED",
    status: "ACTIVE",
  },
  {
    id: 2,
    rank: 2,
    vendorName: "Shayam Traders",
    quotedPrice: 50500,
    gstPanVerified: true,
    quotationStatus: "RECEIVED",
    selectionStatus: "-",
    status: "ACTIVE",
  },
  {
    id: 3,
    rank: 3,
    vendorName: "Balaji Compliance Services",
    quotedPrice: 52000,
    gstPanVerified: true,
    quotationStatus: "RECEIVED",
    selectionStatus: "-",
    status: "PROSPECTIVE",
  },
  {
    id: 4,
    rank: 4,
    vendorName: "Green EPR Solutions",
    quotedPrice: 55750,
    gstPanVerified: false,
    quotationStatus: "RECEIVED",
    selectionStatus: "-",
    status: "PROSPECTIVE",
  },
  {
    id: 5,
    rank: 5,
    vendorName: "Prime Regulatory Advisors",
    quotedPrice: 58200,
    gstPanVerified: false,
    quotationStatus: "RECEIVED",
    selectionStatus: "-",
    status: "PROSPECTIVE",
  },
  {
    id: 6,
    rank: 6,
    vendorName: "Balaji Traders",
    quotedPrice: 61000,
    gstPanVerified: false,
    quotationStatus: "PENDING",
    selectionStatus: "-",
    status: "ACTIVE",
  },
];

const rfqs = [
  {
    id: 3,
    rfqNo: "RFQ-2026-0003",
    title: "Vendor quotation for 12a Registration",
    deadline: "17-06-2026",
    startDate: "18-06-2026",
    vendorsInvited: 6,
    quotationsReceived: 3,
    status: "DRAFT",
    createdOn: "22-06-2026 03:28 PM",
    createdBy: 2,
  },
  {
    id: 1,
    rfqNo: "RFQ-2026-0001",
    title: "Compliance service RFQ",
    deadline: "17-06-2026",
    startDate: "16-06-2026",
    vendorsInvited: 6,
    quotationsReceived: 2,
    status: "DRAFT",
    createdOn: "22-06-2026 02:45 PM",
    createdBy: 2,
  },
];

const vendorAssignmentPaymentSummary = [
  {
    id: 1,
    vendorName: "Raj Traders",
    totalAssignments: 12,
    activeAssignments: 4,
    completedAssignments: 7,
    pendingAssignments: 1,
    totalPaymentGiven: 185000,
    pendingPayment: 42000,
  },
  {
    id: 2,
    vendorName: "Shayam Traders",
    totalAssignments: 8,
    activeAssignments: 3,
    completedAssignments: 4,
    pendingAssignments: 1,
    totalPaymentGiven: 126000,
    pendingPayment: 24000,
  },
  {
    id: 3,
    vendorName: "Balaji Compliance Services",
    totalAssignments: 5,
    activeAssignments: 2,
    completedAssignments: 2,
    pendingAssignments: 1,
    totalPaymentGiven: 84000,
    pendingPayment: 18000,
  },
  {
    id: 4,
    vendorName: "Green EPR Solutions",
    totalAssignments: 3,
    activeAssignments: 1,
    completedAssignments: 1,
    pendingAssignments: 1,
    totalPaymentGiven: 52000,
    pendingPayment: 12000,
  },
  {
    id: 5,
    vendorName: "Prime Regulatory Advisors",
    totalAssignments: 4,
    activeAssignments: 1,
    completedAssignments: 3,
    pendingAssignments: 0,
    totalPaymentGiven: 96000,
    pendingPayment: 0,
  },
  {
    id: 6,
    vendorName: "Balaji Traders",
    totalAssignments: 2,
    activeAssignments: 1,
    completedAssignments: 0,
    pendingAssignments: 1,
    totalPaymentGiven: 30000,
    pendingPayment: 31000,
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const compactAmount = (amount) => {
  if (!amount) return "0";
  if (amount >= 1000)
    return `${(amount / 1000).toFixed(amount % 1000 ? 1 : 0)}K`;
  return amount;
};

const rankColor = {
  1: "bg-warning-100 text-warning-700 border-warning-200",
  2: "bg-default-100 text-default-700 border-default-200",
  3: "bg-orange-100 text-orange-700 border-orange-200",
};

const KpiCard = ({ title, value, icon, iconClassName }) => {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
            >
              {icon}
            </div>

            <div>
              <p className="text-xs font-medium text-default-500">{title}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {value}
              </p>
            </div>
          </div>

          <Tooltip content={title}>
            <Info className="h-4 w-4 text-default-400" />
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  );
};

const NumberSummaryCard = ({ label, value, subLabel }) => {
  return (
    <Card className="border border-default-200 bg-content1 shadow-sm">
      <CardBody className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-default-400">
          {label}
        </p>

        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>

        {subLabel ? (
          <p className="mt-1 text-xs text-default-500">{subLabel}</p>
        ) : null}
      </CardBody>
    </Card>
  );
};

const ProcessStep = ({ number, title, description, active, completed }) => {
  return (
    <div className="relative flex min-w-[140px] flex-1 flex-col items-center text-center">
      <div
        className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm ${
          completed ? "bg-success" : active ? "bg-primary" : "bg-default-300"
        }`}
      >
        {number}
      </div>

      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-[150px] text-xs leading-5 text-default-500">
        {description}
      </p>
    </div>
  );
};

const InsightItem = ({ icon, title, description, iconClassName }) => {
  return (
    <div className="flex gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-default-500">{description}</p>
      </div>
    </div>
  );
};

const DonutChart = ({
  title,
  centerText,
  centerSubText,
  percentage,
  legends,
}) => {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="px-4 pb-0 pt-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </CardHeader>

      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#22c55e 0% ${percentage}%, #f97316 ${percentage}% 100%)`,
            }}
          >
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-content1 text-center">
              <p className="text-sm font-bold text-foreground">{centerText}</p>
              <p className="text-[11px] text-default-500">{centerSubText}</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            {legends.map((legend) => (
              <div key={legend.label} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${legend.color}`}
                />
                <span className="text-xs text-default-600">{legend.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getRfqStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "default";

    case "SENT":
      return "primary";

    case "QUOTATION_RECEIVED":
      return "secondary";

    case "PRICE_COMPARISON":
      return "warning";

    case "VENDOR_SELECTED":
    case "ONBOARDING_STARTED":
    case "COMPLETED":
      return "success";

    case "CANCELLED":
    case "REJECTED":
      return "danger";

    default:
      return "default";
  }
};

const formatStatus = (status) => {
  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const SolutionOverview = () => {
  const { userId, solutionId } = useParams();
  const dispatch = useDispatch();
  const vendorSummary = useSelector((state) => state.vendors.vendorSummary);
  const vendorWiseAssignmentCount = useSelector(
    (state) => state.dashboard.vendorWiseAssignmentCount,
  );
  const procurementProcessFlow = useSelector(
    (state) => state.dashboard.procurementProcessFlow,
  );
  const vendorRFQs = useSelector((state) => state.dashboard.vendorRFQs);
  const quotationResponseRate = useSelector(
    (state) => state.dashboard.quotationResponseRate,
  );
  const vendorVerificationRate = useSelector(
    (state) => state.dashboard.vendorVerificationRate,
  );

  const verifiedVendorCount = Number(vendorVerificationRate?.verified) || 0;

  const notVerifiedVendorCount =
    Number(vendorVerificationRate?.notVerified) || 0;

  const totalVerificationVendors = verifiedVendorCount + notVerifiedVendorCount;

  const vendorVerificationPercentage =
    totalVerificationVendors > 0
      ? (verifiedVendorCount / totalVerificationVendors) * 100
      : 0;

  const vendorNotVerifiedPercentage =
    totalVerificationVendors > 0
      ? (notVerifiedVendorCount / totalVerificationVendors) * 100
      : 0;

  const quotationTotalInvited =
    Number(quotationResponseRate?.totalInvited) || 0;

  const quotationResponded = Number(quotationResponseRate?.responded) || 0;

  const quotationPending = Number(quotationResponseRate?.pending) || 0;

  const quotationResponsePercentage = Math.min(
    Math.max(Number(quotationResponseRate?.responseRate) || 0, 0),
    100,
  );

  const quotationPendingPercentage =
    quotationTotalInvited > 0
      ? (quotationPending / quotationTotalInvited) * 100
      : 0;

  const sortedVendors = useMemo(() => {
    return [...vendors].sort((a, b) => a.quotedPrice - b.quotedPrice);
  }, []);

  const totalVendors = vendors.length;
  const verifiedVendors = vendors.filter(
    (vendor) => vendor.gstPanVerified,
  ).length;
  const quotationsReceived = vendors.filter(
    (vendor) => vendor.quotationStatus === "RECEIVED",
  ).length;

  const lowestQuote = sortedVendors[0]?.quotedPrice || 0;
  const highestQuote =
    sortedVendors[sortedVendors.length - 1]?.quotedPrice || 0;
  const selectedVendor =
    vendors.find((vendor) => vendor.selectionStatus === "SELECTED") || null;

  const maxPrice = Math.max(...vendors.map((vendor) => vendor.quotedPrice));

  useEffect(() => {
    dispatch(getVendorsDashboardSummaryByProductId(solutionId));
    dispatch(getVendorAssignmentCount({ solutionId }));
    dispatch(getProcurementProcessFlow({ solutionId }));
    dispatch(getAllVendorRFQs({ solutionId }));
    dispatch(getVendorQuotationResponseRate({ solutionId }));
    dispatch(getVendorVerificationRate({ solutionId }));
  }, [dispatch, solutionId]);

  console.log("RFQs", vendorRFQs);
  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
          <KpiCard
            title="Vendors Data"
            value={vendorSummary?.totalVendorCount}
            icon={<Users className="h-5 w-5" />}
            iconClassName="bg-primary-50 text-primary"
          />

          <KpiCard
            title="Verified Vendors"
            value={vendorSummary?.verifiedVendorCount}
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconClassName="bg-success-50 text-success"
          />

          <KpiCard
            title="Active Vendors"
            value={verifiedVendors}
            icon={<ShieldCheck className="h-5 w-5" />}
            iconClassName="bg-success-50 text-success"
          />

          <KpiCard
            title="Active RFQs"
            value={vendorSummary?.activeRfqCount}
            icon={<ClipboardList className="h-5 w-5" />}
            iconClassName="bg-secondary-50 text-secondary"
          />

          <KpiCard
            title="Quotations Received"
            value={vendorSummary?.quotationReceivedCount}
            icon={<FileText className="h-5 w-5" />}
            iconClassName="bg-warning-50 text-warning"
          />

          <KpiCard
            title="L1 Vendor"
            value={vendorSummary?.lowestFinalizedVendorName || "-"}
            icon={<Trophy className="h-5 w-5" />}
            iconClassName="bg-yellow-50 text-yellow-600"
          />

          <KpiCard
            title="Lowest Quote"
            value={formatCurrency(vendorSummary?.lowestFinalizedPrice || 0)}
            icon={<BadgeIndianRupee className="h-5 w-5" />}
            iconClassName="bg-teal-50 text-teal-600"
          />
        </div>
        {/* Vendor Assignment & Payment Summary */}
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-base font-semibold text-foreground">
                Vendor Assignment & Payment Summary
              </p>
              <p className="text-xs text-default-500">
                Vendor-wise assignment count and payment numbers
              </p>
            </div>

            <Chip size="sm" color="primary" variant="flat">
              Vendor Wise
            </Chip>
          </CardHeader>

          <Divider />

          <CardBody className="p-0">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead>
                  <tr className="border-b border-default-100 bg-default-50 text-xs uppercase text-default-500">
                    <th className="px-4 py-3 font-semibold">Vendor</th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Total Assignments
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Active
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Completed
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Pending
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Payment Given
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Pending Payment
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(vendorWiseAssignmentCount) &&
                  vendorWiseAssignmentCount.length > 0 ? (
                    vendorWiseAssignmentCount.map((vendor) => (
                      <tr
                        key={vendor.vendorId}
                        className="border-b border-default-100 last:border-b-0 hover:bg-default-50/70"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">
                            {vendor.vendorName || "-"}
                          </p>

                          <p className="text-xs text-default-500">
                            Vendor ID: {vendor.vendorId}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-semibold text-foreground">
                            {vendor.totalAssignmentCount ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-semibold text-primary">
                            {vendor.activeCount ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-semibold text-success">
                            {vendor.completedCount ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-semibold text-warning">
                            {vendor.pendingCount ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="text-base font-semibold text-default-400">
                            -
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="text-base font-semibold text-default-400">
                            -
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-default-500"
                      >
                        No vendor assignment data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        {/* Process Flow */}
        {/* Procurement Process Flow */}
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="flex items-center justify-between gap-3 px-4 pb-0 pt-4">
            <div>
              <p className="text-base font-semibold text-foreground">
                Procurement Process Flow
              </p>

              <p className="mt-1 text-xs text-default-500">
                Current procurement progress for this solution
              </p>
            </div>

            <Chip size="sm" color="primary" variant="flat">
              Product ID:{" "}
              {procurementProcessFlow?.productId ?? solutionId ?? "-"}
            </Chip>
          </CardHeader>

          <CardBody className="overflow-x-auto px-4 py-5">
            <div className="relative min-w-[900px]">
              <div className="absolute left-[70px] right-[70px] top-4 border-t border-dashed border-primary-300" />

              <div className="relative z-10 flex items-start justify-between">
                <ProcessStep
                  number="1"
                  title="Solutions / Services"
                  description="Service defined"
                  completed={Boolean(procurementProcessFlow?.productId)}
                />

                <ProcessStep
                  number="2"
                  title="Vendor Data"
                  description={`${
                    procurementProcessFlow?.registeredVendorCount ?? 0
                  } vendor${
                    (procurementProcessFlow?.registeredVendorCount ?? 0) === 1
                      ? ""
                      : "s"
                  } registered`}
                  completed={
                    (procurementProcessFlow?.registeredVendorCount ?? 0) > 0
                  }
                />

                <ProcessStep
                  number="3"
                  title="RFQ Raised"
                  description={`${
                    procurementProcessFlow?.activeRfqCount ?? 0
                  } active RFQ${
                    (procurementProcessFlow?.activeRfqCount ?? 0) === 1
                      ? ""
                      : "s"
                  }`}
                  completed={(procurementProcessFlow?.activeRfqCount ?? 0) > 0}
                />

                <ProcessStep
                  number="4"
                  title="Quotations Received"
                  description={`${
                    procurementProcessFlow?.quotationReceivedCount ?? 0
                  } quotation${
                    (procurementProcessFlow?.quotationReceivedCount ?? 0) === 1
                      ? ""
                      : "s"
                  } received`}
                  completed={
                    (procurementProcessFlow?.quotationReceivedCount ?? 0) > 0
                  }
                />

                <ProcessStep
                  number="5"
                  title="Price Comparison"
                  description={`${
                    procurementProcessFlow?.priceComparisonCount ?? 0
                  } comparison${
                    (procurementProcessFlow?.priceComparisonCount ?? 0) === 1
                      ? ""
                      : "s"
                  } completed`}
                  completed={
                    (procurementProcessFlow?.priceComparisonCount ?? 0) > 0
                  }
                  active={
                    (procurementProcessFlow?.quotationReceivedCount ?? 0) > 0 &&
                    (procurementProcessFlow?.priceComparisonCount ?? 0) === 0
                  }
                />

                <ProcessStep
                  number="6"
                  title="Vendor Selected"
                  description={`${
                    procurementProcessFlow?.vendorSelectedCount ?? 0
                  } vendor${
                    (procurementProcessFlow?.vendorSelectedCount ?? 0) === 1
                      ? ""
                      : "s"
                  } selected`}
                  completed={
                    (procurementProcessFlow?.vendorSelectedCount ?? 0) > 0
                  }
                  active={
                    (procurementProcessFlow?.priceComparisonCount ?? 0) > 0 &&
                    (procurementProcessFlow?.vendorSelectedCount ?? 0) === 0
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* Vendor Price Comparison */}
          <Card className="border border-default-200 shadow-sm xl:col-span-8">
            <CardHeader className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-base font-semibold text-foreground">
                  Vendor Price Comparison
                </p>
                <p className="text-xs text-default-500">
                  Vendors sorted by lowest quotation amount
                </p>
              </div>

              <Chip
                size="sm"
                variant="flat"
                color="primary"
                startContent={<TrendingUp className="h-3.5 w-3.5" />}
              >
                Sorted by Lowest Price
              </Chip>
            </CardHeader>

            <Divider />

            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-default-100 bg-default-50 text-xs uppercase text-default-500">
                      <th className="px-4 py-3 font-semibold">Rank</th>
                      <th className="px-4 py-3 font-semibold">Vendor Name</th>
                      <th className="px-4 py-3 font-semibold">Quoted Price</th>
                      <th className="px-4 py-3 font-semibold">GST / PAN</th>
                      <th className="px-4 py-3 font-semibold">Quote Status</th>
                      <th className="px-4 py-3 font-semibold">
                        Selection Status
                      </th>
                      <th className="px-4 py-3 font-semibold">Price Graph</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedVendors.map((vendor, index) => {
                      const barWidth = (vendor.quotedPrice / maxPrice) * 100;

                      return (
                        <tr
                          key={vendor.id}
                          className="border-b border-default-100 last:border-b-0 hover:bg-default-50/70"
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                                rankColor[vendor.rank] ||
                                "border-default-200 bg-default-100 text-default-600"
                              }`}
                            >
                              {vendor.rank}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-foreground">
                                {vendor.vendorName}
                              </p>
                              <p className="text-xs text-default-500">
                                {vendor.status}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-semibold text-foreground">
                            {formatCurrency(vendor.quotedPrice)}
                          </td>

                          <td className="px-4 py-3">
                            {vendor.gstPanVerified ? (
                              <Chip
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                }
                              >
                                Verified
                              </Chip>
                            ) : (
                              <Chip
                                size="sm"
                                color="warning"
                                variant="flat"
                                startContent={
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                }
                              >
                                Not Verified
                              </Chip>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <Chip
                              size="sm"
                              color={
                                vendor.quotationStatus === "RECEIVED"
                                  ? "success"
                                  : "warning"
                              }
                              variant="flat"
                            >
                              {vendor.quotationStatus}
                            </Chip>
                          </td>

                          <td className="px-4 py-3">
                            {vendor.selectionStatus === "SELECTED" ? (
                              <Chip
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={
                                  <CircleCheckBig className="h-3.5 w-3.5" />
                                }
                              >
                                Selected
                              </Chip>
                            ) : (
                              <span className="text-default-400">-</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-2.5 w-full max-w-[180px] overflow-hidden rounded-full bg-default-100">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                              <span className="w-12 text-xs font-medium text-default-500">
                                {compactAmount(vendor.quotedPrice)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-default-100 px-4 py-3 text-xs text-default-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  GST / PAN Verified
                </div>

                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Not Verified
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Insights */}
          <Card className="border border-default-200 shadow-sm xl:col-span-4">
            <CardHeader className="px-4 pb-0 pt-4">
              <p className="text-base font-semibold text-foreground">
                Procurement Insights
              </p>
            </CardHeader>

            <CardBody className="gap-5 p-4">
              <InsightItem
                icon={<CheckCircle2 className="h-5 w-5" />}
                iconClassName="bg-success-50 text-success"
                title="Best price received from Raj Traders"
                description={`Lowest quote of ${formatCurrency(lowestQuote)}`}
              />

              <InsightItem
                icon={<FileText className="h-5 w-5" />}
                iconClassName="bg-primary-50 text-primary"
                title={`${quotationResponded} of ${quotationTotalInvited} vendors submitted quotations`}
                description={`Response rate: ${quotationResponsePercentage.toFixed(2)}%`}
              />

              <InsightItem
                icon={<TrendingUp className="h-5 w-5" />}
                iconClassName="bg-secondary-50 text-secondary"
                title="Price spread between lowest and highest quote"
                description={`${formatCurrency(highestQuote)} - ${formatCurrency(
                  lowestQuote,
                )} = ${formatCurrency(highestQuote - lowestQuote)}`}
              />

              <InsightItem
                icon={
                  notVerifiedVendorCount > 0 ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )
                }
                iconClassName={
                  notVerifiedVendorCount > 0
                    ? "bg-warning-50 text-warning"
                    : "bg-success-50 text-success"
                }
                title={
                  notVerifiedVendorCount > 0
                    ? `${notVerifiedVendorCount} vendor${
                        notVerifiedVendorCount === 1 ? "" : "s"
                      } still not verified`
                    : "All vendors are verified"
                }
                description={
                  notVerifiedVendorCount > 0
                    ? "Complete verification before final approval"
                    : `${verifiedVendorCount} vendor${
                        verifiedVendorCount === 1 ? "" : "s"
                      } successfully verified`
                }
              />
            </CardBody>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* RFQ Snapshot */}
          {/* RFQ Snapshot */}
          <Card className="border border-default-200 shadow-sm xl:col-span-8">
            <CardHeader className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-base font-semibold text-foreground">
                  RFQ Snapshot
                </p>

                <p className="text-xs text-default-500">
                  Recent requests for quotation against this service
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Chip size="sm" color="primary" variant="flat">
                  {vendorRFQs.length} RFQs
                </Chip>

                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  endContent={<ArrowUpRight className="h-4 w-4" />}
                >
                  View All RFQs
                </Button>
              </div>
            </CardHeader>

            <Divider />

            <CardBody className="p-0">
              <div className="max-h-[320px] overflow-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-default-100 bg-default-50 text-xs uppercase text-default-500">
                      <th className="px-4 py-3 font-semibold">RFQ No.</th>

                      <th className="px-4 py-3 font-semibold">Title</th>

                      <th className="px-4 py-3 font-semibold">
                        Submission Deadline
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Vendors Invited
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Quotations Received
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Response Rate
                      </th>

                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.isArray(vendorRFQs) && vendorRFQs.length > 0 ? (
                      vendorRFQs.map((rfq) => {
                        const vendorsInvited = rfq.vendorsInvited ?? 0;
                        const quotationsReceived = rfq.quotationsReceived ?? 0;

                        const responseRate =
                          vendorsInvited > 0
                            ? Math.min(
                                (quotationsReceived / vendorsInvited) * 100,
                                100,
                              )
                            : 0;

                        return (
                          <tr
                            key={rfq.rfqId}
                            className="border-b border-default-100 last:border-b-0 hover:bg-default-50/70"
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-foreground">
                                {rfq.rfqNumber || "-"}
                              </p>

                              <p className="text-xs text-default-500">
                                ID: {rfq.rfqId ?? "-"}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <Tooltip content={rfq.title || "-"}>
                                <p className="max-w-[260px] truncate font-medium text-foreground">
                                  {rfq.title || "-"}
                                </p>
                              </Tooltip>
                            </td>

                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">
                                {formatDate(rfq.quotationSubmissionDeadline)}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span className="text-base font-semibold text-foreground">
                                {vendorsInvited}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span className="text-base font-semibold text-primary">
                                {quotationsReceived}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex min-w-[130px] items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-default-100">
                                  <div
                                    className="h-full rounded-full bg-success"
                                    style={{
                                      width: `${responseRate}%`,
                                    }}
                                  />
                                </div>

                                <span className="w-12 text-right text-xs font-semibold text-default-600">
                                  {responseRate.toFixed(0)}%
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <Chip
                                size="sm"
                                color={getRfqStatusColor(rfq.status)}
                                variant="flat"
                              >
                                {formatStatus(rfq.status)}
                              </Chip>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-sm text-default-500"
                        >
                          No RFQ data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Donuts */}
          <div className="grid grid-cols-1 gap-4 xl:col-span-4">
            <DonutChart
              title="Vendor Verification"
              centerText={`${verifiedVendorCount}/${totalVerificationVendors}`}
              centerSubText="Verified"
              percentage={vendorVerificationPercentage}
              legends={[
                {
                  label: `Verified ${verifiedVendorCount} (${vendorVerificationPercentage.toFixed(
                    2,
                  )}%)`,
                  color: "bg-success",
                },
                {
                  label: `Not Verified ${notVerifiedVendorCount} (${vendorNotVerifiedPercentage.toFixed(
                    2,
                  )}%)`,
                  color: "bg-warning",
                },
              ]}
            />

            <DonutChart
              title="Quotation Response Rate"
              centerText={`${quotationResponded}/${quotationTotalInvited}`}
              centerSubText="Responded"
              percentage={quotationResponsePercentage}
              legends={[
                {
                  label: `Responded ${quotationResponded} (${quotationResponsePercentage.toFixed(
                    2,
                  )}%)`,
                  color: "bg-success",
                },
                {
                  label: `Pending ${quotationPending} (${quotationPendingPercentage.toFixed(
                    2,
                  )}%)`,
                  color: "bg-warning",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionOverview;
