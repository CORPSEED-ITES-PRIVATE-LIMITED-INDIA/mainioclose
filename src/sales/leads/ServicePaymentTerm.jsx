import React, { useEffect, useMemo } from "react";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import {
  getAllPaymentTermList,
  getSolutionDetailByName,
} from "../../toolkit/slices/settingSlice";
import { useDispatch, useSelector } from "react-redux";
import { getServicePaymentTermBasedOnMilestone } from "../../toolkit/slices/operationSlice";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Progress,
  Skeleton,
} from "@heroui/react";
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

  console.log("serviceMilestone", paymentType);

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
      <Card className="border border-default-200 shadow-sm">
        <CardBody className="space-y-4">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-5 max-h-[70vh] overflow-y-auto">
      <Card className="border border-default-200 bg-gradient-to-br from-white to-default-50 shadow-sm">
        <CardHeader className="flex flex-col items-start gap-1 px-5 pt-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary">
              <Info size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-default-900">
                Payment Terms
              </h2>
              <p className="text-sm text-default-500">
                Use this information while explaining payment options to the
                client.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-5 pb-5">
          {activePaymentTypes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {activePaymentTypes.map((item) => {
                const IconComponent =
                  paymentTypeIconMap[item?.code] || FileText;
                const color = paymentTypeColorMap[item?.code] || "default";

                return (
                  <div
                    key={item?.id}
                    className="rounded-2xl border border-default-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-100 text-${color}`}
                      >
                        <IconComponent size={18} />
                      </div>

                      <Chip size="sm" color={color} variant="flat">
                        {item?.code}
                      </Chip>
                    </div>

                    <h3 className="text-sm font-semibold text-default-900">
                      {item?.name || "-"}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-default-500">
                      {item?.description || "-"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-default-300 bg-white py-8 text-center">
              <p className="text-sm text-default-500">
                No payment terms available.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="border border-default-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col items-start gap-1 px-5 pt-5">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Layers size={18} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-default-900">
                  Installment / Milestone Payment
                </h3>
                <p className="text-sm text-default-500">
                  Milestone-wise payment percentage for this service.
                </p>
              </div>
            </div>

            {milestoneList.length > 0 && (
              <Chip color="primary" variant="flat">
                Total {totalPaymentPercentage}%
              </Chip>
            )}
          </div>
        </CardHeader>

        <CardBody className="px-5 pb-5">
          {milestoneList.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-700">
                    Payment Coverage
                  </span>
                  <span className="text-sm font-semibold text-primary-700">
                    {totalPaymentPercentage}%
                  </span>
                </div>

                <Progress
                  value={Math.min(totalPaymentPercentage, 100)}
                  color="primary"
                  radius="full"
                  size="sm"
                />

                <p className="mt-2 text-xs text-primary-700">
                  This shows how much payment is mapped with service milestones.
                </p>
              </div>

              <div className="space-y-3">
                {milestoneList.map((milestone, index) => (
                  <div
                    key={milestone?.id || index}
                    className="relative rounded-2xl border border-default-200 bg-default-50 p-4 transition-all hover:border-primary-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-default-200">
                          {index + 1}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-default-900">
                            {milestone?.milestoneName || "-"}
                          </h4>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-default-500">
                            {milestone?.mandatory ? (
                              <span className="inline-flex items-center gap-1 text-success-600">
                                <CheckCircle2 size={13} />
                                Mandatory
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex min-w-[130px] flex-col items-start rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-default-200 sm:items-end">
                        <span className="text-xs text-default-500">
                          Payment
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {Number(milestone?.paymentPercentage || 0)}%
                        </span>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-default-500">
                        Client payment should be discussed according to this
                        milestone stage.
                      </p>

                      <Chip size="sm" variant="flat" color="default">
                        Stage {milestone?.order || index + 1}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-default-300 bg-default-50 py-8 text-center">
              <p className="text-sm font-medium text-default-600">
                No milestone payment terms found.
              </p>
              <p className="mt-1 text-xs text-default-400">
                If this service uses Full, Partial, or Purchase Order payment,
                milestone percentage may not be available.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ServicePaymentTerm;
