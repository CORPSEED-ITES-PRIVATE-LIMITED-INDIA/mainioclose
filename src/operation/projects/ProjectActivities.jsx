import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  Input,
  DatePicker,
  Form,
  useDisclosure,
  addToast,
  DateRangePicker,
  Pagination,
} from "@heroui/react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  getActivitiesByProjectId,
  getActivitiesByTypeAndProjectId,
  addCommentInProject,
  addNoteInProject,
  addExpensesInProject,
  getActivitiesByDateRangeAndProjectId,
} from "../../toolkit/slices/operationSlice";

import { ActivityItem } from "./ProjectDetails";
import SingleFileUploader from "../../components/SingleFileUploader";
import { getUserDetailById } from "../../toolkit/slices/commonSlice";
import { parseDate, toCalendarDate } from "@internationalized/date";
import { IndianRupee } from "lucide-react";

const expenseSchema = z.object({
  expenseCategory: z.string().min(1, "Please select expense category"),
  amount: z.coerce
    .number({
      invalid_type_error: "Please enter amount",
    })
    .positive("Amount must be greater than 0"),

  remark: z.string().trim().min(1, "Please enter remark"),

  expenseDate: z.string().min(1, "Please select expense date"),

  attachmentUrl: z.string().min(1, "Please upload payment proof"),

  externalReference: z.string().trim().optional(),

  currencyCode: z.string().min(1, "Please select currency"),
});

const ProjectActivities = () => {
  const dispatch = useDispatch();
  const { projectId, userId } = useParams();
  const activityPage = useSelector(
    (state) => state.operation.activitiesByProjectId || {},
  );

  const activities = activityPage.content || [];
  const totalPages = activityPage.totalPages || 0;
  const totalElements = activityPage.totalElements || 0;

  const commentModal = useDisclosure();
  const noteModal = useDisclosure();
  const expenseModal = useDisclosure();
  const [activityType, setActivityType] = useState("ALL");
  const [replyParentId, setReplyParentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [page, setPage] = useState(1); // HeroUI is 1-based
  const size = 50;
  const [dateFilter, setDateFilter] = useState({
    toDate: null,
    fromDate: null,
  });

  const userDetailById = useSelector((state) => state.common.userDetailById);

  const {
    control: expenseControl,
    handleSubmit: handleExpenseSubmit,
    formState: { errors: expenseErrors, isSubmitting: isExpenseSubmitting },
    reset: resetExpenseForm,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseCategory: "",
      amount: "",
      remark: "",
      expenseDate: "",
      attachmentUrl: "",
      externalReference: "",
      currencyCode: "INR",
    },
  });

  useEffect(() => {
    dispatch(getActivitiesByProjectId({ projectId, page, size }));
  }, [dispatch, page, projectId, size]);

  useEffect(() => {
    if (userId) {
      dispatch(getUserDetailById(Number(userId)));
    }
  }, [dispatch, userId]);

  const handleReply = (commentId) => {
    setReplyParentId(commentId);
    commentModal.onOpen();
  };

  const handleFilterChange = (value) => {
    if (value === "ALL") {
      dispatch(getActivitiesByProjectId({ projectId, page, size }));
    } else {
      dispatch(
        getActivitiesByTypeAndProjectId({
          projectId,
          type: value,
          page,
          size,
        }),
      );
    }

    setActivityType(value);
  };

  const handleAddComment = () => {
    dispatch(
      addCommentInProject({
        projectId,
        data: {
          commentText,
          ...(replyParentId ? { parentCommentId: replyParentId } : {}),
          createdByUserId: Number(userId),
        },
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({ title: "Comment added", color: "success" });

        commentModal.onClose();
        setCommentText("");
        setReplyParentId(null);

        dispatch(getActivitiesByProjectId({ projectId, page, size }));
      }
    });
  };

  const handleAddNote = () => {
    dispatch(
      addNoteInProject({
        projectId,
        data: {
          noteText,
          createdByUserId: Number(userId),
        },
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({ title: "Note added", color: "success" });

        noteModal.onClose();
        setNoteText("");

        dispatch(getActivitiesByProjectId({ projectId, page, size }));
      }
    });
  };

  const handleAddExpense = async (formData) => {
    const departmentId = Number(userDetailById?.userDepartment?.id);
    const createdByUserId = Number(userDetailById?.id);

    if (!departmentId) {
      addToast({
        title: "Department not found",
        description: "The user's department details are unavailable.",
        color: "danger",
      });
      return;
    }

    if (!createdByUserId) {
      addToast({
        title: "User not found",
        description: "The user details are unavailable.",
        color: "danger",
      });
      return;
    }

    const payload = {
      departmentId,
      expenseCategory: formData.expenseCategory,
      amount: Number(formData.amount),
      remark: formData.remark.trim(),
      expenseDate: formData.expenseDate,
      createdByUserId,
      attachmentUrl: formData.attachmentUrl,
      externalReference: formData.externalReference?.trim() || "",
      currencyCode: formData.currencyCode,
    };

    try {
      const resp = await dispatch(
        addExpensesInProject({
          projectId: Number(projectId),
          data: payload,
        }),
      );

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Expense added successfully!",
          color: "success",
        });

        resetExpenseForm({
          expenseCategory: "",
          amount: "",
          remark: "",
          expenseDate: "",
          attachmentUrl: "",
          externalReference: "",
          currencyCode: "INR",
        });

        expenseModal.onClose();
        setActivityType("ALL");
        setPage(1);

        dispatch(
          getActivitiesByProjectId({
            projectId,
            page: 1,
            size,
          }),
        );

        return;
      }

      addToast({
        title: resp?.payload?.status || "Unable to add expense",
        description: resp?.payload?.message,
        color: "danger",
      });
    } catch (error) {
      addToast({
        title: "Something went wrong!",
        description: error?.message,
        color: "danger",
      });
    }
  };

  const handleApplyDateFilter = useCallback(() => {
    dispatch(
      getActivitiesByDateRangeAndProjectId({
        page,
        size,
        startDate: dateFilter.fromDate,
        endDate: dateFilter.toDate,
        projectId,
      }),
    );
  }, [page, activityType, dateFilter, projectId]);

  const handleResetDateFilter = () => {
    setDateFilter({
      fromDate: null,
      toDate: null,
    });
    dispatch(getActivitiesByProjectId({ projectId, page, size }));
  };

  return (
    <div className="flex flex-col">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Project Activities</h2>

          <Select
            size="sm"
            selectedKeys={[activityType]}
            className="w-40"
            onSelectionChange={(keys) =>
              handleFilterChange(Array.from(keys)[0])
            }
          >
            <SelectItem key="ALL">All</SelectItem>
            <SelectItem key="COMMENT">Comments</SelectItem>
            <SelectItem key="NOTE">Notes</SelectItem>
            <SelectItem key="EXPENSE">Expenses</SelectItem>
          </Select>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 mt-3">
            <Button size="sm" onPress={commentModal.onOpen}>
              Add Comment
            </Button>

            <Button size="sm" onPress={noteModal.onOpen}>
              Add Note
            </Button>

            <Button size="sm" onPress={expenseModal.onOpen}>
              Add Expense
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <DateRangePicker
              showMonthAndYearPickers
              hideTimeZone
              size="sm"
              value={{
                start: dateFilter?.fromDate
                  ? parseDate(dateFilter.fromDate)
                  : null,
                end: dateFilter?.toDate ? parseDate(dateFilter.toDate) : null,
              }}
              onChange={(value) => {
                const formattedStart = value.start
                  ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                  : null;

                const formattedEnd = value.end
                  ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                  : null;

                setDateFilter({
                  fromDate: formattedStart,
                  toDate: formattedEnd,
                });
              }}
            />
            <Button
              radius="sm"
              size="sm"
              color="primary"
              onPress={handleApplyDateFilter}
            >
              Apply
            </Button>
            <Button radius="sm" size="sm" onPress={handleResetDateFilter}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* ACTIVITY LIST */}
      <div className="max-h-[55vh] flex-1 overflow-y-auto p-4 space-y-4">
        {activities
          .filter((activity) => activity?.details)
          .map((activity) => (
            <ActivityItem
              key={activity.activityId}
              activity={activity}
              onReply={handleReply}
            />
          ))}
      </div>
      <div className="flex justify-between items-center gap-3 py-4">
        <p className="text-xs text-gray-500">
          Showing {(page - 1) * size + 1} -{" "}
          {Math.min(page * size, totalElements)} of {totalElements}
        </p>
        <Pagination
          page={page}
          total={totalPages}
          onChange={(p) => setPage(p)}
          color="secondary"
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            onPress={() => setPage((prev) => (prev > 1 ? prev - 1 : prev))}
          >
            Previous
          </Button>

          <Button
            size="sm"
            variant="flat"
            onPress={() =>
              setPage((prev) => (prev < totalPages ? prev + 1 : prev))
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* COMMENT MODAL */}
      <Modal
        isOpen={commentModal.isOpen}
        onOpenChange={commentModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentText?.trim()) return;
                handleAddComment();
              }}
            >
              <ModalHeader>Add Comment</ModalHeader>

              <ModalBody className="w-full">
                <Textarea
                  label="Comment"
                  name="commentText"
                  isRequired
                  errorMessage="Please enter comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      {/* NOTE MODAL */}
      <Modal isOpen={noteModal.isOpen} onOpenChange={noteModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noteText?.trim()) return;
                handleAddNote();
              }}
            >
              <ModalHeader>Add Note</ModalHeader>

              <ModalBody className="w-full">
                <Textarea
                  label="Note"
                  name="noteText"
                  isRequired
                  errorMessage="Please enter note"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      {/* EXPENSE MODAL */}
      <Modal
        size="2xl"
        isOpen={expenseModal.isOpen}
        onOpenChange={(isOpen) => {
          expenseModal.onOpenChange(isOpen);

          if (!isOpen && !isExpenseSubmitting) {
            resetExpenseForm({
              expenseCategory: "",
              amount: "",
              remark: "",
              expenseDate: "",
              attachmentUrl: "",
              externalReference: "",
              currencyCode: "INR",
            });
          }
        }}
        isDismissable={!isExpenseSubmitting}
        hideCloseButton={isExpenseSubmitting}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={handleExpenseSubmit(handleAddExpense)}
            >
              <ModalHeader>Add Expense</ModalHeader>

              <ModalBody className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="expenseCategory"
                  control={expenseControl}
                  render={({ field }) => (
                    <Select
                      label="Expense Category"
                      isRequired
                      selectedKeys={
                        field.value ? new Set([field.value]) : new Set()
                      }
                      onSelectionChange={(keys) => {
                        field.onChange(Array.from(keys)[0] || "");
                      }}
                      isInvalid={!!expenseErrors.expenseCategory}
                      errorMessage={expenseErrors.expenseCategory?.message}
                    >
                      <SelectItem key="GOVERNMENT_FEE">
                        Government Fee
                      </SelectItem>
                      <SelectItem key="TRAVEL_FEE">Travel Fee</SelectItem>
                      <SelectItem key="FILING_FEE">Filing Fee</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="amount"
                  control={expenseControl}
                  render={({ field }) => (
                    <Input
                      label="Amount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      isRequired
                      startContent={<IndianRupee className="h-4 w-4" />}
                      value={field.value?.toString() || ""}
                      onValueChange={field.onChange}
                      isInvalid={!!expenseErrors.amount}
                      errorMessage={expenseErrors.amount?.message}
                    />
                  )}
                />

                <Controller
                  name="currencyCode"
                  control={expenseControl}
                  render={({ field }) => (
                    <Select
                      label="Currency"
                      isRequired
                      selectedKeys={
                        field.value ? new Set([field.value]) : new Set()
                      }
                      onSelectionChange={(keys) => {
                        field.onChange(Array.from(keys)[0] || "");
                      }}
                      isInvalid={!!expenseErrors.currencyCode}
                      errorMessage={expenseErrors.currencyCode?.message}
                    >
                      <SelectItem key="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem key="USD">USD - US Dollar</SelectItem>
                      <SelectItem key="EUR">EUR - Euro</SelectItem>
                      <SelectItem key="AED">AED - UAE Dirham</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="expenseDate"
                  control={expenseControl}
                  render={({ field }) => (
                    <DatePicker
                      label="Expense Date"
                      showMonthAndYearPickers
                      isRequired
                      value={
                        field.value
                          ? parseDate(dayjs(field.value).format("YYYY-MM-DD"))
                          : null
                      }
                      onChange={(date) => {
                        if (!date) {
                          field.onChange("");
                          return;
                        }

                        const selectedDate = toCalendarDate(date).toString();
                        const isoDate = dayjs(selectedDate)
                          .hour(dayjs().hour())
                          .minute(dayjs().minute())
                          .second(dayjs().second())
                          .millisecond(dayjs().millisecond())
                          .toISOString();

                        field.onChange(isoDate);
                      }}
                      isInvalid={!!expenseErrors.expenseDate}
                      errorMessage={expenseErrors.expenseDate?.message}
                    />
                  )}
                />

                <Controller
                  name="externalReference"
                  control={expenseControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="External Reference"
                      placeholder="Enter transaction or receipt reference"
                      value={field.value || ""}
                      isInvalid={!!expenseErrors.externalReference}
                      errorMessage={expenseErrors.externalReference?.message}
                    />
                  )}
                />

                <Controller
                  name="attachmentUrl"
                  control={expenseControl}
                  render={({ field }) => (
                    <div className="md:col-span-2">
                      <SingleFileUploader
                        label="Payment Proof"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value || "");
                        }}
                        isRequired
                        isInvalid={!!expenseErrors.attachmentUrl}
                        errorMessage={expenseErrors.attachmentUrl?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="remark"
                  control={expenseControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Remark"
                      placeholder="Enter expense details"
                      isRequired
                      className="md:col-span-2"
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      isInvalid={!!expenseErrors.remark}
                      errorMessage={expenseErrors.remark?.message}
                    />
                  )}
                />
              </ModalBody>

              <ModalFooter className="flex w-full justify-end gap-2">
                <Button
                  type="button"
                  variant="flat"
                  isDisabled={isExpenseSubmitting}
                  onPress={onClose}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  type="submit"
                  isLoading={isExpenseSubmitting}
                  isDisabled={isExpenseSubmitting}
                >
                  {isExpenseSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectActivities;
