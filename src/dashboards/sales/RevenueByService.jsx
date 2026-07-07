import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  Progress,
} from "@heroui/react";
import { FileText } from "lucide-react";
import { getRevenueByServiceDashboard } from "../../toolkit/slices/dashboardSlice";

const safeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatNumber = (value) => safeNumber(value).toLocaleString("en-IN");

const formatPercentage = (value) => {
  const numberValue = safeNumber(value);
  return `${Number.isInteger(numberValue) ? numberValue : numberValue.toFixed(2)}%`;
};

const formatCurrencyCompact = (value) => {
  const numberValue = safeNumber(value);

  if (numberValue >= 10000000) {
    const valueInCr = numberValue / 10000000;
    return `₹ ${Number.isInteger(valueInCr) ? valueInCr : valueInCr.toFixed(1)}Cr`;
  }

  if (numberValue >= 100000) {
    const valueInLakh = numberValue / 100000;
    return `₹ ${Number.isInteger(valueInLakh) ? valueInLakh : valueInLakh.toFixed(1)}L`;
  }

  if (numberValue >= 1000) {
    const valueInThousand = numberValue / 1000;
    return `₹ ${Number.isInteger(valueInThousand) ? valueInThousand : valueInThousand.toFixed(1)}K`;
  }

  return `₹ ${formatNumber(numberValue)}`;
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

function buildRevenueByServiceData(services = []) {
  return (Array.isArray(services) ? services : []).map((item, index) => ({
    id: item?.solutionId ?? item?.solutionName ?? index,
    service: item?.solutionName || "Unknown Service",
    amount: safeNumber(item?.revenue),
    invoiceCount: safeNumber(item?.invoiceCount),
    percentage: safeNumber(item?.percentage),
  }));
}

function RevenueByServiceRows({ services = [], loading = false }) {
  const list = buildRevenueByServiceData(services);

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        Loading revenue by service...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-xs font-medium text-slate-500">
        No revenue by service found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[minmax(105px,150px)_minmax(70px,1fr)_auto] items-center gap-3"
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900">
              {item.service}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {formatNumber(item.invoiceCount)} invoices
            </p>
          </div>

          <Progress
            aria-label={item.service}
            value={safeNumber(item.percentage)}
            color="primary"
            size="sm"
            radius="full"
            classNames={{
              track: "bg-slate-100",
            }}
          />

          <div className="text-right">
            <p className="whitespace-nowrap text-xs font-semibold text-slate-950">
              {formatCurrencyCompact(item.amount)}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {formatPercentage(item.percentage)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RevenueByService({
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

  const totalRevenue = useMemo(() => {
    return buildRevenueByServiceData(cardServices).reduce(
      (total, item) => total + safeNumber(item.amount),
      0,
    );
  }, [cardServices]);

  useEffect(() => {
    setDrawerFromDate(fromDate || "");
    setDrawerToDate(toDate || "");
  }, [fromDate, toDate]);

  const fetchRevenueByService = async ({
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
        getRevenueByServiceDashboard(payload),
      ).unwrap();

      const services = response?.revenueByServices || [];

      if (target === "drawer") {
        setDrawerServices(services);
      } else {
        setCardServices(services);
      }
    } catch (error) {
      if (target === "drawer") {
        setDrawerServices([]);
        setDrawerError("Unable to load revenue by service.");
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
    fetchRevenueByService({
      limit: cardLimit,
      target: "card",
      requestFromDate: fromDate,
      requestToDate: toDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, period, fromDate, toDate, fetchTrigger]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);

    fetchRevenueByService({
      limit: limitInput,
      target: "drawer",
      requestFromDate: drawerFromDate,
      requestToDate: drawerToDate,
    });
  };

  const handleApplyDrawerFilter = () => {
    fetchRevenueByService({
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
          <div className="flex w-full items-center justify-between gap-3">
            <SectionTitle
              title="Revenue by Service"
              subtitle="This Month"
              onViewAll={handleOpenDrawer}
            />

            <Chip size="sm" variant="flat" color="primary">
              {formatCurrencyCompact(totalRevenue)}
            </Chip>
          </div>
        </CardHeader>

        <CardBody className="px-3 pb-3">
          <RevenueByServiceRows services={cardServices} loading={cardLoading} />
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
                    Revenue by Service
                  </h3>
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    View revenue by service from generated invoices.
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

                <div className="mt-1 rounded-xl border border-slate-100 bg-white p-3">
                  <RevenueByServiceRows
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
