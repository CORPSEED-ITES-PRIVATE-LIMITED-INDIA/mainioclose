import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
} from "@heroui/react";
import {
  Building2,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getTopConvertedLeadsDashboard } from "../../toolkit/slices/dashboardSlice";

const safeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatNumber = (value) => safeNumber(value).toLocaleString("en-IN");

const formatCurrency = (value) => `₹ ${formatNumber(value)}`;

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function SectionTitle({ title, subtitle, onViewAll }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-semibold text-slate-950">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-0.5 text-[10px] text-slate-500">{subtitle}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="shrink-0 text-[10px] font-medium text-blue-600 hover:text-blue-700"
      >
        View All
      </button>
    </div>
  );
}

function buildTopConvertedLeadsData(leads = []) {
  const iconConfig = [
    { icon: Users, bg: "bg-green-50", color: "text-green-600" },
    { icon: Building2, bg: "bg-blue-50", color: "text-blue-600" },
    { icon: ShieldCheck, bg: "bg-orange-50", color: "text-orange-500" },
    { icon: ClipboardCheck, bg: "bg-teal-50", color: "text-teal-600" },
    { icon: FileText, bg: "bg-yellow-50", color: "text-yellow-600" },
  ];

  return (Array.isArray(leads) ? leads : []).map((item, index) => {
    const style = iconConfig[index % iconConfig.length];

    return {
      id: item?.invoiceId ?? item?.invoiceNumber ?? index,
      company: item?.companyName || "Unknown Company",
      unitName: item?.unitName || "",
      service: item?.solutionName || "Unknown Service",
      amount: formatCurrency(item?.invoiceValue),
      date: formatDisplayDate(item?.invoiceDate),
      invoiceNumber: item?.invoiceNumber || "-",
      leadId: item?.leadId || "-",
      invoiceValue: safeNumber(item?.invoiceValue),
      ...style,
    };
  });
}

function TopConvertedLeadRows({ leads = [], loading = false }) {
  const list = buildTopConvertedLeadsData(leads);

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        Loading top converted leads...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-xs font-medium text-slate-500">
        No top converted leads found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((lead, index) => {
        const Icon = lead.icon;

        return (
          <div
            key={lead.id}
            className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-xl py-2.5 sm:grid-cols-[28px_minmax(0,1fr)_auto] xl:grid-cols-[28px_minmax(0,1fr)_auto_auto] xl:items-center"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {index + 1}
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${lead.bg}`}
              >
                <Icon size={16} className={lead.color} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-950">
                  {lead.company}
                </p>

                <p className="truncate text-[11px] text-slate-500">
                  {lead.service}
                </p>

                <p className="truncate text-[10px] text-slate-400">
                  {lead.invoiceNumber}
                </p>
              </div>
            </div>

            <p className="col-start-2 whitespace-nowrap text-xs font-semibold text-slate-950 sm:col-start-auto">
              {lead.amount}
            </p>

            <p className="col-start-2 whitespace-nowrap text-[11px] font-medium text-green-600 xl:col-start-auto">
              {lead.date}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function TopConvertedLeads({
  userId,
  period,
  fromDate,
  toDate,
  cardLimit = 5,
  fetchTrigger = 0,
}) {
  const dispatch = useDispatch();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [limitInput, setLimitInput] = useState(String(cardLimit));
  const [drawerFromDate, setDrawerFromDate] = useState(fromDate || "");
  const [drawerToDate, setDrawerToDate] = useState(toDate || "");

  const [cardLeads, setCardLeads] = useState([]);
  const [drawerLeads, setDrawerLeads] = useState([]);

  const [cardLoading, setCardLoading] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");

  const cardRequestPayload = useMemo(
    () => ({
      userId,
      period,
      fromDate,
      toDate,
    }),
    [userId, period, fromDate, toDate],
  );

  useEffect(() => {
    setDrawerFromDate(fromDate || "");
    setDrawerToDate(toDate || "");
  }, [fromDate, toDate]);

  const fetchTopConvertedLeads = async ({
    limit,
    target,
    requestFromDate,
    requestToDate,
  }) => {
    if (!userId) return;

    const safeLimit = Math.max(1, safeNumber(limit) || cardLimit);

    if (
      requestFromDate &&
      requestToDate &&
      new Date(requestFromDate) > new Date(requestToDate)
    ) {
      setDrawerError("From Date cannot be greater than To Date.");
      return;
    }

    setDrawerError("");

    if (target === "drawer") {
      setDrawerLoading(true);
    } else {
      setCardLoading(true);
    }

    try {
      const payload =
        target === "drawer"
          ? {
              userId,
              period,
              fromDate: requestFromDate,
              toDate: requestToDate,
              limit: safeLimit,
            }
          : {
              ...cardRequestPayload,
              limit: safeLimit,
            };

      const response = await dispatch(
        getTopConvertedLeadsDashboard(payload),
      ).unwrap();

      const leads = response?.topConvertedLeads || [];

      if (target === "drawer") {
        setDrawerLeads(leads);
      } else {
        setCardLeads(leads);
      }
    } catch (error) {
      if (target === "drawer") {
        setDrawerLeads([]);
        setDrawerError("Unable to load top converted leads.");
      } else {
        setCardLeads([]);
      }
    } finally {
      if (target === "drawer") {
        setDrawerLoading(false);
      } else {
        setCardLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTopConvertedLeads({
      limit: cardLimit,
      target: "card",
      requestFromDate: fromDate,
      requestToDate: toDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, period, fromDate, toDate, fetchTrigger]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);

    fetchTopConvertedLeads({
      limit: limitInput,
      target: "drawer",
      requestFromDate: drawerFromDate,
      requestToDate: drawerToDate,
    });
  };

  const handleApplyDrawerFilter = () => {
    fetchTopConvertedLeads({
      limit: limitInput,
      target: "drawer",
      requestFromDate: drawerFromDate,
      requestToDate: drawerToDate,
    });
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="px-3 pt-3 pb-0">
          <SectionTitle
            title="Top Converted Leads"
            subtitle="Highest invoice value"
            onViewAll={handleOpenDrawer}
          />
        </CardHeader>

        <CardBody className="px-3 pb-3">
          <TopConvertedLeadRows leads={cardLeads} loading={cardLoading} />
        </CardBody>
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        placement="right"
        size="2xl"
        classNames={{
          base: "w-full max-w-[820px]",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="border-b border-slate-100">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    Top Converted Leads
                  </h3>

                  <p className="mt-1 text-xs font-normal text-slate-500">
                    View top converted leads by highest invoice value.
                  </p>
                </div>
              </DrawerHeader>

              <DrawerBody className="px-5 py-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_120px_120px] md:items-end">
                    <Input
                      type="date"
                      label="From Date"
                      labelPlacement="outside"
                      size="sm"
                      value={drawerFromDate}
                      onValueChange={setDrawerFromDate}
                      classNames={{
                        label: "text-[11px] font-medium text-slate-600",
                        inputWrapper:
                          "h-10 rounded-lg border border-slate-200 bg-white shadow-none",
                      }}
                    />

                    <Input
                      type="date"
                      label="To Date"
                      labelPlacement="outside"
                      size="sm"
                      value={drawerToDate}
                      min={drawerFromDate || undefined}
                      onValueChange={setDrawerToDate}
                      classNames={{
                        label: "text-[11px] font-medium text-slate-600",
                        inputWrapper:
                          "h-10 rounded-lg border border-slate-200 bg-white shadow-none",
                      }}
                    />

                    <Input
                      type="number"
                      min={1}
                      label="Limit"
                      labelPlacement="outside"
                      size="sm"
                      value={limitInput}
                      onValueChange={setLimitInput}
                      classNames={{
                        label: "text-[11px] font-medium text-slate-600",
                        inputWrapper:
                          "h-10 rounded-lg border border-slate-200 bg-white shadow-none",
                      }}
                    />

                    <Button
                      color="primary"
                      className="h-10 rounded-lg text-xs font-semibold"
                      isLoading={drawerLoading}
                      onPress={handleApplyDrawerFilter}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {drawerError && (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {drawerError}
                  </p>
                )}

                <div className="mt-1 rounded-xl border border-slate-100 bg-white p-2">
                  <TopConvertedLeadRows
                    leads={drawerLeads}
                    loading={drawerLoading}
                  />
                </div>
              </DrawerBody>

              <DrawerFooter className="border-t border-slate-100">
                <Button
                  variant="light"
                  className="text-xs font-semibold"
                  onPress={onClose}
                >
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
