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
  BriefcaseBusiness,
  Building2,
  FileText,
  Package,
  ShieldCheck,
} from "lucide-react";
import { getTopSellingServicesDashboard } from "../../toolkit/slices/dashboardSlice";

const safeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatNumber = (value) => safeNumber(value).toLocaleString("en-IN");

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

function buildTopSellingServicesData(services = []) {
  const iconConfig = [
    { icon: FileText, bg: "bg-blue-50", color: "text-blue-600" },
    { icon: ShieldCheck, bg: "bg-green-50", color: "text-green-600" },
    { icon: BriefcaseBusiness, bg: "bg-orange-50", color: "text-orange-500" },
    { icon: Building2, bg: "bg-blue-50", color: "text-blue-600" },
    { icon: Package, bg: "bg-purple-50", color: "text-purple-600" },
  ];

  return (Array.isArray(services) ? services : []).map((item, index) => {
    const style = iconConfig[index % iconConfig.length];

    return {
      id: item?.solutionId ?? item?.solutionName ?? index,
      service: item?.solutionName || "Unknown Service",
      leads: `${formatNumber(item?.leadCount)} Leads`,
      amount: `₹ ${formatNumber(item?.totalRevenue)}`,
      invoiceCount: safeNumber(item?.invoiceCount),
      ...style,
    };
  });
}

function TopSellingServiceRows({ services = [], loading = false }) {
  const list = buildTopSellingServicesData(services);

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        Loading top selling services...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-xs font-medium text-slate-500">
        No top selling services found.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {list.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-xl px-2 py-3 hover:bg-slate-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon size={20} className={item.color} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-950">
                  {item.service}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  {formatNumber(item.invoiceCount)} invoices
                </p>
              </div>
            </div>

            <div className="flex min-w-[150px] shrink-0 items-center justify-between gap-5 text-xs">
              <span className="text-slate-500">{item.leads}</span>

              <span className="font-semibold text-slate-950">
                {item.amount}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TopSellingServices({
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

  const [cardServices, setCardServices] = useState([]);
  const [drawerServices, setDrawerServices] = useState([]);

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

  const fetchTopSellingServices = async ({
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
        getTopSellingServicesDashboard(payload),
      ).unwrap();

      const services = response?.topSellingServices || [];

      if (target === "drawer") {
        setDrawerServices(services);
      } else {
        setCardServices(services);
      }
    } catch (error) {
      if (target === "drawer") {
        setDrawerServices([]);
        setDrawerError("Unable to load top selling services.");
      } else {
        setCardServices([]);
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
    fetchTopSellingServices({
      limit: cardLimit,
      target: "card",
      requestFromDate: fromDate,
      requestToDate: toDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, period, fromDate, toDate, fetchTrigger]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);

    fetchTopSellingServices({
      limit: limitInput,
      target: "drawer",
      requestFromDate: drawerFromDate,
      requestToDate: drawerToDate,
    });
  };

  const handleApplyDrawerFilter = () => {
    fetchTopSellingServices({
      limit: limitInput,
      target: "drawer",
      requestFromDate: drawerFromDate,
      requestToDate: drawerToDate,
    });
  };

  return (
    <>
      <Card className="border border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="px-3 pt-3 pb-0">
          <SectionTitle
            title="Top Selling Services"
            subtitle="This Month"
            onViewAll={handleOpenDrawer}
          />
        </CardHeader>

        <CardBody className="px-3 pb-3">
          <TopSellingServiceRows
            services={cardServices}
            loading={cardLoading}
          />
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
                    Top Selling Services
                  </h3>

                  <p className="mt-1 text-xs font-normal text-slate-500">
                    View top services by generated invoices and revenue.
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
                  <TopSellingServiceRows
                    services={drawerServices}
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
