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
  },
});

export default LeadSlice.reducer;
