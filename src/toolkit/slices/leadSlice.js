import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

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
      `/leadService/api/v1/lead/deleteLead?leadId=${data?.id}&userId=${data?.userid}`
    );
    return response.data;
  }
);

export const deleteMultipleLeads = createAsyncThunk(
  "deleteMultipleLeads",
  async (data) => {
    const response = await api.delete(
      `/leadService/api/v1/lead/deleteMultiLead`,
      data
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
  "getallProjectData",
  async ({ userId, page, size }) => {
    const getProjectData = await api.get(
      `/leadService/api/v1/project/getAllProject?userId=${userId}&page=${page}&size=${size}`
    );
    return getProjectData?.data;
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
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateByUserId?userId=${id}`
    );
    return response.data;
  }
);

export const getTotalCountOfEstimate = createAsyncThunk(
  "getTotalCountOfEstimate",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllEstimateCount?userId=${userId}`
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
      `/leadService/api/v1/rating/getAllUserHistory?userId=${id}`
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

    builder.addCase(getAllHistory.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllHistory.fulfilled, (state, action) => {
      state.allLeadHistory = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllHistory.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllTaskData.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTaskData.fulfilled, (state, action) => {
      state.loading = "success";
      state.getSingleLeadTask = action.payload;
    });
    builder.addCase(getAllTaskData.rejected, (state, action) => {
      state.loading = "rejected";
    });
  },
});

export default LeadSlice.reducer;
