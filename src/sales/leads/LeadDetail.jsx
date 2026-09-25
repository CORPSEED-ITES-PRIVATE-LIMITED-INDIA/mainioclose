import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import {
  CheckCircle2,
  Mail,
  ShieldAlert,
  Smartphone,
  XCircle,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DotIcon from "../../components/DotIcon";
import RoundedTabs from "../../components/RoundedTabs";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  approveRejectLead,
  getSingleLeadDataByLeadId,
} from "../../toolkit/slices/leadSlice";

const iconClass = "h-4 w-4";

const rejectLeadFormSchema = z.object({
  remarks: z.string().min(1, "Please enter a reason for rejection"),
});

const rejectLeadFormDefault = {
  remarks: "",
};

const LeadDetail = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const pathKey = path?.pathname?.split("/");
  const leadData = useSelector((state) => state.leads.singleLeadData);
  console.log("Lead Detail:", leadData);
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );
  const [selectedKey, setSelectedKey] = useState("leadDetail");
  const [approveRejectLoading, setApproveRejectLoading] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Controls the confirmation modal + which action it's for
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionMode, setActionMode] = useState(null); // "approve" | "reject"

  useEffect(() => {
    setSelectedKey(pathKey[pathKey?.length - 1]);
  }, [pathKey]);

  const handleSelect = (key) => {
    navigate(key);
    setSelectedKey(key);
  };

  const rejectLeadForm = useForm({
    resolver: zodResolver(rejectLeadFormSchema),
    defaultValues: rejectLeadFormDefault,
  });

  const isPendingApproval =
    leadData?.assignmentApprovalStatus === "PENDING" && !adminRole;

  const openApproveModal = () => {
    setActionMode("approve");
    setShowRejectForm(false);
    setIsActionModalOpen(true);
  };

  const openRejectModal = () => {
    setActionMode("reject");
    setShowRejectForm(true);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setActionMode(null);
    setShowRejectForm(false);
    rejectLeadForm.reset(rejectLeadFormDefault);
  };

  const handleApproveLead = () => {
    setApproveRejectLoading("pending");
    dispatch(
      approveRejectLead({
        leadId,
        userId,
        isApproved: true,
        remarks: "",
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Lead approved successfully !.",
            color: "success",
          });
          setApproveRejectLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          closeActionModal();
        } else {
          setApproveRejectLoading("rejected");
          addToast({
            title: "ERROR",
            description:
              resp?.payload?.data?.message || "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setApproveRejectLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleRejectLead = (values) => {
    setApproveRejectLoading("pending");
    dispatch(
      approveRejectLead({
        leadId,
        userId,
        isApproved: false,
        remarks: values?.remarks,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Lead rejected. Reassigned to admin.",
            color: "success",
          });
          setApproveRejectLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          closeActionModal();
        } else {
          setApproveRejectLoading("rejected");
          addToast({
            title: "ERROR",
            description:
              resp?.payload?.data?.message || "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setApproveRejectLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const tabs =
    department === "Quality Team" && !adminRole
      ? [
          { id: "leadDetail", label: "Details" },
          { id: "leadHistory", label: "Lead history" },
        ]
      : [
          { id: "leadDetail", label: "Details" },
          { id: "paymentTerm", label: "Payment Term" },
          // { id: "childLead", label: "Child lead" },
          // { id: "companyForm", label: "Company" },
          // { id: "leadCompanyForm", label: "Lead company" },
          { id: "proposal", label: "Proposal" },
          // { id: "leadEstimate", label: "Estimate" },
          { id: "leadEstimates", label: "Estimates" },
          { id: "leadTasks", label: "Tasks" },
          { id: "leadHistory", label: "Lead history" },
          { id: "procurementResearch", label: "Procurement Research" },
          { id: "technicalResearch", label: "Technical Research" },
        ];

  return (
    <div className="flex flex-col gap-4">
      {approveRejectLoading === "pending" && <LoadingSpinner />}
      {/* Header */}
      <div className="flex items-center">
        {leadData?.originalName ? (
          <DotIcon margin="0px 4px 0px 2px" color="red" />
        ) : (
          <DotIcon margin="0px 4px 0px 2px" color="green" />
        )}
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-medium">
            {leadData?.originalName || "NA"}
          </h2>
          {leadData?.count !== undefined && (
            <p className="font-medium">{`(${leadData.count})`}</p>
          )}
        </div>
      </div>

      {isPendingApproval && department === "Sales" ? (
        <>
          <Card className="border border-warning-300 bg-warning-50 shadow-sm">
            <CardBody className="flex flex-col items-center gap-2 px-4 py-6 text-center">
              <ShieldAlert className="h-8 w-8 text-warning-600" />
              <p className="text-base font-semibold text-warning-700">
                Approval required
              </p>
              <p className="max-w-md text-sm text-warning-600">
                This lead has been assigned to you but hasn't been approved yet.
                Approve to keep working on it, or reject to send it back to the
                admin.
              </p>
            </CardBody>
          </Card>

          {/* Client details shown directly on the page */}
          {leadData?.clients?.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-default-500">
                Client details
              </p>
              {leadData.clients.map((client) => (
                <div
                  key={client?.id || client?.name}
                  className="rounded-xl border border-default-200 bg-default-50/60 p-2.5"
                >
                  <p className="text-sm font-semibold text-default-700">
                    {client?.name || "-"}
                  </p>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {client?.contactNo && (
                      <div className="flex items-center gap-1.5 text-default-500">
                        <Smartphone className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs">{client.contactNo}</span>
                      </div>
                    )}
                    {client?.emails && (
                      <div className="flex items-center gap-1.5 text-default-500">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="block max-w-full break-all text-xs">
                          {client.emails}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approve / Reject buttons below client details */}
          <div className="flex justify-end gap-2">
            <Button
              color="danger"
              variant="flat"
              startContent={<XCircle className={iconClass} />}
              isDisabled={approveRejectLoading === "pending"}
              onPress={openRejectModal}
            >
              Reject
            </Button>
            <Button
              color="success"
              className="text-white"
              startContent={<CheckCircle2 className={iconClass} />}
              isDisabled={approveRejectLoading === "pending"}
              onPress={openApproveModal}
            >
              Approve
            </Button>
          </div>

          {/* Modal only opens when a button is clicked */}
          <Modal
            isOpen={isActionModalOpen}
            onOpenChange={(open) => {
              if (!open) closeActionModal();
            }}
            placement="center"
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                {actionMode === "approve" ? "Approve lead" : "Reject lead"}
              </ModalHeader>
              <ModalBody>
                {actionMode === "approve" ? (
                  <p className="text-sm text-default-600">
                    Are you sure you want to approve{" "}
                    <span className="font-semibold">
                      {leadData?.originalName || "this lead"}
                    </span>
                    ?
                  </p>
                ) : (
                  <form
                    className="flex w-full flex-col gap-3"
                    onSubmit={rejectLeadForm.handleSubmit(handleRejectLead)}
                  >
                    <p className="text-sm text-default-600">
                      This lead will be reassigned to the admin. Please share
                      the reason for rejecting it.
                    </p>
                    <Controller
                      name="remarks"
                      control={rejectLeadForm.control}
                      render={({ field }) => (
                        <Textarea
                          isRequired
                          label="Remarks"
                          placeholder="Why are you rejecting this lead?"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          errorMessage={
                            rejectLeadForm.formState.errors?.remarks?.message
                          }
                        />
                      )}
                    />
                  </form>
                )}
              </ModalBody>
              <ModalFooter className="w-full justify-end">
                <Button
                  variant="light"
                  isDisabled={approveRejectLoading === "pending"}
                  onPress={closeActionModal}
                >
                  Cancel
                </Button>
                {actionMode === "approve" ? (
                  <Button
                    color="success"
                    className="text-white"
                    startContent={<CheckCircle2 className={iconClass} />}
                    isDisabled={approveRejectLoading === "pending"}
                    isLoading={approveRejectLoading === "pending"}
                    onPress={handleApproveLead}
                  >
                    Approve
                  </Button>
                ) : (
                  <Button
                    color="danger"
                    isDisabled={approveRejectLoading === "pending"}
                    isLoading={approveRejectLoading === "pending"}
                    onPress={rejectLeadForm.handleSubmit(handleRejectLead)}
                  >
                    Reject lead
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <>
          {/* Rounded Button Tabs */}
          <RoundedTabs
            tabs={tabs}
            value={selectedKey}
            onChange={handleSelect}
          />
          {/* Page Content */}
          <Outlet />
        </>
      )}
    </div>
  );
};

export default LeadDetail;
