import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const createUserInAccounts = createAsyncThunk(
  "createUserInAccounts",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/users/createUser`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateUserInAccounts = createAsyncThunk(
  "updateUserInAccounts",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/users/updateUser`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllCompaniesForApprovals = createAsyncThunk(
  "getAllCompaniesForApprovals",
  async ({ userId, page, size, status }) => {
    const response = await api.get(
      `/leadService/api/companies/accounts/pending-review?assigneeId=${userId}&onboardingStatus=${status}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getAllPaymentApprovals = createAsyncThunk(
  "getAllPaymentApprovals",
  async ({ userId }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterWithCompany?userId=${userId}`,
    );
    return response.data;
  },
);

export const createPurchaseOrder = createAsyncThunk(
  "createPurchaseOrder",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/paymentRegister/createPurchaseOrder`,
      data,
    );
    return response.data;
  },
);

export const createPaymentRegister = createAsyncThunk(
  "createPaymentRegister",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/payments/register?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getPaymentDetailListByEstimateId = createAsyncThunk(
  "getPaymentDetailListByEstimateId",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getPaymentRegisterByEstimateId?id=${id}`,
    );
    return response.data;
  },
);

export const getAllVendorsPaymentList = createAsyncThunk(
  "getAllVendorsPaymentList",
  async ({ page, size }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegister?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getAllVendorsPaymentCount = createAsyncThunk(
  "getAllVendorsPaymentCount",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterCount`,
    );
    return response.data;
  },
);

export const createVendorsPayment = createAsyncThunk(
  "createVendorsPayment",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/paymentRegister/createVendorPaymentRegister`,
      data,
    );
    return response.data;
  },
);

export const createExternalVendorsPayment = createAsyncThunk(
  "createExternalVendorsPayment",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/paymentRegister/createVendorPaymentRegisterManual`,
      data,
    );
    return response.data;
  },
);

export const updateVendorPaymentStatus = createAsyncThunk(
  "updateVendorPaymentStatus",
  async ({ currentUserId, status, id }) => {
    const response = await api.put(
      `/accountService/api/v1/paymentRegister/approveVendorPayment?currentUserId=${currentUserId}&Status=${status}&id=${id}`,
    );
    return response.data;
  },
);

export const getAllTdsReportInAccounts = createAsyncThunk(
  "getAllTdsReportInAccounts",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/tds/getAllTdsReport`,
    );
    return response.data;
  },
);

export const paymentRegisterRemainingAmount = createAsyncThunk(
  "paymentRegisterRemainingAmount",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getRemainingAmount?id=${id}`,
    );
    return response.data;
  },
);

export const getInvoiceDetailById = createAsyncThunk(
  "getInvoiceDetailById",
  async ({ id, userId }) => {
    const response = await api.get(
      `/accountService/api/v1/invoices/${id}?userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllVendorsPaymentListForAccounts = createAsyncThunk(
  "getAllVendorsPaymentListForAccounts",
  async ({ page, size, status }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterForAccount?page=${page}&size=${size}&status=${status}`,
    );
    return response.data;
  },
);

export const getAllVendorsPaymentCountForAccounts = createAsyncThunk(
  "getAllVendorsPaymentCountForAccounts",
  async (status) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterCountForAccount?status=${status}`,
    );
    return response.data;
  },
);

export const getAllBankAccounts = createAsyncThunk(
  "getAllBankAccounts",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/bankStatements/getAllBankAccounts`,
    );
    return response.data;
  },
);

export const getUnBilledDetailById = createAsyncThunk(
  "getUnBilledDetailById",
  async ({ id, userId }) => {
    const response = await api.get(
      `/accountService/api/v1/unbilled-invoices/${id}?userId=${userId}`,
    );
    return response.data;
  },
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
    vendorsPaymentListForAccount: [],
    vendorsPaymentCountForAccount: 0,
    remainingAmountDetail: {},
    invoiceDetail: {},
    allBankAccountsList: [],
    unbilledDetail: {},
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
      },
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
      },
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

    builder.addCase(getAllVendorsPaymentListForAccounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllVendorsPaymentListForAccounts.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.vendorsPaymentListForAccount = action.payload;
      },
    );
    builder.addCase(getAllVendorsPaymentListForAccounts.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsPaymentListForAccount = [];
    });

    builder.addCase(getAllVendorsPaymentCountForAccounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllVendorsPaymentCountForAccounts.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.vendorsPaymentCountForAccount = action.payload;
      },
    );
    builder.addCase(getAllVendorsPaymentCountForAccounts.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsPaymentCountForAccount = 0;
    });

    builder.addCase(getAllBankAccounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBankAccounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.allBankAccountsList = action.payload;
    });
    builder.addCase(getAllBankAccounts.rejected, (state) => {
      state.loading = "rejected";
      state.allBankAccountsList = [];
    });

    builder.addCase(getUnBilledDetailById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getUnBilledDetailById.fulfilled, (state, action) => {
      state.loading = "success";
      state.unbilledDetail = action.payload;
    });
    builder.addCase(getUnBilledDetailById.rejected, (state) => {
      state.loading = "rejected";
      state.unbilledDetail = {};
    });
  },
});

export default AccountSlice.reducer;
