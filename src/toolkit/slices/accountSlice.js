import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getAllCompaniesForApprovals = createAsyncThunk(
  "getAllCompaniesForApprovals",
  async ({ userId, page, size, status }) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllParentCompanyForAccount?userId=${userId}&page=${page}&size=${size}&status=${status}`
    );
    return response.data;
  }
);

export const getAllPaymentApprovals = createAsyncThunk(
  "getAllPaymentApprovals",
  async ({userId}) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterWithCompany?userId=${userId}`
    );
    return response.data;
  }
);

const AccountSlice = createSlice({
  name: "accounts",
  initialState: {
    loading: "",
    approvalCompanyList: [],
    paymentApprovalList: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getAllCompaniesForApprovals.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompaniesForApprovals.fulfilled, (state, action) => {
      state.approvalCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompaniesForApprovals.rejected, (state) => {
      state.loading = "rejected";
      state.approvalCompanyList = [];
    });

    builder.addCase(getAllPaymentApprovals.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPaymentApprovals.fulfilled, (state, action) => {
      state.loading = "success";
      state.paymentApprovalList = action.payload;
    });
    builder.addCase(getAllPaymentApprovals.rejected, (state, action) => {
      state.loading = "rejected";
      state.paymentApprovalList = [];
    });
  },
});

export default AccountSlice.reducer;
