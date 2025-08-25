import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getQuery } from "../../API/GetQuery";

export const getAllIvr = createAsyncThunk("allIvrs", async () => {
  const response = await getQuery(`/leadService/api/v1/rating/getAllIvrData`);
  return response.data;
});

export const createIvr = createAsyncThunk("createIvr", async (data) => {
  const response = await getQuery(
    `/leadService/api/v1/rating/createIvrData?callerNumber=${data?.callerNumber}&agentName=${data?.agentName}&aggentNumber=${data?.aggentNumber}&startTime=${data?.startTime}&duration=${data?.duration}&endTime=${data?.endTime}&callRecordingUrl=${data?.callRecordingUrl}`
  );
  return response.data;
});

export const getAllIvrWithPage = createAsyncThunk(
  "getAllIvrWithPage",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/rating/getAllIvrDataWithPage?page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const searchIvrLeads = createAsyncThunk(
  "searchIvrLeads",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/lead/leadSearchByQuality?searchParam=${data.input}&userId=${data.id}`
    );
    return response.data;
  }
);

export const getTotalIvrCount = createAsyncThunk(
  "getTotalIvrCount",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/rating/getAllIvrDataCount`
    );
    return response.data;
  }
);

const IvrSlice = createSlice({
  name: "ivr",
  initialState: {
    allIvr: [],
    ivrLoading: false,
    ivrError: false,
    loading: "",
    totalCount: 0,
  },
  extraReducers: (builder) => {
    builder.addCase(getAllIvr.pending, (state, action) => {
      state.ivrLoading = true;
    });
    builder.addCase(getAllIvr.fulfilled, (state, action) => {
      state.ivrLoading = false;
      state.ivrError = false;
      state.allIvr = action?.payload;
    });
    builder.addCase(getAllIvr.rejected, (state, action) => {
      state.ivrError = true;
    });

    builder.addCase(getAllIvrWithPage.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllIvrWithPage.fulfilled, (state, action) => {
      state.loading = "success";
      state.allIvr = action.payload;
    });
    builder.addCase(getAllIvrWithPage.rejected, (state, action) => {
      state.loading = "rejected";
      state.allIvr = [];
    });

    builder.addCase(searchIvrLeads.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(searchIvrLeads.fulfilled, (state, action) => {
      state.loading = "success";
      state.allIvr = action.payload;
    });
    builder.addCase(searchIvrLeads.rejected, (state, action) => {
      state.loading = "rejected";
      state.allIvr = [];
    });

    builder.addCase(getTotalIvrCount.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalIvrCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalCount = action.payload;
    });
    builder.addCase(getTotalIvrCount.rejected, (state, action) => {
      state.loading = "rejected";
      state.totalCount = 0;
    });
  },
});

export default IvrSlice.reducer;
