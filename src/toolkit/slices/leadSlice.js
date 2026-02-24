import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";
import axios from "axios";

export const getAllLeadsByFilter = createAsyncThunk(
  "getAllLeadsByFilter",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/lead/getAllLeadV1?page=${data?.page}&size=${data?.size}`,
      data
    );
    return response.data;
  }
);

export const searchLeads = createAsyncThunk("searchLeads", async (data) => {
  const response = await api.get(
    `/leadService/api/v1/lead/searchLead?searchParam=${data.input}&userId=${data.id}`
  );
  return response.data;
});

export const getAllLeadCount = createAsyncThunk(
  "getAllLeadCount",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/lead/getAllLeadCount`,
      data
    );
    return response.data;
  }
);

export const getAllLeadsForExport = createAsyncThunk(
  "getAllLeadsForExport",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/lead/getAllLeadForImport`,
      data
    );
    return response.data;
  }
);

export const createLeads = createAsyncThunk("createLeads", async (data) => {
  const response = await api.post(`/leadService/api/v1/lead/createLead`, data);
  return response.data;
});

export const handleDeleteSingleLead = createAsyncThunk(
  "handleDeleteSingleLead",
  async (data) => {
    const response = await api.delete(
      `/leadService/api/v1/lead/deleteLead?leadId=${data?.id}&userId=${data?.userId}`
    );
    return response.data;
  }
);

export const deleteMultipleLeads = createAsyncThunk(
  "deleteMultipleLeads",
  async (data) => {
    const response = await api.delete(
      `/leadService/api/v1/lead/deleteMultiLead`,
      {
        data: data,
      }
    );
    return response.data;
  }
);

export const multiAssignedLeads = createAsyncThunk(
  "multiAssignedLeads",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/lead/updateMultiLeadAssigne`,
      data
    );
    return response.data;
  }
);

export const getSingleLeadDataByLeadId = createAsyncThunk(
  "getSingleLeadData",
  async ({ leadId, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/lead/getSingleLeadData?leadId=${leadId}&currentUserId=${userId}`
    );
    return response.data;
  }
);

export const updateSingleLeadName = createAsyncThunk(
  "updateSingleLeadName",
  async ({ leadName, leadId, userId }) => {
    const response = await api.put(
      `/leadService/api/v1/lead/updateLeadName?leadName=${leadName}&leadId=${leadId}&userId=${userId}`
    );
    return response.data;
  }
);

export const createRemakWithFile = createAsyncThunk(
  "createRemark",
  async (data) => {
    const response = await api.post(`/leadService/api/v1/createRemarks`, data);
    return response.data;
  }
);

export const getAllRemarkAndCommnts = createAsyncThunk(
  "getAllRemarks",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/getAllRemarks?leadId=${id}`
    );
    return response.data;
  }
);

export const updateRemarks = createAsyncThunk("updateRemarks", async (data) => {
  const response = await api.put(`/leadService/api/v1/updateRemark`, data);
  return response.data;
});

export const deleteRemarks = createAsyncThunk("deleteRemarks", async (data) => {
  const response = await api.delete(
    `/leadService/api/v1/deleteRemark?remarkId=${data?.remarkId}&currentUser=${data?.userId}&leadId=${data?.leadId}`
  );
  return response.data;
});

export const getEstimateListByUserId = createAsyncThunk(
  "getEstimateListByUserId",
  async ({ userId, status }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllEstimateFormByUserId?status=${status}&userId=${userId}`
    );
    return response.data;
  }
);

export const getProjectAction = createAsyncThunk(
  "getProjectAction",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/project/getAllProject?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllLeadUser = createAsyncThunk(
  "getAllLeadUserss",
  async (userid) => {
    const response = await api.get(
      `/leadService/api/v1/users/getAllUserByHierarchy?userId=${userid}`
    );
    return response.data;
  }
);

export const updateAddressInLeads = createAsyncThunk(
  "updateAddressInLeads",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/lead/addAddressInLead`,
      data
    );
    return response.data;
  }
);

export const updateIndustriesInLeads = createAsyncThunk(
  "updateIndustriesInLeads",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/lead/addIndustryInLead`,
      data
    );
    return response.data;
  }
);

export const changeLeadAssigneeLeads = createAsyncThunk(
  "changeLeadAssignee",
  async ({ leadId, assigneeId, userId }) => {
    const response = await api.put(
      `/leadService/api/v1/lead/updateAssignee?leadId=${leadId}&userId=${assigneeId}&updatedById=${userId}`
    );
    return response.data;
  }
);

export const updateLeadStatus = createAsyncThunk(
  "updateLeadStatus",
  async ({ leadId, statusId, userId }) => {
    const response = await api.put(
      `/leadService/api/v1/status/updateLeadStatus?leadId=${leadId}&statusId=${statusId}&currentUserId=${userId}`
    );
    return response.data;
  }
);

export const createLeadContacts = createAsyncThunk(
  "createLeadContact",
  async (createContact) => {
    const response = await api.post(
      `/leadService/api/v1/client/createClient`,
      createContact
    );
    return response.data;
  }
);

export const updateLeadsContact = createAsyncThunk(
  "updateContacts",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/client/updateClientInfo`,
      data
    );
    return response.data;
  }
);
export const deleteLeadContact = createAsyncThunk(
  "deleteLeadContacts",
  async ({ leadId, clientId, userId }) => {
    const response = await api.delete(
      `/leadService/api/v1/client/deleteClient?leadId=${leadId}&clientId=${clientId}&currentUserId=${userId}`
    );
    return response.data;
  }
);

export const getAllEstimateByUserId = createAsyncThunk(
  "getAllEstimateByUserId",
  async ({ userId, page, size,data }) => {
    const response = await api.post(
      `/accountService/api/v1/estimates/all?userId=${userId}&page=${page}&size=${size}`,data
    );
    return response.data;
  }
);

export const getTotalCountOfEstimate = createAsyncThunk(
  "getTotalCountOfEstimate",
  async ({userId,data}) => {
    const response = await api.post(
      `/accountService/api/v1/estimates/count?userId=${userId}`,data
    );
    return response.data;
  }
);

export const getAllProposalTemplateList = createAsyncThunk(
  "getAllProposalTemplateList",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllProposalTempalte`
    );
    return response.data;
  }
);

export const getAllBrochureList = createAsyncThunk(
  "getAllBrochureList",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/brochureBook/getAllBrochureBook`
    );
    return response.data;
  }
);

export const sendProposal = createAsyncThunk("sendProposal", async (data) => {
  const response = await api.post(
    `/leadService/api/v1/proposal/createProposal`,
    data
  );
  return response.data;
});

export const editLeadPropposal = createAsyncThunk(
  "editPropposal",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/proposal/editProposal`,
      data
    );
    return response.data;
  }
);

export const getProposalDataByLeadId = createAsyncThunk(
  "getProposalDataByLeadId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/proposal/getProposalByLeadId?proposalId=${id}`
    );
    return response.data;
  }
);

export const getEstimateByLeadId = createAsyncThunk(
  "getEstimateByLeadId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateByLeadId?leadId=${id}`
    );
    return response.data;
  }
);

export const getQualityLeadsReport = createAsyncThunk(
  "getQualityLeadsReport",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/leadRepot/getAllAutoLeadQualityReport`,
      data
    );
    return response.data;
  }
);

export const getAllProposalByUserIdForManager = createAsyncThunk(
  "getAllProposalByUserIdForManager",
  async ({ id, page, size, status }) => {
    const response = await api.get(
      `/leadService/api/v1/proposal/getAllProposalForManger?userId=${id}&page=${page}&size=${size}&status=${status}`
    );
    return response.data;
  }
);

export const getAllPropsalListCount = createAsyncThunk(
  "getAllPropsalListCount",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/proposal/getAllProposalForMangerCount?userId=${id}`
    );
    return response.data;
  }
);

export const proposalApprovalByManager = createAsyncThunk(
  "proposalApprovalByManager",
  async ({ proposalId, status, userId, comment }) => {
    const response = await api.put(
      `/leadService/api/v1/proposal/approvedProposalByManager?proposalId=${proposalId}&status=${status}&userId=${userId}&comment=${comment}`
    );
    return response.data;
  }
);

export const getAllAutoHistoryList = createAsyncThunk(
  "getAllAutoHistory",
  async ({ page, size, data }) => {
    const response = await api.post(
      `/leadService/api/v1/lead/getAllAutoHistoryDetailWithDateFilterNew?page=${page}&size=${size}`,
      data
    );
    return response.data;
  }
);

export const getAllAutoHistroryCount = createAsyncThunk(
  "getAllAutoHistroryCount",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/lead/getAllAutoHistoryDetailWithDateFilterCount`,
      data
    );
    return response.data;
  }
);

export const getAllAutoHistoryForExportByDate = createAsyncThunk(
  "getAllAutoHistoryForExportByDate",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/lead/getAutoHistoryDetailsForExportWithDateFilterNew`,
      data
    );
    return response.data;
  }
);

export const getAllHistory = createAsyncThunk(
  "allLeadsDataHistorys",
  async (id) => {
    const allHistoryRes = await api.get(
      `/leadService/api/v1/leadHistory/getAllLeadHistory?leadId=${id}`
    );
    return allHistoryRes?.data;
  }
);

export const getAllTaskData = createAsyncThunk("getAllTaskData", async (id) => {
  const response = await api.get(
    `/leadService/api/v1/task/getAllTaskByLead?leadId=${id}`
  );
  return response.data;
});

export const createNewLeadTask = createAsyncThunk(
  "newLeadTask",
  async (taskData) => {
    const response = await api.post(
      `/leadService/api/v1/task/createTask`,
      taskData
    );
    return response.data;
  }
);

export const updateLeadTask = createAsyncThunk(
  "updateLeadTasd",
  async (addNewTask) => {
    const response = await api.post(
      `/leadService/api/v1/task/updateTaskData`,
      addNewTask
    );
    return response.data;
  }
);

export const deleteTask = createAsyncThunk("deleteTask", async (data) => {
  const response = await api.delete(
    `/leadService/api/v1/task/deleteTaskById?taskId=${data?.id}&currentUserId=${data?.userId}`
  );
  return response.data;
});

export const createEstimateForApprovals = createAsyncThunk(
  "createEstimateForApprovals",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/leadEstimate/createEstimateForm`,
      data
    );
    return response.data;
  }
);

export const editEstimateForApprovals = createAsyncThunk(
  "editEstimateForApprovals",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/editEstimateForm`,
      data
    );
    return response.data;
  }
);

export const editLeadEstimate = createAsyncThunk(
  "editEstimate",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/editEstimateInvoice`,
      data
    );
    return response.data;
  }
);

export const createEstimate = createAsyncThunk(
  "createEstimate",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/leadEstimate/createEstimate`,
      data
    );
    return response.data;
  }
);

export const updateGstTypeInEstimate = createAsyncThunk(
  "updateGstTypeInEstimate",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/updateCompanyGst?companyId=${data?.companyId}&companyType=${data?.companyType}&gstType=${data?.gstType}&bussinessType=${data?.businessType}&gstNo=${data?.gstNo}&panNo=${data?.panNo}`
    );
    return response.data;
  }
);

export const getAutomationLeads = createAsyncThunk(
  "getAutomationLeads",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/leadRepot/getAllAutoReport`,
      data
    );
    return response.data;
  }
);

export const searchIvrLeads = createAsyncThunk(
  "searchIvrLeads",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/lead/leadSearchByQuality?searchParam=${data.input}&userId=${data.id}`
    );
    return response.data;
  }
);

export const getSaleReportByFilter = createAsyncThunk(
  "getSaleReportByFilter",
  async ({ page, size, data }) => {
    const response = await api.post(
      `/leadService/api/v1/salesReport/getAllSalesAssigneeReport?page=${page}&size=${size}`,
      data
    );
    return response.data;
  }
);

export const getSaleReportByFilterCount = createAsyncThunk(
  "getSaleReportByFilterCount",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesReport/getAllSalesAssigneeReportCount`,
      data
    );
    return response.data;
  }
);

export const getSalesReportByFilterForExport = createAsyncThunk(
  "getSalesReportByFilterForExport",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesReport/getAllSalesAssigneeReportForExport`,
      data
    );
    return response.data;
  }
);

export const handleViewHistory = createAsyncThunk(
  "viewHistory",
  async ({ userId, leadId }) => {
    const response = await api.put(
      `/leadService/api/v1/lead/viewHistoryCreate?userId=${userId}&leadId=${leadId}`
    );
    return response.data;
  }
);

export const handleFlagByQualityTeam = createAsyncThunk(
  "handleFlagByQualityTeam",
  async ({ currentUerId, leadId, isMarked }) => {
    const response = await api.put(
      `/leadService/api/v1/lead/addReopenByQuality?currentUerId=${currentUerId}&leadId=${leadId}&isMarked=${isMarked}`
    );
    return response.data;
  }
);

export const docsUploadListInEstimate = createAsyncThunk(
  "docsUploadListInEstimate",
  async (estimateId) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getRequiredDocByEstimate?estimateId=${estimateId}`
    );
    return response.data;
  }
);

export const addDocumentsInEstimate = createAsyncThunk(
  "addDocumentsInEstimate",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/addRequiredDocInEstimate`,
      data
    );
    return response.data;
  }
);

export const getAllLeadsTask = createAsyncThunk(
  "getAllLeadsTask",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/task/getAllTaskByAssignee?assigneeId=${userId}`
    );
    return response.data;
  }
);

export const transferLeadToAnotherUser = createAsyncThunk(
  "transferLeadToAnotherUser",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/lead/updateMultiTransferLead`,
      data
    );
    return response.data;
  }
);

export const updateLeadSource = createAsyncThunk(
  "updateLeadSource",
  async ({ sourceName, leadId, userId }) => {
    const response = await api.put(
      `/leadService/api/v1/lead/updateLeadSource?sourceName=${sourceName}&leadId=${leadId}&userId=${userId}`
    );
    return response.data;
  }
);

export const getAllChildLeads = createAsyncThunk(
  "getAllChildLeads",
  async (leadId) => {
    const response = await api.post(
      `/leadService/api/v1/lead/getAllChildLead?leadId=${leadId}`
    );
    return response.data;
  }
);

export const addLeadChild = createAsyncThunk("addLeadChild", async (data) => {
  const response = await api.put(`/leadService/api/v1/lead/addChildLead`, data);
  return response.data;
});

export const updateAutoAssignnee = createAsyncThunk(
  "auto-lead-assignee",
  async (data) => {
    const autoresponse = await api.put(
      `/leadService/api/v1/lead/updateStatusAndAutoSame`,
      data
    );
    return autoresponse?.data;
  }
);

export const getEstimateByLeadIdAndUUID = createAsyncThunk(
  "getEstimateByLeadIdAndUUID",
  async ({ leadId, uuid }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateByLeadIdAndUuid?leadId=${leadId}&uuid=${uuid}`
    );
    return response.data;
  }
);

export const checkPlantSetUpData = createAsyncThunk(
  "checkPlantSetUpData",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/lead/checkPlantSetUp?name=${name}`
    );
    return response.data;
  }
);

export const getAllEstimateForApproval = createAsyncThunk(
  "getAllApprovalForEstimate",
  async (status) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllEstimateForm?status=${status}`
    );
    return response.data;
  }
);

export const getAllEstimateHistory = createAsyncThunk(
  "getAllEstimateHistory",
  async ({ estimateId, name, productSubCategoryId }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateHistoryByFormId?estimateId=${estimateId}&name=${name}&productSubCategoryId=${productSubCategoryId}`
    );
    return response.data;
  }
);

export const approveEstimateApproval = createAsyncThunk(
  "approveEstimateApproval",
  async ({ userId, estimateFormId, comment }) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/approveEstimateForm?userId=${userId}&estimateFormId=${estimateFormId}&comment=${comment}`
    );
    return response.data;
  }
);

export const disApproveEstimateApproval = createAsyncThunk(
  "disApproveEstimateApproval",
  async ({ userId, estimateFormId, comment }) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/disapproveEstimateForm?userId=${userId}&estimateFormId=${estimateFormId}&comment=${comment}`
    );
    return response.data;
  }
);

export const getChildLeadEstimateFlagByParentLeadId = createAsyncThunk(
  "getChildLeadEstimateFlagByParentLeadId",
  async (leadId) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/checkEstimate?leadId=${leadId}`
    );
    return response.data;
  }
);

export const createNewEstimate = createAsyncThunk(
  "createNewEstimate",
  async (data, { rejectWithValue }) => {
    try {
      console.log("dfljkghjksdhkjshjk", data);
      const response = await api.post(`/accountService/api/v1/estimates`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  }
);

export const getNewEstimateByLeadId = createAsyncThunk(
  "getNewEstimateByLeadId",
  async ({ leadId, userId }) => {
    const response = await api.get(
      `/accountService/api/v1/estimates/lead/${leadId}?userId=${userId}`
    );
    return response.data;
  }
);

export const LeadSlice = createSlice({
  name: "leads",
  initialState: {
    allLeads: [],
    leadresponseStatus: "",
    leadDetailLoading: "",
    leadsLoading: "",
    loading: "",
    totalCount: 0,
    allLeadsForExport: [],
    singleLeadData: {},
    remarkData: [],
    estimateListByUserId: [],
    projectsList: [],
    leadUsersList: [],
    estimateList: [],
    totalEstimateCount: 0,
    templateList: [],
    brochureList: [],
    proposalDataDetail: {},
    estimateDetail: {},
    qualityReportList: [],
    proposalList: [],
    proposalCount: 0,
    autoHistoryExportList: [],
    autoExportLoading: "",
    allLeadHistory: [],
    getSingleLeadTask: [],
    autoStatusList: [],
    leadSearchList: [],
    salesReportList: [],
    salesReportListForExport: [],
    salesReportCount: 0,
    salesReportExportLoading: "",
    docsListInEstimate: [],
    allLeadsTaskList: [],
    allChildLeadList: [],
    estimateDetailByUUID: {},
    plantSetupDetail: false,
    estimateApprovalList: [],
    estimateHistoryList: {},
    childLeadFlag: {},
    newEstimateByLeadId: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllLeadsByFilter.pending, (state) => {
      state.leadresponseStatus = "pending";
    });
    builder.addCase(getAllLeadsByFilter.fulfilled, (state, action) => {
      state.allLeads = action.payload;
      state.leadresponseStatus = "success";
    });
    builder.addCase(getAllLeadsByFilter.rejected, (state) => {
      state.leadresponseStatus = "rejected";
    });

    builder.addCase(searchLeads.pending, (state) => {
      state.leadresponseStatus = "pending";
    });
    builder.addCase(searchLeads.fulfilled, (state, action) => {
      state.allLeads = action.payload;
      state.totalCount = action.payload?.length;
      state.leadresponseStatus = "success";
    });
    builder.addCase(searchLeads.rejected, (state) => {
      state.leadresponseStatus = "rejected";
    });

    builder.addCase(getAllLeadCount.pending, (state) => {
      state.historyLoading = "pending";
    });
    builder.addCase(getAllLeadCount.fulfilled, (state, action) => {
      state.historyLoading = "success";
      state.totalCount = action?.payload;
    });
    builder.addCase(getAllLeadCount.rejected, (state) => {
      state.historyLoading = "rejected";
    });

    builder.addCase(getAllLeadsForExport.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLeadsForExport.fulfilled, (state, action) => {
      state.loading = "success";
      state.allLeadsForExport = action?.payload;
    });
    builder.addCase(getAllLeadsForExport.rejected, (state, action) => {
      state.loading = "rejected";
      state.allLeadsForExport = [];
    });

    builder.addCase(getSingleLeadDataByLeadId.pending, (state) => {
      state.leadDetailLoading = "pending";
      state.singleLeadData = {};
    });
    builder.addCase(getSingleLeadDataByLeadId.fulfilled, (state, action) => {
      state.leadDetailLoading = "success";
      state.singleLeadData = action.payload;
    });
    builder.addCase(getSingleLeadDataByLeadId.rejected, (state) => {
      state.leadDetailLoading = "rejected";
      state.singleLeadData = {};
    });

    builder.addCase(getAllRemarkAndCommnts.pending, (state) => {
      state.loading = "pending";
      state.remarkData = [];
    });
    builder.addCase(getAllRemarkAndCommnts.fulfilled, (state, action) => {
      state.loading = "success";
      state.remarkData = action?.payload?.reverse();
    });
    builder.addCase(getAllRemarkAndCommnts.rejected, (state) => {
      state.loading = "rejected";
      state.remarkData = [];
    });

    builder.addCase(getEstimateListByUserId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getEstimateListByUserId.fulfilled, (state, action) => {
      state.loading = "success";
      state.estimateListByUserId = action?.payload;
    });
    builder.addCase(getEstimateListByUserId.rejected, (state) => {
      state.loading = "rejected";
      state.estimateListByUserId = [];
    });

    builder.addCase(getProjectAction.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getProjectAction.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectsList = action?.payload;
    });
    builder.addCase(getProjectAction.rejected, (state) => {
      state.loading = "rejected";
      state.projectsList = [];
    });

    builder.addCase(getAllLeadUser.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLeadUser.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadUsersList = action?.payload;
    });
    builder.addCase(getAllLeadUser.rejected, (state) => {
      state.loading = "rejected";
      state.leadUsersList = [];
    });

    builder.addCase(getAllEstimateByUserId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllEstimateByUserId.fulfilled, (state, action) => {
      state.loading = "success";
      state.estimateList = action?.payload;
    });
    builder.addCase(getAllEstimateByUserId.rejected, (state) => {
      state.loading = "rejected";
      state.estimateList = [];
    });

    builder.addCase(getTotalCountOfEstimate.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalCountOfEstimate.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalEstimateCount = action?.payload;
    });
    builder.addCase(getTotalCountOfEstimate.rejected, (state) => {
      state.loading = "rejected";
      state.totalEstimateCount = 0;
    });

    builder.addCase(getAllProposalTemplateList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProposalTemplateList.fulfilled, (state, action) => {
      state.loading = "success";
      state.templateList = action?.payload;
    });
    builder.addCase(getAllProposalTemplateList.rejected, (state) => {
      state.loading = "rejected";
      state.templateList = [];
    });

    builder.addCase(getAllBrochureList.pending, (state) => {
      state.loading = "pending";
      state.brochureList = [];
    });
    builder.addCase(getAllBrochureList.fulfilled, (state, action) => {
      state.loading = "success";
      state.brochureList = action?.payload;
    });
    builder.addCase(getAllBrochureList.rejected, (state) => {
      state.loading = "rejected";
      state.brochureList = [];
    });

    builder.addCase(getProposalDataByLeadId.pending, (state) => {
      state.loading = "pending";
      state.proposalDataDetail = {};
    });
    builder.addCase(getProposalDataByLeadId.fulfilled, (state, action) => {
      state.loading = "success";
      state.proposalDataDetail = action?.payload;
    });
    builder.addCase(getProposalDataByLeadId.rejected, (state) => {
      state.loading = "rejected";
      state.proposalDataDetail = {};
    });

    builder.addCase(getEstimateByLeadId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getEstimateByLeadId.fulfilled, (state, action) => {
      state.loading = "success";
      state.estimateDetail = action?.payload;
    });
    builder.addCase(getEstimateByLeadId.rejected, (state, action) => {
      state.estimateDetail = {};
      state.loading = "rejected";
    });

    builder.addCase(getQualityLeadsReport.pending, (state) => {
      state.loading = "pending";
      state.qualityReportList = [];
    });
    builder.addCase(getQualityLeadsReport.fulfilled, (state, action) => {
      state.loading = "success";
      state.qualityReportList = action?.payload;
    });
    builder.addCase(getQualityLeadsReport.rejected, (state) => {
      state.loading = "rejected";
      state.qualityReportList = [];
    });

    builder.addCase(getAllProposalByUserIdForManager.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllProposalByUserIdForManager.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.proposalList = action?.payload;
      }
    );
    builder.addCase(getAllProposalByUserIdForManager.rejected, (state) => {
      state.proposalList = [];
      state.loading = "rejected";
    });

    builder.addCase(getAllPropsalListCount.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPropsalListCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.proposalCount = action?.payload;
    });
    builder.addCase(getAllPropsalListCount.rejected, (state, action) => {
      state.proposalCount = 0;
      state.loading = "rejected";
    });

    builder.addCase(getAllAutoHistoryList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllAutoHistoryList.fulfilled, (state, action) => {
      state.loading = "success";
      state.autoList = action?.payload;
    });
    builder.addCase(getAllAutoHistoryList.rejected, (state) => {
      state.loading = "rejected";
      state.autoList = [];
    });

    builder.addCase(getAllAutoHistroryCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllAutoHistroryCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalAutoListCount = action?.payload;
    });
    builder.addCase(getAllAutoHistroryCount.rejected, (state) => {
      state.loading = "rejected";
      state.totalAutoListCount = 0;
    });

    builder.addCase(getAllAutoHistoryForExportByDate.pending, (state) => {
      state.autoHistoryExportList = [];
      state.autoExportLoading = "pending";
    });
    builder.addCase(
      getAllAutoHistoryForExportByDate.fulfilled,
      (state, action) => {
        state.autoHistoryExportList = action?.payload;
        state.autoExportLoading = "success";
      }
    );
    builder.addCase(getAllAutoHistoryForExportByDate.rejected, (state) => {
      state.autoHistoryExportList = [];
      state.autoExportLoading = "error";
    });

    builder.addCase(getAllHistory.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllHistory.fulfilled, (state, action) => {
      state.allLeadHistory = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllHistory.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllTaskData.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTaskData.fulfilled, (state, action) => {
      state.loading = "success";
      state.getSingleLeadTask = action.payload;
    });
    builder.addCase(getAllTaskData.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAutomationLeads.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAutomationLeads.fulfilled, (state, action) => {
      state.loading = "success";
      state.autoStatusList = action.payload;
    });
    builder.addCase(getAutomationLeads.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(searchIvrLeads.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchIvrLeads.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadSearchList = action.payload;
    });
    builder.addCase(searchIvrLeads.rejected, (state) => {
      state.loading = "rejected";
      state.leadSearchList = [];
    });

    builder.addCase(getSalesReportByFilterForExport.pending, (state) => {
      state.salesReportExportLoading = "pending";
    });
    builder.addCase(
      getSalesReportByFilterForExport.fulfilled,
      (state, action) => {
        state.salesReportExportLoading = "success";
        state.salesReportListForExport = action.payload;
      }
    );
    builder.addCase(getSalesReportByFilterForExport.rejected, (state) => {
      state.salesReportExportLoading = "rejected";
      state.salesReportListForExport = [];
    });

    builder.addCase(getSaleReportByFilter.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSaleReportByFilter.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesReportList = action.payload;
    });
    builder.addCase(getSaleReportByFilter.rejected, (state) => {
      state.loading = "rejected";
      state.salesReportList = [];
    });

    builder.addCase(getSaleReportByFilterCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSaleReportByFilterCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesReportCount = action.payload;
    });
    builder.addCase(getSaleReportByFilterCount.rejected, (state) => {
      state.loading = "rejected";
      state.salesReportCount = 0;
    });

    builder.addCase(docsUploadListInEstimate.pending, (state) => {
      state.docsListInEstimate = [];
    });
    builder.addCase(docsUploadListInEstimate.fulfilled, (state, action) => {
      state.docsListInEstimate = action?.payload;
    });
    builder.addCase(docsUploadListInEstimate.rejected, (state) => {
      state.docsListInEstimate = [];
    });

    builder.addCase(getAllLeadsTask.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLeadsTask.fulfilled, (state, action) => {
      state.loading = "success";
      state.allLeadsTaskList = action?.payload;
    });
    builder.addCase(getAllLeadsTask.rejected, (state) => {
      state.loading = "rejected";
      state.allLeadsTaskList = [];
    });

    builder.addCase(getAllChildLeads.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllChildLeads.fulfilled, (state, action) => {
      state.loading = "success";
      state.allChildLeadList = action?.payload;
    });
    builder.addCase(getAllChildLeads.rejected, (state) => {
      state.loading = "rejected";
      state.allChildLeadList = [];
    });

    builder.addCase(getEstimateByLeadIdAndUUID.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getEstimateByLeadIdAndUUID.fulfilled, (state, action) => {
      state.loading = "success";
      state.estimateDetailByUUID = action?.payload;
    });
    builder.addCase(getEstimateByLeadIdAndUUID.rejected, (state) => {
      state.loading = "rejected";
      state.estimateDetailByUUID = {};
    });

    builder.addCase(checkPlantSetUpData.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(checkPlantSetUpData.fulfilled, (state, action) => {
      state.loading = "success";
      state.plantSetupDetail = action?.payload;
    });
    builder.addCase(checkPlantSetUpData.rejected, (state) => {
      state.loading = "rejected";
      state.plantSetupDetail = false;
    });

    builder.addCase(getAllEstimateForApproval.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllEstimateForApproval.fulfilled, (state, action) => {
      state.loading = "success";
      state.estimateApprovalList = action?.payload;
    });
    builder.addCase(getAllEstimateForApproval.rejected, (state) => {
      state.loading = "rejected";
      state.estimateApprovalList = [];
    });

    builder.addCase(getAllEstimateHistory.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllEstimateHistory.fulfilled, (state, action) => {
      state.loading = "success";
      state.estimateHistoryList = action?.payload;
    });
    builder.addCase(getAllEstimateHistory.rejected, (state) => {
      state.loading = "rejected";
      state.estimateHistoryList = {};
    });

    builder.addCase(getChildLeadEstimateFlagByParentLeadId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getChildLeadEstimateFlagByParentLeadId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.childLeadFlag = action?.payload;
      }
    );
    builder.addCase(
      getChildLeadEstimateFlagByParentLeadId.rejected,
      (state) => {
        state.loading = "rejected";
        state.childLeadFlag = {};
      }
    );

    builder.addCase(getNewEstimateByLeadId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getNewEstimateByLeadId.fulfilled, (state, action) => {
      state.loading = "success";
      state.newEstimateByLeadId = action?.payload;
    });
    builder.addCase(getNewEstimateByLeadId.rejected, (state) => {
      state.loading = "rejected";
      state.newEstimateByLeadId = {};
    });
  },
});

export default LeadSlice.reducer;
