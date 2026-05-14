import React, { useEffect, useMemo } from "react";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import {
  getAllPaymentTermList,
  getSolutionDetailByName,
} from "../../toolkit/slices/settingSlice";
import { useDispatch, useSelector } from "react-redux";
import { getServicePaymentTermBasedOnMilestone } from "../../toolkit/slices/operationSlice";
import { Card, CardBody, Chip, Skeleton } from "@heroui/react";
import {
  BadgeIndianRupee,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Info,
  Layers,
  ReceiptText,
} from "lucide-react";

const paymentTypeIconMap = {
  FULL: BadgeIndianRupee,
  PARTIAL: CreditCard,
  INSTALLMENT: Layers,
  PURCHASE_ORDER: ReceiptText,
};

const paymentTypeColorMap = {
  FULL: "success",
  PARTIAL: "warning",
  INSTALLMENT: "primary",
  PURCHASE_ORDER: "secondary",
};

const ServicePaymentTerm = () => {
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();

  const serviceMilestone = useSelector(
    (state) => state.operation.servicePaymentTerm,
  );

  const paymentType = useSelector((state) => state.setting.paymentTermList);

  const loading = useSelector(
    (state) =>
      state.operation.servicePaymentTermLoading ||
      state.setting.paymentTermListLoading,
  );

  useEffect(() => {
    dispatch(getAllPaymentTermList());

    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        if (resp?.payload?.originalName) {
          dispatch(
            getSolutionDetailByName({
              name: resp?.payload?.originalName,
              userId,
            }),
          ).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
              dispatch(getServicePaymentTermBasedOnMilestone(res?.payload?.id));
            }
          });
        }
      }
    });
  }, [dispatch, leadId, userId]);

  const activePaymentTypes = useMemo(() => {
    return Array.isArray(paymentType)
      ? paymentType.filter((item) => item?.active)
      : [];
  }, [paymentType]);

  const milestoneList = useMemo(() => {
    return Array.isArray(serviceMilestone)
      ? [...serviceMilestone].sort(
          (a, b) => Number(a?.order || 0) - Number(b?.order || 0),
        )
      : [];
  }, [serviceMilestone]);

  const totalPaymentPercentage = useMemo(() => {
    return milestoneList.reduce(
      (sum, item) => sum + Number(item?.paymentPercentage || 0),
      0,
    );
  }, [milestoneList]);

  if (loading) {
    return (
      <div className="rounded-xl border border-default-200 bg-white p-4 shadow-sm">
        <Skeleton className="mb-3 h-5 w-40 rounded-lg" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-default-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-default-900">
            Payment Terms
          </h2>
          <p className="text-xs text-default-500">
            Quick reference for sales discussion
          </p>
        </div>

        {milestoneList.length > 0 && (
          <Chip size="sm" color="primary" variant="flat">
            Milestone Total: {totalPaymentPercentage}%
          </Chip>
        )}
      </div>

      <div className="space-y-3 p-4">
        {activePaymentTypes.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {activePaymentTypes.map((item) => {
              const color = paymentTypeColorMap[item?.code] || "default";

              return (
                <div
                  key={item?.id}
                  className="rounded-lg border border-default-200 bg-default-50 px-3 py-2"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-default-900">
                      {item?.name || "-"}
                    </p>

                    <Chip size="sm" color={color} variant="flat">
                      {item?.code}
                    </Chip>
                  </div>

                  <p className="line-clamp-2 text-[11px] leading-4 text-default-500">
                    {item?.description || "-"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-default-300 py-4 text-center">
            <p className="text-xs text-default-500">
              No payment terms available.
            </p>
          </div>
        )}

        <div className="rounded-lg border border-default-200">
          <div className="flex items-center justify-between gap-2 border-b bg-default-50 px-3 py-2">
            <p className="text-xs font-semibold text-default-800">
              Installment / Milestone Payment
            </p>

            {milestoneList.length > 0 && (
              <span className="text-xs font-semibold text-primary">
                {milestoneList.length} Stage
                {milestoneList.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {milestoneList.length > 0 ? (
            <div className="divide-y divide-default-100">
              {milestoneList.map((milestone, index) => (
                <div
                  key={milestone?.id || index}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-semibold text-primary">
                      {index + 1}
                    </span>

                    <p className="truncate text-xs font-medium text-default-800">
                      {milestone?.milestoneName || "-"}
                    </p>
                  </div>

                  <Chip size="sm" color="primary" variant="flat">
                    {Number(milestone?.paymentPercentage || 0)}%
                  </Chip>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-default-500">
                No milestone payment terms found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicePaymentTerm;
