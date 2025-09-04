import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const createCompanyInOperations = createAsyncThunk(
  "createCompanyInOperations",
  async (data) => {
    const response = await api.post(`/api/companies`, data);
    return response.data;
  }
);

export const updateCompanyInOperations = createAsyncThunk(
  "updateCompanyInOperations",
  async (data) => {
    const response = await api.put(`/api/companies/${data?.companyId}`, data);
    return response.data;
  }
);

export const getAllOperationsProject = createAsyncThunk(
  "getAllOperationsProject",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/api/projects/my-projects?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

const OperationSlice = createSlice({
  name: "operation",
  initialState: {
    loading: "",
    operationProjectList: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getAllOperationsProject.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllOperationsProject.fulfilled, (state, action) => {
      state.loading = "success";
      state.operationProjectList = action?.payload;
    });
    builder.addCase(getAllOperationsProject.rejected, (state) => {
      state.loading = "rejected";
      state.operationProjectList = [];
    });
  },
});

export default OperationSlice.reducer;
