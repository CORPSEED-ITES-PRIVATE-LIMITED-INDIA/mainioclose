import React, { useEffect, useState } from "react";
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
} from "../../toolkit/slices/operationSlice";

import { ActivityItem } from "./ProjectDetails";

import { allowOnlyNumbers } from "../../common";
import { parseDate, toCalendarDate } from "@internationalized/date";

const ProjectActivities = () => {
  const dispatch = useDispatch();
  const { projectId, userId } = useParams();

  const activities = useSelector(
    (state) => state.operation.activitiesByProjectId?.content || [],
  );

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

  useEffect(() => {
    dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
  }, []);

  const handleReply = (commentId) => {
    setReplyParentId(commentId);
    commentModal.onOpen();
  };

  const handleFilterChange = (value) => {
    if (value === "ALL") {
      dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
    } else {
      dispatch(
        getActivitiesByTypeAndProjectId({
          projectId,
          type: value,
          page: 0,
          size: 50,
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

        dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
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

        dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
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

        dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
      }
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b p-4">
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
      </div>

      {/* ACTIVITY LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

      {/* COMMENT MODAL */}
      <Modal
        isOpen={commentModal.isOpen}
        onOpenChange={commentModal.onOpenChange}
      >
        <ModalContent>
          <ModalHeader>Add Comment</ModalHeader>

          <ModalBody>
            <Textarea
              label="Comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onPress={handleAddComment}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* NOTE MODAL */}
      <Modal isOpen={noteModal.isOpen} onOpenChange={noteModal.onOpenChange}>
        <ModalContent>
          <ModalHeader>Add Note</ModalHeader>

          <ModalBody>
            <Textarea
              label="Note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onPress={handleAddNote}>
              Submit
            </Button>
          </ModalFooter>
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
