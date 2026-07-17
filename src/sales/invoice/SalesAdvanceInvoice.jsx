import React, { useEffect, useMemo, useState } from "react";

import { Chip, Pagination, Spinner } from "@heroui/react";

import { ChevronDown, Search } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { getAllAdvanceTaxInvoiceRequests } from "../../toolkit/slices/accountSlice";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const getLoggedInUserId = () => {
  try {
    const keys = ["user", "authUser", "loggedInUser", "userInfo"];

    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      const parsed = JSON.parse(value);

      const id =
        parsed?.id ||
        parsed?.userId ||
        parsed?.data?.id ||
        parsed?.payload?.id ||
        parsed?.user?.id;

      if (id) {
        return Number(id);
      }
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
};

const getPaymentStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return "success";

    case "PARTIALLY_PAID":
      return "warning";

    case "UNPAID":
      return "danger";

    default:
      return "default";
  }
};

const formatStatus = (status) => {
  return String(status || "-").replaceAll("_", " ");
};

const SalesAdvanceInvoice = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const {
    allAdvanceTaxInvoiceRequests,
    advanceTaxInvoiceRequestsLoading,
    advanceTaxInvoiceRequestsError,
  } = useSelector((state) => state.account || {});

  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const userId = useMemo(() => {
    return Number(params?.userId || params?.id || getLoggedInUserId());
  }, [params?.userId, params?.id]);

  const response = allAdvanceTaxInvoiceRequests || {};

  const requests = Array.isArray(response?.content) ? response.content : [];

  const totalElements = Number(response?.totalElements || 0);

  const totalPages = Math.max(Number(response?.totalPages || 0), 1);

  useEffect(() => {
    if (!userId) return;

    dispatch(
      getAllAdvanceTaxInvoiceRequests({
        userId,
        status,
        page: page - 1,
        size,
      }),
    );
  }, [dispatch, userId, status, page, size]);

  const filteredRequests = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return requests;
    }

    return requests.filter((item) => {
      const values = [
        item?.requestId,
        item?.publicUuid,
        item?.estimateNumber,
        item?.requestedByName,
        item?.invoiceNumber,
        item?.requestStatus,
        item?.invoicePaymentStatus,
        item?.reviewedByName,
        item?.message,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText),
      );
    });
  }, [requests, search]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleSizeChange = (event) => {
    setSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <div className="h-full min-h-[calc(100vh-76px)] bg-slate-50 p-3">
      <h1 className="mb-3 text-xl font-semibold text-slate-900">
        Advance Tax Invoice Requests
      </h1>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search estimate, invoice, requester..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={status}
              onChange={handleStatusChange}
              className="h-10 min-w-[165px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-xs font-medium outline-none"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          <select
            value={size}
            onChange={handleSizeChange}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item} rows
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">Total {totalElements} requests</p>

        <p className="text-xs text-slate-500">Rows per page: {size}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1850px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Date
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Request ID
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Estimate Number
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Requested By
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Estimate Total
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Requested Amount
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Approved Amount
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Request Status
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Invoice Number
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Invoice Total
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Received
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Pending Received
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Available Outstanding
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">
                  Outstanding
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Payment Status
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Reviewed By
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Reviewed At
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">
                  Message
                </th>
              </tr>
            </thead>

            <tbody>
              {advanceTaxInvoiceRequestsLoading ? (
                <tr>
                  <td colSpan={18} className="h-44 text-center">
                    <div className="flex items-center justify-center">
                      <Spinner
                        size="sm"
                        label="Loading advance tax invoice requests..."
                      />
                    </div>
                  </td>
                </tr>
              ) : advanceTaxInvoiceRequestsError ? (
                <tr>
                  <td
                    colSpan={18}
                    className="h-44 px-4 text-center text-sm text-danger"
                  >
                    {String(advanceTaxInvoiceRequestsError)}
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={18}
                    className="h-44 text-center text-sm text-slate-500"
                  >
                    No advance tax invoice requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr
                    key={item?.requestId || item?.publicUuid}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <p className="text-xs font-medium text-slate-900">
                        {formatDate(item?.createdAt)}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {formatDateTime(item?.createdAt)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <p className="text-xs font-semibold text-slate-900">
                        {item?.requestId ?? "-"}
                      </p>

                      <p
                        title={item?.publicUuid}
                        className="mt-1 max-w-[145px] truncate text-[10px] text-slate-500"
                      >
                        {item?.publicUuid || "-"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <p className="text-xs font-semibold text-blue-600">
                        {item?.estimateNumber || "-"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <p className="text-xs font-medium text-slate-900">
                        {item?.requestedByName || "-"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-semibold">
                      {formatAmount(item?.estimateGrandTotal)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-bold">
                      {formatAmount(item?.requestedAmount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-bold text-emerald-700">
                      {formatAmount(item?.approvedAmount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <Chip
                        size="sm"
                        color={getStatusColor(item?.requestStatus)}
                        variant="flat"
                      >
                        {item?.requestStatus || "-"}
                      </Chip>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <p className="text-xs font-semibold text-blue-600">
                        {item?.invoiceNumber || "-"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-semibold">
                      {formatAmount(item?.invoiceGrandTotal)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-semibold text-emerald-700">
                      {formatAmount(item?.receivedAmount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-semibold text-amber-700">
                      {formatAmount(item?.pendingReceivedAmount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-semibold">
                      {formatAmount(item?.availableOutstandingAmount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top text-xs font-semibold text-rose-600">
                      {formatAmount(item?.outstandingAmount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <Chip
                        size="sm"
                        color={getPaymentStatusColor(
                          item?.invoicePaymentStatus,
                        )}
                        variant="flat"
                      >
                        {formatStatus(item?.invoicePaymentStatus)}
                      </Chip>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top text-xs">
                      {item?.reviewedByName || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top text-xs">
                      {formatDateTime(item?.reviewedAt)}
                    </td>

                    <td className="max-w-[250px] px-4 py-3 align-top">
                      <p
                        title={item?.message}
                        className="line-clamp-2 text-xs text-slate-700"
                      >
                        {item?.message || "-"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalElements > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">
              Showing {Math.min((page - 1) * size + 1, totalElements)} to{" "}
              {Math.min(page * size, totalElements)} of {totalElements}
            </p>

            <Pagination
              page={page}
              total={totalPages}
              onChange={setPage}
              showControls
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAdvanceInvoice;
