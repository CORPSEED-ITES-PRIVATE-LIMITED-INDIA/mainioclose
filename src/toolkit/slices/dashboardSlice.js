import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getLeadsDataByMonth = createAsyncThunk(
  "getLeadsDataByMonth",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllLeadsMonthWise`,
      data
    );
    return response.data;
  }
);

export const getConversionReport = createAsyncThunk(
  "getConversionReport",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getLeadConversionReport`,
      data
    );
    return response.data;
  }
);

export const getDashboardUsersByHeirarchy = createAsyncThunk(
  "getDashboardUsersByHeirarchy",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/getAllLowerHierarchy?userId=${id}`
    );
    return response.data;
  }
);

const DashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    loading: "",
    dashboardUsers: [],
    leadDataMonthWise: [],
    conversionReport: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getLeadsDataByMonth.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadsDataByMonth.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadDataMonthWise = action?.payload;
    });
    builder.addCase(getLeadsDataByMonth.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getDashboardUsersByHeirarchy.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getDashboardUsersByHeirarchy.fulfilled, (state, action) => {
      state.loading = "success";
      state.dashboardUsers = action.payload;
    });
    builder.addCase(getDashboardUsersByHeirarchy.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getConversionReport.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getConversionReport.fulfilled, (state, action) => {
      state.loading = "success";
      state.conversionReport = action.payload;
    });
    builder.addCase(getConversionReport.rejected, (state) => {
      state.loading = "rejected";
    });
  },
});

export default DashboardSlice.reducer;
