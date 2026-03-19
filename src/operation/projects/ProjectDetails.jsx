import {
  Accordion,
  AccordionItem,
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  DatePicker,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  User,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addClientLogInCredentialForPortal,
  addCommentInProject,
  addExpensesInProject,
  addNoteInProject,
  getActivitiesByProjectId,
  getActivitiesByTypeAndProjectId,
  getClientLogInCredentialDetailForPortal,
  getHistoryByMileStoneIdAndProjectId,
  getOperationProjectDetailById,
  getRequiredDocumentsByProductId,
  updateApplicantTypeInProject,
  updateAssigneeForMileStone,
  updateAssignmentStatusForMileStone,
  updateDocumentStatus,
  uploadDocumentInProjects,
} from "../../toolkit/slices/operationSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookText,
  Building,
  Calendar,
  EllipsisVertical,
  GitFork,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  User2,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import {
  getAllMilestoneStatusesForOperations,
  getUsersListByDepartmentId,
} from "../../toolkit/slices/commonSlice";
import {
  allowOnlyNumbers,
  inrCurrency,
  statusColorCode,
  statusColors,
} from "../../common";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { getApplicantTypeList } from "../../toolkit/slices/settingSlice";
import FileUploader from "../../components/FileUploader";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";

export const WhatsAppIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path
        d="M12.004 2C6.476 2 2 6.486 2 12.023c0 1.983.579 3.83 1.575 5.386L2 22l4.674-1.53A10.003 10.003 0 0 0 12.004 22C17.532 22 22 17.514 22 11.977 22 6.487 17.532 2 12.004 2Zm-.014 18.005c-1.605 0-3.115-.477-4.377-1.287l-.313-.2-2.774.91.914-2.705-.202-.322a8.002 8.002 0 1 1 6.752 3.604Zm4.445-5.635c-.244-.122-1.446-.713-1.67-.793-.224-.081-.387-.122-.55.122-.163.244-.63.793-.773.957-.142.163-.285.183-.53.061-.244-.122-1.033-.381-1.964-1.216-.726-.648-1.215-1.447-1.36-1.691-.142-.244-.015-.377.107-.498.11-.108.244-.285.366-.428.122-.142.163-.244.244-.407.081-.163.041-.305-.02-.428-.061-.122-.55-1.324-.753-1.812-.199-.479-.402-.413-.55-.42l-.468-.007a.902.902 0 0 0-.651.305c-.224.244-.855.835-.855 2.035s.875 2.362 1.001 2.524c.122.163 1.722 2.627 4.176 3.684.584.252 1.04.402 1.395.514.586.186 1.119.16 1.54.097.47-.07 1.446-.59 1.65-1.162.204-.57.204-1.06.142-1.162-.061-.102-.224-.163-.468-.285Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const PdfIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6 2C4.897 2 4 2.897 4 4v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V8l-6-6H6zm7 1.414L18.586 9H14a1 1 0 0 1-1-1V3.414zM7 13h1.5a1.5 1.5 0 0 0 0-3H7v3zm1.5-2a.5.5 0 0 1 0 1H8v-1h.5zM11 10v4h1v-1h.5a1.5 1.5 0 0 0 0-3H11zm1.5 1a.5.5 0 0 1 0 1H12v-1h.5zM15 10v4h1v-1h1v-1h-1v-1h1v-1h-2z"
      />
    </svg>
  );
};

const CommentThread = ({ comment, level = 0, onReply }) => {
  return (
    <div className="mt-2" style={{ marginLeft: Math.min(level * 16, 64) }}>
      <div className="group rounded-md p-2 bg-gradient-to-br from-blue-50 to-blue-100 border text-xs relative max-w-full overflow-hidden">
        <div className="flex justify-between text-gray-500 text-[11px]">
          <span className="font-medium text-gray-700">
            {comment.createdByUserName}
          </span>

          <span>{dayjs(comment.createdDate).format("DD/MM/YYYY , HH:mm")}</span>
        </div>

        <div className="mt-1 text-gray-700 break-words whitespace-pre-wrap">
          {comment.commentText}
        </div>

        <button
          onClick={() => onReply(comment.id)}
          className="absolute right-2 bottom-2 text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition cursor-pointer"
        >
          Reply
        </button>
      </div>

      {comment.children?.length > 0 && (
        <div className="border-l pl-3 mt-2">
          {comment.children.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              level={level + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ActivityItem = ({ activity, onReply }) => {
  const renderContent = () => {
    switch (activity.activityType) {
      case "COMMENT":
        return (
          <>
            <div className="group mt-1 rounded-md p-2 bg-gradient-to-br from-gray-50 to-gray-100 border text-xs relative">
              {activity.details?.commentText}

              {/* Reply button */}
              <button
                onClick={() => onReply(activity.details?.id)}
                className="absolute right-2 bottom-2 text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                Reply
              </button>
            </div>

            {activity.details?.children?.length > 0 && (
              <div className="mt-2 ml-2 border-l pl-3">
                <span className="text-[11px] text-gray-400">Replies</span>

                {activity.details.children.map((child) => (
                  <CommentThread
                    key={child.id}
                    comment={child}
                    onReply={onReply}
                  />
                ))}
              </div>
            )}
          </>
        );

      case "NOTE":
        return (
          <div className="mt-1 rounded-md p-2 bg-gradient-to-br from-green-50 to-green-100 border text-xs">
            {activity.details?.noteText}
          </div>
        );

      case "EXPENSE":
        return (
          <div className="mt-1 rounded-md p-2 bg-gradient-to-br from-yellow-50 to-yellow-100 border text-xs">
            <div>
              {activity.details?.expenseType}{" "}
              {inrCurrency(activity.details?.amount)}
            </div>

            {activity.details?.description && (
              <div className="text-gray-500 text-[11px] mt-1">
                {activity.details.description}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2 text-xs">
      {/* timeline dot */}
      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />

      <div className="flex flex-col w-full">
        {/* header */}
        <div className="flex gap-2 items-center text-gray-500">
          <span className="font-medium text-gray-700">
            {activity.createdByUserName}
          </span>

          <span>
            {dayjs(activity.activityDate).format("DD/MM/YYYY , HH:mm")}
          </span>

          <span className="text-[10px] px-2 py-[1px] rounded bg-gray-100">
            {activity.activityType}
          </span>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

const documentSchema = (isPermanentFlag) =>
  z.object({
    fileName: z.string().min(1, "File name is required"),
    companyDocSourceId: z.coerce.number().min(1, "Source is required"),
    isFromCompanyDoc: z.boolean(),
    isPermanent: z.boolean(),
    ...(isPermanentFlag
      ? { expiryDate: z.string().min(1, "please enter the date") }
      : {}),
    fileSizeKb: z.coerce.number().min(1, "File size required"),
    fileFormat: z.string().min(1, "File format is required"),
    remarks: z.string().optional(),
  });

const verifySchema = z.object({
  newStatus: z.string().min(1, "Please select status"),
  remarks: z.string().min(1, "Remarks is required"),
});

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const { projectId, userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const assigneeModal = useDisclosure();
  const statusModal = useDisclosure();
  const clientModal = useDisclosure();
  const docModal = useDisclosure();
  const verifyModal = useDisclosure();
  const expenseModal = useDisclosure();
  const noteModal = useDisclosure();
  const commentModal = useDisclosure();

  const detailedData = useSelector(
    (state) => state.operation.operationProjectDetail,
  );
  const clientLoginPortalCredentials = useSelector(
    (state) => state.operation.clientLoginCredential,
  );
  const requiredDocsList = useSelector(
    (state) => state.operation.requiredDoucmentListOfProduct,
  );
  const userListBydepartment = useSelector(
    (state) => state.common.userListByDepartment,
  );
  const milestoneStatusList = useSelector(
    (state) => state.common.milestoneStatusList,
  );
  const mileStoneHistoryDetail = useSelector(
    (state) => state.operation.mileStoneEventHistory,
  );
  const applicantTypeList = useSelector(
    (state) => state.setting.applicantTypeList,
  );
  const activities = useSelector(
    (state) => state.operation.activitiesByProjectId?.content || [],
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [activityType, setActivityType] = useState("ALL");
  const [assigneeObj, setAssigneeObj] = useState({
    assignmentId: null,
    newUserId: null,
    reassignmentReason: "",
    changedById: null,
  });

  const [statusObj, setStatusObj] = useState({
    assignmentId: null,
    newStatusName: "",
    statusReason: "",
    changedById: null,
  });

  const [isCredentials, setIsCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    portalName: "",
    portalUrl: "",
    username: "",
    password: "",
    remarks: "",
  });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyDocId, setVerifyDocId] = useState(null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [expenseData, setExpenseData] = useState({
    amount: "",
    expenseType: "",
    description: "",
    expenseDate: "",
  });

  useEffect(() => {
    dispatch(getOperationProjectDetailById({ projectId, userId }));
    dispatch(getAllMilestoneStatusesForOperations());
    dispatch(getClientLogInCredentialDetailForPortal({ projectId, userId }));
    dispatch(getApplicantTypeList({ page: 1, size: 1000 }));
  }, [projectId]);

  useEffect(() => {
    if (detailedData?.milestones?.length > 0) {
      const first = detailedData.milestones[0];
      setSelectedMilestone(first);

      dispatch(
        getHistoryByMileStoneIdAndProjectId({
          milestoneId: first.milestoneId,
          projectId: first.projectId,
          userId,
        }),
      );
    }
  }, [detailedData]);

  const handleChangeAssignee = () => {
    dispatch(updateAssigneeForMileStone(assigneeObj))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Assignee updated successfully !.",
            color: "success",
          });
          assigneeModal.onClose();
          dispatch(getOperationProjectDetailById({ projectId, userId }));
          setAssigneeObj({
            assignmentId: null,
            newUserId: null,
            reassignmentReason: "",
            changedById: null,
          });
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleStatusChange = () => {
    dispatch(updateAssignmentStatusForMileStone(statusObj))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Status updated successfully !.",
            color: "success",
          });
          setStatusObj({
            assignmentId: null,
            newStatusName: "",
            statusReason: "",
            changedById: null,
          });
          statusModal.onClose();
          dispatch(getOperationProjectDetailById({ projectId, userId }));
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch((error) => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    dispatch(addClientLogInCredentialForPortal({ projectId, userId, data }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Client login credentials is added !.",
            color: "success",
          });
          setCredentials({
            portalName: "",
            portalUrl: "",
            username: "",
            password: "",
            remarks: "",
          });
          setIsCredentials(false);
          dispatch(
            getClientLogInCredentialDetailForPortal({ projectId, userId }),
          );
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  useEffect(() => {
    if (detailedData?.milestones?.length > 0) {
      dispatch(
        getHistoryByMileStoneIdAndProjectId({
          milestoneId: detailedData?.milestones?.[0]?.milestoneId,
          projectId: detailedData?.milestones?.[0]?.projectId,
          userId,
        }),
      );
    }
  }, [detailedData]);

  const handleUpdateApplicantType = (applicantTypeId) => {
    dispatch(updateApplicantTypeInProject({ applicantTypeId, projectId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Applicant type updated successfully !.",
            color: "success",
          });
          dispatch(getOperationProjectDetailById({ projectId, userId }));
          dispatch(
            getRequiredDocumentsByProductId({
              userId,
              projectId,
            }),
          );
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(documentSchema(isPermanent)),
    defaultValues: {
      fileName: "",
      fileSizeKb: "",
      companyDocSourceId: "",
      fileFormat: "",
      expiryDate: "",
      remarks: "",
      isFromCompanyDoc: false,
      isPermanent: false,
    },
  });

  const {
    control: verifyControl,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    reset: verifyReset,
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      newStatus: "",
      remarks: "",
    },
  });

  const openUploadForDoc = (doc) => {
    setSelectedDoc(doc);

    // reset form each time you open for a new card
    reset({
      fileName: doc?.fileName || "",
      fileSizeKb: doc?.fileSizeKb || "",
      companyDocSourceId: doc?.companyDocSourceId || "",
      fileFormat: doc?.fileFormat || "",
      expiryDate: doc?.expiryDate || "",
      remarks: doc?.remarks || "",
      isFromCompanyDoc: !!doc?.isFromCompanyDoc,
      isPermanent: !!doc?.permanent || !!doc?.isPermanent,
    });

    docModal.onOpen();
  };

  const openVerify = (doc) => {
    setVerifyDocId(doc.uploadId);
    verifyReset({
      newStatus: "",
      remarks: "",
    });
    verifyModal.onOpen();
  };

  const handleVerifyDocument = (values) => {
    const payload = {
      newStatus: values.newStatus,
      remarks: values.remarks,
      changedById: Number(userId), // NOT in form schema
    };

    dispatch(
      updateDocumentStatus({
        documentId: verifyDocId,
        data: payload,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Document verified successfully!",
          color: "success",
        });
        verifyModal.onClose();
        dispatch(
          getRequiredDocumentsByProductId({
            userId,
            projectId,
          }),
        );
      } else {
        addToast({
          title: "Something went wrong!",
          color: "danger",
        });
      }
    });
  };

  const onDocumentSubmit = (data) => {
    data.projectId = Number(projectId);
    data.requiredDocumentId = Number(selectedDoc.documentId);
    data.uploadedById = Number(userId);
    data.createdById = Number(userId);
    dispatch(uploadDocumentInProjects({ projectId, data }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Doucment uploaded successfully !.",
            color: "success",
          });
          reset();
          docModal.onClose();
          dispatch(
            getRequiredDocumentsByProductId({
              userId,
              projectId,
            }),
          );
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  useEffect(() => {
    dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
  }, []);

  const handleReply = (commentId) => {
    setReplyParentId(commentId);
    commentModal.onOpen();
  };

  const handleFilterChange = (value) => {
    if (value === "ALL") {
      dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
    } else {
      dispatch(
        getActivitiesByTypeAndProjectId({
          projectId,
          type: value,
          page: 1,
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
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Comment added successfully !.",
            color: "success",
          });
          commentModal.onClose();
          setCommentText("");
          setReplyParentId(null);
          setActivityType("ALL");
          dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleAddNote = () => {
    dispatch(
      addNoteInProject({
        projectId,
        data: { noteText, createdByUserId: Number(userId) },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Note added successfully !.",
            color: "success",
          });
          noteModal.onClose();
          setNoteText("");
          setActivityType("ALL");
          dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
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
        addToast({
          title: "Expense added successfully !.",
          color: "success",
        });
        expenseModal.onClose();
        setExpenseData({
          amount: "",
          expenseType: "",
          description: "",
          expenseDate: "",
        });
        setActivityType("ALL");
        dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
      } else {
        addToast({
          title: resp?.payload?.status,
          color: "danger",
          description: resp?.payload?.message,
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between gap-3 px-3">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="font-medium">
                {detailedData?.projectDetails?.name}
              </h1>
              <h3 className="text-default-500 text-xs">
                {detailedData?.projectDetails?.projectNo}{" "}
                {detailedData?.projectDetails?.date &&
                  `(created date : ${dayjs(detailedData?.projectDetails?.createdDate).format("DD-MM-YYYY")})`}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />{" "}
              <h3 className="text-sm font-medium">
                {detailedData?.projectDetails?.companyName}
              </h3>
            </div>
            {detailedData?.projectDetails?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4" />{" "}
                <div className="flex flex-col ">
                  <p className="text-sm">
                    {[
                      detailedData?.projectDetails?.address,
                      detailedData?.projectDetails?.city,
                      detailedData?.projectDetails?.state,
                      detailedData?.projectDetails?.country,
                    ].join(",")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4" />{" "}
              <div className="flex flex-col ">
                <p className="text-sm">
                  Last updated :{" "}
                  {dayjs(detailedData?.projectDetails?.updatedDate).format(
                    "DD-MM-YYYY",
                  )}
                </p>
              </div>
            </div>

            {(department === "CRT" || adminRole) &&
              detailedData?.projectDetails?.contacts?.length > 0 &&
              detailedData?.projectDetails?.contacts?.map((contact) => (
                <>
                  <div className="flex items-start gap-2 w-full">
                    <User2 className="!w-4 !h-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">
                        Client name :{" "}
                        {`${contact.title} ${contact.name}, ${contact?.designation}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4" />{" "}
                    <div className="flex flex-col ">
                      <p className="text-sm">Phone : {contact.contactNo}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4" />{" "}
                    <div className="flex flex-col ">
                      <p className="text-sm">
                        Email : {contact.emails || "N/A"}
                      </p>
                    </div>
                  </div>
                </>
              ))}

            {/* <Progress
              label={"Completed"}
              aria-label="Downloading..."
              className="max-w-md"
              color="success"
              showValueLabel={true}
              size="sm"
              value={100}
            /> */}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <Button
              radius="sm"
              onPress={() => {
                onOpen();
                dispatch(
                  getRequiredDocumentsByProductId({
                    userId,
                    projectId,
                  }),
                );
              }}
            >
              Documents
            </Button>
            <Button radius="sm" onPress={clientModal.onOpen}>
              Client login credentials
            </Button>
          </div>
          {/* <div className="flex items-center gap-1.5">
            <h3 className="text-xl font-medium">Due Amount</h3>
            <h3 className="text-xl font-medium">:</h3>
            <h3 className="text-xl font-medium">₹ 0</h3>
          </div> */}
        </div>
        {/* <Dropdown>
          <DropdownTrigger>
            <Button variant="light" isIconOnly radius="full">
              <EllipsisVertical />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem
              key="documents"
              startContent={<BookText />}
              onPress={() => {
                onOpen();
                dispatch(
                  getRequiredDocumentsByProductId({
                    userId,
                    projectId,
                  }),
                );
              }}
            >
              Documents
            </DropdownItem>
            <DropdownItem
              key="clientLoginDetails"
              startContent={<User2 />}
              onPress={clientModal.onOpen}
            >
              Client login credentials
            </DropdownItem>
          </DropdownMenu>
        </Dropdown> */}
      </div>

      <div className="max-h-[70vh] overflow-auto py-2.5">
        <div className="grid grid-cols-4 gap-4 h-[65vh]">
          {/* LEFT SIDEBAR - MILESTONES */}
          <div className="col-span-1 border rounded-xl p-3 overflow-auto">
            <h3 className="font-semibold mb-3">Milestones</h3>

            {detailedData?.milestones?.map((mile, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedMilestone(mile);
                  dispatch(
                    getHistoryByMileStoneIdAndProjectId({
                      milestoneId: mile.milestoneId,
                      projectId: mile.projectId,
                      userId,
                    }),
                  );
                }}
                className={`p-3 mb-2 rounded-lg cursor-pointer border 
        ${
          selectedMilestone?.milestoneId === mile.milestoneId
            ? "bg-blue-50 border-blue-400"
            : "hover:bg-gray-50"
        }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">
                    {mile.milestoneName}
                  </span>

                  <Chip size="sm" color={statusColors[mile?.status]}>
                    {mile?.status}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
          {/* CENTER CONTENT */}
          <div className="col-span-2 border rounded-xl overflow-auto">
            {selectedMilestone && (
              <>
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 rounded-t-xl mb-2.5">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-semibold text-lg">
                      {selectedMilestone.milestoneName}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      {selectedMilestone?.assignedUser ? (
                        <div className="flex items-center gap-2 px-3 py-1 border rounded-md bg-gray-50 text-sm">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-gray-700">
                              {selectedMilestone?.assignedUser?.fullName}
                            </span>

                            <span className="text-gray-400 text-xs">
                              {selectedMilestone?.assignedUser?.email}{" "}
                            </span>
                          </div>

                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => {
                              assigneeModal.onOpen();

                              dispatch(
                                getUsersListByDepartmentId(
                                  selectedMilestone?.departmentId,
                                ),
                              );

                              setAssigneeObj((prev) => ({
                                ...prev,
                                assignmentId: selectedMilestone?.id,
                                changedById: userId,
                              }));
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className=" flex items-center gap-2 px-3 py-1 border rounded-md bg-gray-50 text-sm text-gray-400 italic">
                          Select Assignee
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => {
                              assigneeModal.onOpen();

                              dispatch(
                                getUsersListByDepartmentId(
                                  selectedMilestone?.departmentId,
                                ),
                              );

                              setAssigneeObj((prev) => ({
                                ...prev,
                                assignmentId: selectedMilestone?.id,
                                changedById: userId,
                              }));
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <Chip
                        className="cursor-pointer"
                        onClick={() => {
                          statusModal.onOpen();
                          setStatusObj((prev) => ({
                            ...prev,
                            newStatusName: selectedMilestone?.status,
                            assignmentId: selectedMilestone?.id,
                            changedById: userId,
                          }));
                        }}
                        color={statusColors[selectedMilestone?.status]}
                      >
                        {selectedMilestone?.status}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Timeline / Tasks */}
                <div className="space-y-3 px-2.5">
                  {mileStoneHistoryDetail?.assignmentEvents?.map(
                    (history, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 flex flex-col gap-3"
                      >
                        <div className="p-3 flex gap-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>

                          <div>
                            <p className="text-blue-600 text-sm font-medium">
                              {history?.reason || "N/A"}
                            </p>

                            <p className="text-xs text-gray-500">
                              Assigned to:{" "}
                              {history?.assignedToName || "Unassigned"}
                            </p>

                            <p className="text-xs text-gray-400">
                              Assigned by {history?.assignedByName} •{" "}
                              {dayjs(history?.date).format(
                                "DD MMM YYYY , HH:mm a",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT TIMELINE */}
          <div className="col-span-1 border rounded-xl overflow-hidden relative flex flex-col h-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b p-3">
              <div className="flex gap-2 justify-between items-center w-full">
                <h3 className="font-semibold text-sm text-nowrap">
                  Activity Timeline
                </h3>

                <Select
                  size="sm"
                  selectedKeys={[activityType]}
                  onSelectionChange={(keys) => {
                    handleFilterChange(Array.from(keys)[0]);
                  }}
                >
                  <SelectItem key="ALL">All</SelectItem>
                  <SelectItem key="COMMENT">Comments</SelectItem>
                  <SelectItem key="NOTE">Notes</SelectItem>
                  <SelectItem key="EXPENSE">Expenses</SelectItem>
                </Select>
              </div>

              <div className="flex gap-2 mt-2 w-full">
                <Button size="sm" onPress={() => commentModal.onOpen()}>
                  Comment
                </Button>

                <Button size="sm" onPress={() => noteModal.onOpen()}>
                  Note
                </Button>

                <Button size="sm" onPress={() => expenseModal.onOpen()}>
                  Expense
                </Button>
              </div>
            </div>

            {/* Scrollable Activity Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activities.map(
                (activity) =>
                  activity?.details && (
                    <ActivityItem
                      key={activity.activityId}
                      activity={activity}
                      onReply={handleReply}
                    />
                  ),
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent p-2 text-center border-t">
              <Link
                className="text-xs"
                variant="light"
                // to={`/erp/${userId}/operation/projects/${projectId}/projectDetail/activities`}
                to={`activities`}
              >
                See All
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Documents
              </ModalHeader>
              <ModalBody>
                <NewSelect
                  label={"Select applicant type"}
                  labelKey={"name"}
                  valueKey={"id"}
                  data={applicantTypeList?.length > 0 ? applicantTypeList : []}
                  onChange={(e) => handleUpdateApplicantType(e)}
                />

                <div className="max-h-[80vh] overflow-auto grid grid-cols-2 gap-2">
                  {requiredDocsList?.map((doc, idx) => {
                    const hasFile = !!doc?.fileUrl;

                    const openPreview = () => {
                      const raw = String(doc?.fileUrl || "").trim();
                      const fixed =
                        raw.includes("amazonaws.com") &&
                        !raw.includes("amazonaws.com/")
                          ? raw.replace("amazonaws.com", "amazonaws.com/")
                          : raw;

                      const href =
                        fixed.startsWith("http://") ||
                        fixed.startsWith("https://")
                          ? fixed
                          : `https://${fixed}`;

                      window.open(href, "_blank", "noopener,noreferrer");
                    };

                    return (
                      <Card
                        key={`doc${idx}`}
                        className="rounded-2xl shadow-sm border border-gray-200 bg-white my-1.5"
                      >
                        <CardBody className="p-4 flex flex-col gap-4">
                          {/* HEADER */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-[14px] font-semibold text-gray-800">
                                {doc?.documentName}
                              </h4>

                              <div className="flex gap-2 mt-2 flex-wrap">
                                {doc?.mandatory && (
                                  <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-md font-medium">
                                    Mandatory
                                  </span>
                                )}

                                {doc?.permanent && (
                                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-md font-medium">
                                    Permanent
                                  </span>
                                )}

                                {doc?.expired && (
                                  <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-md font-medium">
                                    Expired
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* STATUS BADGE */}
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                doc?.status === "VERIFIED"
                                  ? "bg-green-100 text-green-700"
                                  : doc?.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {doc?.status}
                            </span>
                          </div>

                          {/* FILE SECTION */}
                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              Uploaded File
                            </p>

                            {hasFile ? (
                              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                <div className="flex items-center gap-3">
                                  {/* PDF ICON */}
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <PdfIcon className="text-red-500 w-5 h-5" />
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                                      {doc?.fileName || "Document.pdf"}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {doc?.fileSizeKb
                                        ? `${doc.fileSizeKb} KB`
                                        : ""}
                                    </span>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700 rounded-full px-4"
                                  onPress={openPreview}
                                >
                                  Download
                                </Button>
                              </div>
                            ) : (
                              <div className="text-sm italic text-gray-400">
                                No file uploaded
                              </div>
                            )}
                          </div>

                          {/* EXPIRY */}
                          <div className="text-sm text-gray-500">
                            {doc?.expiryDate
                              ? `Expiry: ${dayjs(doc.expiryDate).format("DD MMM YYYY")}`
                              : doc?.permanent
                                ? "No expiry date"
                                : "No expiry date"}
                          </div>

                          {/* VERIFY BUTTON ONLY IF NEEDED */}
                          {doc?.status !== "VERIFIED" && hasFile && (
                            <div className="pt-2">
                              <Button
                                size="sm"
                                color="primary"
                                className="rounded-full px-6"
                                onPress={() => openVerify(doc)}
                              >
                                Verify
                              </Button>
                            </div>
                          )}

                          {doc?.status !== "UPLOADED" && (
                            <Button
                              size="sm"
                              color="secondary"
                              onPress={() => openUploadForDoc(doc)}
                            >
                              Upload
                            </Button>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                {/* <Button color="primary" onPress={onClose}>
                  Action
                </Button> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={assigneeModal.isOpen}
        onOpenChange={assigneeModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update assignee
              </ModalHeader>
              <ModalBody className="max-h-[90vh] overflow-auto">
                <NewSelect
                  label={"Select assignee"}
                  isRequired={true}
                  data={userListBydepartment || []}
                  labelKey={"fullName"}
                  valueKey={"id"}
                  value={assigneeObj?.newUserId}
                  onChange={(e) => {
                    setAssigneeObj((prev) => ({
                      ...prev,
                      newUserId: e,
                      changedById: userId,
                    }));
                  }}
                />
                <Textarea
                  label={"Reason"}
                  value={assigneeObj?.reassignmentReason}
                  onChange={(e) => {
                    setAssigneeObj((prev) => ({
                      ...prev,
                      reassignmentReason: e.target.value,
                      changedById: userId,
                    }));
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={!assigneeObj?.newUserId}
                  onPress={handleChangeAssignee}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update status
              </ModalHeader>
              <ModalBody className="max-h-[90vh] overflow-auto">
                <NewSelect
                  isRequired={true}
                  errorMessage={"please select status"}
                  label={"Select status"}
                  data={milestoneStatusList || []}
                  labelKey={"name"}
                  valueKey={"name"}
                  value={statusObj?.newStatusName}
                  onChange={(e) => {
                    setStatusObj((prev) => ({
                      ...prev,
                      newStatusName: e,
                      changedById: userId,
                    }));
                  }}
                />
                <Textarea
                  label={"Reason"}
                  isRequired
                  errorMessage="please enter reason"
                  value={statusObj?.statusReason}
                  onChange={(e) => {
                    setStatusObj((prev) => ({
                      ...prev,
                      statusReason: e.target.value,
                      changedById: userId,
                    }));
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleStatusChange}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        isOpen={docModal.isOpen}
        onOpenChange={(open) => {
          docModal.onOpenChange(open);
          if (!open) setSelectedDoc(null);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Upload document
                {selectedDoc?.documentName ? (
                  <span className="text-xs text-default-400">
                    For: {selectedDoc.documentName}
                  </span>
                ) : null}
              </ModalHeader>

              <ModalBody className="max-h-[90vh] overflow-auto">
                <form onSubmit={handleSubmit(onDocumentSubmit)}>
                  <div className="max-h-[60vh] overflow-auto grid grid-cols-2 gap-2.5">
                    <Controller
                      name="fileName"
                      control={control}
                      render={({ field }) => (
                        <FileUploader
                          label={"Upload file"}
                          value={field.value}
                          onChange={(e) => field.onChange(e)}
                        />
                      )}
                    />

                    <Controller
                      name="fileSizeKb"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          isRequired
                          type="number"
                          label="File Size (KB)"
                          isInvalid={!!errors.fileSizeKb}
                          errorMessage={errors.fileSizeKb?.message}
                        />
                      )}
                    />
                    <Controller
                      name="companyDocSourceId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          {...field}
                          type="number"
                          label="Company Doc Source ID"
                          isInvalid={!!errors.companyDocSourceId}
                          errorMessage={errors.companyDocSourceId?.message}
                        />
                      )}
                    />

                    <Controller
                      name="fileFormat"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="File Format"
                          isRequired
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            field.onChange(value);
                          }}
                          isInvalid={!!errors.fileFormat}
                          errorMessage={errors.fileFormat?.message}
                        >
                          <SelectItem key="pdf">PDF</SelectItem>
                          <SelectItem key="png">PNG</SelectItem>
                          <SelectItem key="jpg">JPG</SelectItem>
                          <SelectItem key="docx">DOCX</SelectItem>
                        </Select>
                      )}
                    />

                    <Controller
                      name="isPermanent"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="Document type"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setIsPermanent(value === "true");
                          }}
                          isInvalid={!!errors.isPermanent}
                          errorMessage={errors.isPermanent?.message}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
                          ].map((item) => (
                            <SelectItem
                              key={item.value.toString()}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {isPermanent && (
                      <Controller
                        name="expiryDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            isRequired
                            label="Expiry date"
                            showMonthAndYearPickers
                            minValue={today(getLocalTimeZone())}
                            isInvalid={!!errors.expiryDate}
                            errorMessage={errors.expiryDate?.message}
                            value={field.value ? parseDate(field.value) : null}
                            onChange={(e) =>
                              field.onChange(toCalendarDate(e).toString())
                            }
                          />
                        )}
                      />
                    )}

                    <Controller
                      name="remarks"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Remarks"
                          minRows={3}
                          placeholder="Add remarks..."
                        />
                      )}
                    />

                    <Controller
                      name="isFromCompanyDoc"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          isSelected={field.value}
                          onValueChange={field.onChange}
                        >
                          Is From Company Doc
                        </Checkbox>
                      )}
                    />
                  </div>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="3xl"
        isOpen={clientModal.isOpen}
        onOpenChange={clientModal.onOpenChange}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center gap-1">
                <div>
                  {isCredentials
                    ? "Add client portal login credentials"
                    : "Client portal login credentials"}
                </div>
                {isCredentials ? (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setIsCredentials(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setIsCredentials(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </ModalHeader>
              <ModalBody className="max-h-[90vh] overflow-auto">
                {isCredentials ? (
                  <Form className="w-full" onSubmit={onSubmit}>
                    <div className="w-full grid grid-cols-2 gap-2">
                      <Input
                        label="Portal name"
                        name="portalName"
                        isRequired
                        errorMessage="please ebter portal name"
                        value={credentials?.portalName}
                        onChange={handleChange}
                      />
                      <Input
                        label="Portal URL"
                        name="portalUrl"
                        isRequired
                        errorMessage="please ebter portal URL"
                        value={credentials?.portalUrl}
                        onChange={handleChange}
                      />
                      <Input
                        label="Username"
                        name="username"
                        isRequired
                        errorMessage="please enter username"
                        value={credentials?.username}
                        onChange={handleChange}
                      />
                      <Input
                        label="Password"
                        name="password"
                        isRequired
                        errorMessage="please enter password"
                        value={credentials?.password}
                        onChange={handleChange}
                      />
                      <Textarea
                        label="Remarks"
                        name="remarks"
                        isRequired
                        errorMessage="please enter remark"
                        value={credentials?.remarks}
                        onChange={handleChange}
                      />
                    </div>
                    <ModalFooter className="w-full flex justify-end gap-2">
                      <Button
                        variant="flat"
                        onPress={() => setIsCredentials(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        isDisabled={!isCredentials}
                        type="submit"
                      >
                        Submit
                      </Button>
                    </ModalFooter>
                  </Form>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">
                          {clientLoginPortalCredentials?.companyName}
                        </p>{" "}
                        <span className="text-sm text-default-400">
                          {clientLoginPortalCredentials?.projectNo}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {clientLoginPortalCredentials?.portals?.map(
                        (item, idx) => (
                          <Card className="" key={idx}>
                            <CardHeader>
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">
                                    {item?.portalName}
                                  </h3>
                                  <Chip
                                    size="sm"
                                    color={statusColorCode[item?.status]}
                                  >
                                    {item?.status}
                                  </Chip>
                                </div>
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  className="w-6 h-6 rounded-full bg-none"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardBody>
                              <div className="flex gap-1.5 items-center">
                                <span className="text-default-400 text-tiny">
                                  Portal URL
                                </span>{" "}
                                :{" "}
                                <div className="text-tiny flex flex-wrap">
                                  {item?.portalUrl}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-default-400 text-tiny">
                                    User name
                                  </span>{" "}
                                  :{" "}
                                  <span className="text-tiny">
                                    {item?.username}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-default-400 text-tiny">
                                    Password
                                  </span>{" "}
                                  :{" "}
                                  <span className="text-tiny">
                                    {item?.password}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-default-400 text-tiny">
                                    Remarks
                                  </span>{" "}
                                  :{" "}
                                  <span className="text-tiny">
                                    {item?.remarks}
                                  </span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              {/* <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={verifyModal.isOpen}
        onOpenChange={verifyModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Verify Document</ModalHeader>

              <ModalBody>
                <form
                  onSubmit={handleVerifySubmit(handleVerifyDocument)}
                  className="flex flex-col gap-4"
                >
                  {/* Status Select */}
                  <Controller
                    name="newStatus"
                    control={verifyControl}
                    render={({ field }) => (
                      <Select
                        label="Select Status"
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0];
                          field.onChange(value);
                        }}
                        isInvalid={!!verifyErrors.newStatus}
                        errorMessage={verifyErrors.newStatus?.message}
                      >
                        <SelectItem key="VERIFIED">VERIFIED</SelectItem>
                        <SelectItem key="REJECTED">REJECTED</SelectItem>
                      </Select>
                    )}
                  />

                  {/* Remarks */}
                  <Controller
                    name="remarks"
                    control={verifyControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Remarks"
                        minRows={3}
                        isInvalid={!!verifyErrors.remarks}
                        errorMessage={verifyErrors.remarks?.message}
                      />
                    )}
                  />

                  <ModalFooter className="px-0">
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

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

      <Modal
        size="2xl"
        isOpen={expenseModal.isOpen}
        onOpenChange={expenseModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handleAddExpense(data);
              }}
            >
              <ModalHeader>Add Expense</ModalHeader>
              <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Input
                  label="Expense Type"
                  name="expenseType"
                  isRequired
                  errorMessage="please enter expense type"
                  value={expenseData.expenseType}
                  onChange={(e) =>
                    setExpenseData((prev) => ({
                      ...prev,
                      expenseType: e.target.value,
                    }))
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
                    setExpenseData((prev) => ({
                      ...prev,
                      amount: allowOnlyNumbers(e.target.value),
                    }))
                  }
                />

                <Input
                  label="Currency"
                  name="currency"
                  isRequired
                  errorMessage="please enter currency"
                  value={expenseData.currency}
                  onChange={(e) =>
                    setExpenseData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
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
                    setExpenseData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
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
    </div>
  );
};

export default ProjectDetails;
