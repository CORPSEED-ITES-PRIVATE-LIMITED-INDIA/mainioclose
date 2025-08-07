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

export const createLeads = createAsyncThunk("createLeads", async (data) => {
  const response = await api.post(`/leadService/api/v1/lead/createLead`, data);
  return response.data;
});

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

export const LeadSlice = createSlice({
  name: "leads",
  initialState: {
    allLeads: [],
    leadresponseStatus: "",
    leadDetailLoading: "",
    leadsLoading: "",
    loading: "",
    totalCount: 0,
    singleLeadData: {},
    remarkData: [],
    estimateListByUserId: [],
    projectsList: [],
    leadUsersList: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllLeadsByFilter.pending, (state) => {
      state.leadresponseStatus = "pending";
    });
    builder.addCase(getAllLeadsByFilter.fulfilled, (state, action) => {
      state.allLeads = [...state.allLeads, ...action.payload];
      state.leadresponseStatus = "success";
    });
    builder.addCase(getAllLeadsByFilter.rejected, (state) => {
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
  },
});

export default LeadSlice.reducer;
