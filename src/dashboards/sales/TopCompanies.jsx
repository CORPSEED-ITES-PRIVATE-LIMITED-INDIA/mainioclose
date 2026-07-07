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
import { Building2 } from "lucide-react";
import { getTopCompaniesDashboard } from "../../toolkit/slices/dashboardSlice";

const safeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatNumber = (value) => safeNumber(value).toLocaleString("en-IN");

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

function buildTopCompaniesData(companies = []) {
  return (Array.isArray(companies) ? companies : []).map((item, index) => ({
    id: item?.companyId ?? item?.companyName ?? index,
    companyName: item?.companyName || "Unknown Company",
    totalRevenue: safeNumber(item?.totalRevenue),
    invoiceCount: safeNumber(item?.invoiceCount),
  }));
}

function TopCompanyRows({ companies = [], loading = false }) {
  const list = buildTopCompaniesData(companies);

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        Loading top companies...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-xs font-medium text-slate-500">
        No top companies found.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {list.map((company) => (
        <div
          key={company.id}
          className="flex items-center justify-between gap-4 rounded-lg py-3 hover:bg-slate-50"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Building2 size={18} className="text-blue-600" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-900">
                {company.companyName}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                {formatNumber(company.invoiceCount)} invoices
              </p>
            </div>
          </div>

          <p className="shrink-0 text-xs font-semibold text-slate-950">
            {formatCurrencyCompact(company.totalRevenue)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function TopCompanies({
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

  const [cardCompanies, setCardCompanies] = useState([]);
  const [drawerCompanies, setDrawerCompanies] = useState([]);

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

  const fetchTopCompanies = async ({
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
        getTopCompaniesDashboard(payload),
      ).unwrap();

      const companies = response?.topCompanies || [];

      if (target === "drawer") {
        setDrawerCompanies(companies);
      } else {
        setCardCompanies(companies);
      }
    } catch (error) {
      if (target === "drawer") {
        setDrawerCompanies([]);
        setDrawerError("Unable to load top companies.");
      } else {
        setCardCompanies([]);
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
    fetchTopCompanies({
      limit: cardLimit,
      target: "card",
      requestFromDate: fromDate,
      requestToDate: toDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, period, fromDate, toDate, fetchTrigger]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);

    fetchTopCompanies({
      limit: limitInput,
      target: "drawer",
      requestFromDate: drawerFromDate,
      requestToDate: drawerToDate,
    });
  };

  const handleApplyDrawerFilter = () => {
    fetchTopCompanies({
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
            title="Top Companies"
            subtitle="Generated invoice revenue"
            onViewAll={handleOpenDrawer}
          />
        </CardHeader>

        <CardBody className="px-3 pb-3">
          <TopCompanyRows companies={cardCompanies} loading={cardLoading} />
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
                    Top Companies
                  </h3>
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    View top companies by generated invoice revenue.
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
                  <TopCompanyRows
                    companies={drawerCompanies}
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
