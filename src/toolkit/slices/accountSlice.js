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
  async ({ userId }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterWithCompany?userId=${userId}`
    );
    return response.data;
  }
);

export const createPurchaseOrder = createAsyncThunk(
  "createPurchaseOrder",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/paymentRegister/createPurchaseOrder`,
      data
    );
    return response.data;
  }
);

export const createPaymentRegister = createAsyncThunk(
  "createPaymentRegister",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/paymentRegister/createPaymentRegister`,
      data
    );
    return response.data;
  }
);

export const getPaymentDetailListByEstimateId = createAsyncThunk(
  "getPaymentDetailListByEstimateId",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getPaymentRegisterByEstimateId?id=${id}`
    );
    return response.data;
  }
);

export const getAllVendorsPaymentList = createAsyncThunk(
  "getAllVendorsPaymentList",
  async ({ page, size }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegister?page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllVendorsPaymentCount = createAsyncThunk(
  "getAllVendorsPaymentCount",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterCount`
    );
    return response.data;
  }
);

export const getAllTdsReportInAccounts = createAsyncThunk(
  "getAllTdsReportInAccounts",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/tds/getAllTdsReport`
    );
    return response.data;
  }
);

export const paymentRegisterRemainingAmount = createAsyncThunk(
  "paymentRegisterRemainingAmount",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getRemainingAmount?id=${id}`
    );
    return response.data;
  }
);

export const getInvoiceDetailById = createAsyncThunk(
  "getInvoiceDetailById",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/invoice/getInvoiceById?id=${id}`
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
    estimatePaymentList: [],
    vendorsPaymentList: [],
    vendorsPaymentCount: 0,
    remainingAmountDetail: {},
    invoiceDetail: {},
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

    builder.addCase(getAllPaymentApprovals.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPaymentApprovals.fulfilled, (state, action) => {
      state.loading = "success";
      state.paymentApprovalList = action.payload;
    });
    builder.addCase(getAllPaymentApprovals.rejected, (state) => {
      state.loading = "rejected";
      state.paymentApprovalList = [];
    });

    builder.addCase(getPaymentDetailListByEstimateId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getPaymentDetailListByEstimateId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.estimatePaymentList = action.payload;
      }
    );
    builder.addCase(getPaymentDetailListByEstimateId.rejected, (state) => {
      state.loading = "rejected";
      state.estimatePaymentList = [];
    });

    builder.addCase(getAllVendorsPaymentList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorsPaymentList.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsPaymentList = action.payload;
    });
    builder.addCase(getAllVendorsPaymentList.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsPaymentList = [];
    });

    builder.addCase(getAllVendorsPaymentCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorsPaymentCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsPaymentCount = action.payload;
    });
    builder.addCase(getAllVendorsPaymentCount.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsPaymentCount = 0;
    });

    builder.addCase(paymentRegisterRemainingAmount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      paymentRegisterRemainingAmount.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.remainingAmountDetail = action.payload;
      }
    );
    builder.addCase(paymentRegisterRemainingAmount.rejected, (state) => {
      state.loading = "rejected";
      state.remainingAmountDetail = {};
    });

    builder.addCase(getInvoiceDetailById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getInvoiceDetailById.fulfilled, (state, action) => {
      state.loading = "success";
      state.invoiceDetail = action.payload;
    });
    builder.addCase(getInvoiceDetailById.rejected, (state) => {
      state.loading = "rejected";
      state.invoiceDetail = {};
    });
  },
});

export default AccountSlice.reducer;
