import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  Input,
  Textarea,
  DatePicker,
  Select,
  SelectItem,
  Chip,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { Plus, Search } from "lucide-react";
import { parseDate } from "@internationalized/date";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createTechnicalResearchCase,
  getTechnicalResearchCasesByLead,
} from "../../toolkit/slices/operationSlice";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";
import { getSolutionDetailByName } from "../../toolkit/slices/settingSlice";
import {
  capitalize,
  formatStatusLabel,
  PRIORITY_OPTIONS,
  STATUS_COLOR_CODE,
  PRIORITY_COLOR_CODE,
} from "../../operation/technical/technicalResearchShared";

const PRIORITY_CHOICES = PRIORITY_OPTIONS.filter(
  (option) => option.key !== "--",
);

const EMPTY_FORM = {
  subject: "",
  businessContext: "",
  researchScope: "",
  priority: "MEDIUM",
  dueDate: "",
};

const LeadResearch = () => {
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();
  const createModal = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterValue, setFilterValue] = useState("");

  const data = useSelector(
    (state) => state.operation.technicalResearchCasesByLead,
  );
  const count = useSelector(
    (state) => state.operation.technicalResearchCasesByLeadCount,
  );
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const [productId, setProductId] = useState(null);

  const fetchList = React.useCallback(() => {
    dispatch(getTechnicalResearchCasesByLead({ leadId, page: 1, size: 20 }));
  }, [dispatch, leadId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (!leadData?.leadId && leadId) {
      dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
    }
  }, [dispatch, leadId, userId, leadData?.leadId]);

  // Resolve the product/solution behind this lead the same way Proposal.jsx
  // does — via the lead's originalName — so it can be sent in the payload
  // without asking the user to pick or type it.
  useEffect(() => {
    if (leadData?.originalName) {
      dispatch(
        getSolutionDetailByName({ name: leadData.originalName, userId }),
      ).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setProductId(resp?.payload?.id ?? null);
        }
      });
    }
  }, [dispatch, leadData?.originalName, userId]);

  const filteredItems = useMemo(() => {
    const list = data || [];
    if (!filterValue) return list;
    const search = filterValue.toLowerCase();
    return list.filter((item) =>
      [item?.caseNumber, item?.subject, item?.status, item?.priority].some(
        (field) => field?.toLowerCase().includes(search),
      ),
    );
  }, [data, filterValue]);

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    createModal.onOpen();
  };

  const handleSubmit = () => {
    if (
      !form.subject ||
      !form.businessContext ||
      !form.researchScope ||
      !form.dueDate
    ) {
      addToast({
        title: "Please fill all required fields",
        color: "danger",
      });
      return;
    }

    if (!productId) {
      addToast({
        title: "Unable to determine the product for this lead",
        description: "Please contact admin.",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    dispatch(
      createTechnicalResearchCase({
        originatingLeadId: Number(leadId),
        productId: Number(productId),
        subject: form.subject,
        businessContext: form.businessContext,
        researchScope: form.researchScope,
        raisedByUserId: Number(userId),
        priority: form.priority,
        dueDate: form.dueDate,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Research ticket raised successfully.",
            color: "success",
          });
          createModal.onClose();
          setForm(EMPTY_FORM);
          fetchList();
        } else {
          addToast({
            title: "ERROR",
            description: resp?.payload || "Failed to raise research ticket.",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong.",
          color: "danger",
        }),
      )
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h1 className="font-sans text-lg font-semibold shrink-0">
          Research Tickets
        </h1>
        <Button
          size="sm"
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={handleOpenCreate}
        >
          Raise Research Ticket
        </Button>
      </div>

      <Input
        isClearable
        size="sm"
        className="w-full sm:max-w-[280px]"
        classNames={{ inputWrapper: "h-8 min-h-8" }}
        placeholder="Search ..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={filterValue}
        onClear={() => setFilterValue("")}
        onValueChange={setFilterValue}
      />

      <Table
        removeWrapper={false}
        aria-label="Research cases raised for this lead"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
      >
        <TableHeader>
          <TableColumn>CASE NUMBER</TableColumn>
          <TableColumn>SUBJECT</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>PRIORITY</TableColumn>
          <TableColumn>DUE DATE</TableColumn>
          <TableColumn>CREATED</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            filterValue
              ? "No research tickets match your search"
              : "No research tickets raised for this lead yet"
          }
          items={filteredItems}
        >
          {(item) => (
            <TableRow key={item?.id}>
              <TableCell>
                <p className="text-[12.5px] font-medium">
                  {item?.caseNumber || "-"}
                </p>
              </TableCell>
              <TableCell>
                <p
                  className="text-[12.5px] max-w-[240px] truncate"
                  title={item?.subject}
                >
                  {item?.subject || "-"}
                </p>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={STATUS_COLOR_CODE[item?.status] || "default"}
                >
                  {formatStatusLabel(item?.status)}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={PRIORITY_COLOR_CODE[item?.priority] || "default"}
                >
                  {capitalize(item?.priority)}
                </Chip>
              </TableCell>
              <TableCell>
                <p className="text-[12.5px]">
                  {item?.dueDate
                    ? dayjs(item.dueDate).format("DD-MM-YYYY")
                    : "-"}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-[12.5px]">
                  {item?.createdAt
                    ? dayjs(item.createdAt).format("DD-MM-YYYY hh:mm A")
                    : "-"}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={createModal.isOpen}
        onOpenChange={(open) => {
          createModal.onOpenChange(open);
          if (!open) setForm(EMPTY_FORM);
        }}
        size="2xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Raise Research Ticket
              </ModalHeader>
              <ModalBody className="max-h-[75vh] overflow-auto gap-3">
                <Input
                  label="Subject"
                  isRequired
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                />
                <Textarea
                  label="Business context"
                  isRequired
                  value={form.businessContext}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      businessContext: e.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Research scope"
                  isRequired
                  value={form.researchScope}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      researchScope: e.target.value,
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Priority"
                    isRequired
                    selectedKeys={[form.priority]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0];
                      setForm((prev) => ({ ...prev, priority: key }));
                    }}
                  >
                    {PRIORITY_CHOICES.map((option) => (
                      <SelectItem key={option.key}>{option.label}</SelectItem>
                    ))}
                  </Select>
                  <DatePicker
                    label="Due date"
                    isRequired
                    showMonthAndYearPickers
                    value={form.dueDate ? parseDate(form.dueDate) : null}
                    onChange={(date) => {
                      setForm((prev) => ({
                        ...prev,
                        dueDate: date
                          ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`
                          : "",
                      }));
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isLoading={isSubmitting}
                  onPress={handleSubmit}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LeadResearch;
