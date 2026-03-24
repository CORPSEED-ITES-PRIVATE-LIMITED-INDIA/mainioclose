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

import {
  getActivitiesByProjectId,
  getActivitiesByTypeAndProjectId,
  addCommentInProject,
  addNoteInProject,
  addExpensesInProject,
  getActivitiesByDateRangeAndProjectId,
} from "../../toolkit/slices/operationSlice";

import { ActivityItem } from "./ProjectDetails";

import { allowOnlyNumbers } from "../../common";
import {
  parseDate,
  parseZonedDateTime,
  toCalendarDate,
} from "@internationalized/date";

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
  const [expenseData, setExpenseData] = useState({
    amount: "",
    expenseType: "",
    description: "",
    expenseDate: "",
  });
  const [page, setPage] = useState(1); // HeroUI is 1-based
  const size = 50;
  const [dateFilter, setDateFilter] = useState({
    toDate: null,
    fromDate: null,
  });

  useEffect(() => {
    dispatch(getActivitiesByProjectId({ projectId, page, size }));
  }, [page, projectId, size]);

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

  const handleAddExpense = () => {
    dispatch(
      addExpensesInProject({
        projectId,
        data: { ...expenseData, createdByUserId: Number(userId) },
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({ title: "Expense added", color: "success" });
        expenseModal.onClose();
        setExpenseData({
          amount: "",
          expenseType: "",
          description: "",
          expenseDate: "",
        });

        dispatch(getActivitiesByProjectId({ projectId, page, size }));
      }
    });
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
        onOpenChange={expenseModal.onOpenChange}
      >
        <ModalContent>
          <ModalHeader>Add Expense</ModalHeader>

          <Form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              let data = Object.fromEntries(new FormData(e.currentTarget));
              handleAddExpense(data);
            }}
          >
            <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Input
                label="Expense Type"
                name="expenseType"
                isRequired
                errorMessage="please enter expense type"
                value={expenseData.expenseType}
                onChange={(e) =>
                  setExpenseData({
                    ...expenseData,
                    expenseType: e.target.value,
                  })
                }
              />

              <Input
                label="Amount"
                type="number"
                name="amount"
                isRequired
                errorMessage="please enter amount"
                value={expenseData.amount}
                onChange={(e) =>
                  setExpenseData({
                    ...expenseData,
                    amount: allowOnlyNumbers(e.target.value),
                  })
                }
              />

              <Input
                label="Currency"
                name="currency"
                isRequired
                errorMessage="please enter currency"
                value={expenseData.currency}
                onChange={(e) =>
                  setExpenseData({
                    ...expenseData,
                    currency: e.target.value,
                  })
                }
              />

              <DatePicker
                isRequired
                label="Expense date"
                showMonthAndYearPickers
                errorMessage="Please select the date."
                value={
                  expenseData.expenseDate
                    ? parseDate(
                        dayjs(expenseData.expenseDate).format("YYYY-MM-DD"),
                      )
                    : null
                }
                onChange={(e) => {
                  const dateStr = toCalendarDate(e).toString(); // 2026-03-13
                  const isoDate = dayjs(dateStr)
                    .hour(dayjs().hour())
                    .minute(dayjs().minute())
                    .second(dayjs().second())
                    .millisecond(dayjs().millisecond())
                    .toISOString();

                  setExpenseData((prev) => ({
                    ...prev,
                    expenseDate: isoDate,
                  }));
                }}
              />

              <Textarea
                label="Description"
                name="description"
                isRequired
                errorMessage="please enter description"
                value={expenseData.description}
                onChange={(e) =>
                  setExpenseData({
                    ...expenseData,
                    description: e.target.value,
                  })
                }
              />
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectActivities;
