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

export const convertEstimateToPI = createAsyncThunk(
  "convertEstimateToPI",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `accountService/api/v1/estimates/convertIntoPI/${data.estimateId}?requestingUserId=${data.userId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const cancelUnBilledInvoice = createAsyncThunk(
  "cancelUnBilledInvoice",
  async ({ id, userId, reason, cancelAttachment }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/unbilled-invoices/cancel/request/${userId}/${id}?reason=${reason}&cancelAttachment=${cancelAttachment}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const cancelUnBilledInvoiceByAdmin = createAsyncThunk(
  "cancelUnBilledInvoiceByAdmin",
  async ({ id, userId, reason, cancelAttachment }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/unbilled-invoices/cancel/reject/${userId}/${id}?reason=${reason}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const approveUnBilledInvoiceByAdmin = createAsyncThunk(
  "approveUnBilledInvoiceByAdmin",
  async ({ id, userId, reason, cancelAttachment }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/unbilled-invoices/cancel/approve/${userId}/${id}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const convertUnbillToAdvanceInvoice = createAsyncThunk(
  "convertUnbillToAdvanceInvoice",
  async ({ unbilledId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/unbilled-invoices/convertIntoADI/${unbilledId}?requestingUserId=${userId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllInvoiceReport = createAsyncThunk(
  "getAllInvoiceReport",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/invoices/invoiceReport`,
      data,
    );
    return response.data;
  },
);

export const fetchEstimateReport = createAsyncThunk(
  "leads/fetchEstimateReport",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/estimates/estimateReport`,
        payload,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response);
    }
  },
);
export const getEstimatesByLeadId = createAsyncThunk(
  "getEstimatesByLeadId",
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/accountService/api/v1/estimates/lead/${leadId}`,
      );
      console.log("Test hai Yo::", response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response);
    }
  },
);

export const getTdsDetailByEstimateId = createAsyncThunk(
  "getTdsDetailByEstimateId",
  async ({ estimateId, unbilledId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/accountService/api/v1/unbilled-invoices/tds?unbilledId=${unbilledId}&estimateId=${estimateId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response);
    }
  },
);

export const getEstimeteByEstimateNumber = createAsyncThunk(
  "getEstimeteByEstimateNumber",
  async ({ estimateNumber, userId }) => {
    const response = await api.get(
      `/accountService/api/v1/estimates/number/${estimateNumber}?userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllCreditNotes = createAsyncThunk(
  "getAllCreditNotes",
  async ({ status, page, size }) => {
    const response = await api.get(
      `/accountService/api/credit-notes?status=${status}&page=${page - 1}&size=${size}`,
    );
    console.log("API DATA: ", response);
    return response.data;
  },
);
export const createCreditNotes = createAsyncThunk(
  "createCreditNotes",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/credit-notes/refund`,
        data,
      );
      console.log("API RES:", response);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const approveCreditNote = createAsyncThunk(
  "approveCreditNote",
  async ({ creditNoteId, userId }, { rejectWithValue }) => {
    try {
      const creditNoteResponse = await api.put(
        `/accountService/api/credit-notes/${creditNoteId}/approve/${userId}`,
      );
      console.log("Credit Note Approved");
      console.log("CREDIT NOTE API RES:", creditNoteResponse);

      return {
        creditNote: creditNoteResponse.data,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to approve credit note",
      );
    }
  },
);

export const accountApproveCreditNote = createAsyncThunk(
  "account/accountApproveCreditNote",
  async (
    { creditNoteId, userId, approvalRemarks, gstPortalAttachment },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(
        `/accountService/api/credit-notes/${creditNoteId}/account-approve/${userId}`,
        {
          approvalRemarks: approvalRemarks || "",
          gstPortalAttachment: gstPortalAttachment || "",
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

export const rejectCreditNote = createAsyncThunk(
  "rejectCreditNote",
  async ({ creditNoteId, userId, rejectionReason }) => {
    const response = await api.put(
      `/accountService/api/credit-notes/${creditNoteId}/reject/${userId}`,
      { rejectionReason: rejectionReason },
    );
    console.log("API RES:", response);
    return response.data;
  },
);

export const getProcurementPurchaseOrder = createAsyncThunk(
  "getProcurementPurchaseOrder",
  async ({ status, page, size }) => {
    const response = await api.get(
      `/accountService/api/procurement?status=${status}&page=${page - 1}&size=${size}`,
    );
    return response.data;
  },
);

export const rejectProcurementPurchaseOrder = createAsyncThunk(
  "rejectProcurementPurchaseOrder",
  async ({ purchaseOrderId, userId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/procurement/${purchaseOrderId}/reject/${userId}?reason=${reason}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const approveProcurementPurchaseOrder = createAsyncThunk(
  "approveProcurementPurchaseOrder",
  async ({ purchaseOrderId, userId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/procurement/${purchaseOrderId}/approve/${userId}?comment=${reason}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getProcurementPaymentRequestList = createAsyncThunk(
  "getProcurementPaymentRequestList",
  async ({ status, page, size }) => {
    const response = await api.get(
      `/accountService/api/procurement-payment-requests?status=${status}&page=${page - 1}&size=${size}`,
    );
    return response.data;
  },
);

export const approveProcurementPaymentRequest = createAsyncThunk(
  "approveProcurementPaymentRequest",
  async ({ paymentRequestId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/procurement-payment-requests/${paymentRequestId}/approve/${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const rejectProcurementPaymentRequest = createAsyncThunk(
  "rejectProcurementPaymentRequest",
  async ({ paymentRequestId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/procurement-payment-requests/${paymentRequestId}/reject/${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const releaseProcurementPaymentRequest = createAsyncThunk(
  "releaseProcurementPaymentRequest",
  async ({ paymentRequestId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/procurement-payment-requests/${paymentRequestId}/release-payment/${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const releaseProcurementPaymentRequestAccounts = createAsyncThunk(
  "releaseProcurementPaymentRequestAccounts",
  async ({ paymentRequestId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/procurement-payment-requests/${paymentRequestId}/release-payment/${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getInvoicesByUnbilledId = createAsyncThunk(
  "getInvoicesByUnbilledId",
  async ({ userId, unbilledId, page, size }) => {
    const response = await api.get(
      `/accountService/api/v1/invoices/by-unbilled?userId=${userId}&unbilledId=${unbilledId}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const confirmEInvoice = createAsyncThunk(
  "confirmEInvoice",
  async ({ invoiceId, data }) => {
    const response = await api.post(
      `/accountService/api/v1/invoices/${invoiceId}/confirm-e-invoice`,
      data,
    );
    return response.data;
  },
);
export const getAllVendorDetails = createAsyncThunk(
  "getAllVendorDetails",
  async () => {
    const response = await api.get(
      `/operationService/api/vendor-finalizations/accounts`,
    );
    return response.data;
  },
);
export const rejectVendorSubmission = createAsyncThunk(
  "rejectVendorSubmission",
  async ({ submissionId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/vendor-finalizations/accounts/${submissionId}/reject`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to Reject Vendor Submission",
      );
    }
  },
);
export const approveVendorSubmission = createAsyncThunk(
  "approveVendorSubmission",
  async ({ submissionId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/vendor-finalizations/accounts/${submissionId}/approve`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to Approve Vendor Submission",
      );
    }
  },
);

export const getActivePaymentLedgerForPaymentRegister = createAsyncThunk(
  "getActivePaymentLedgerForPaymentRegister",
  async () => {
    const response = await api.get(`/accountService/api/v1/ledgers/active`);
    return response.data;
  },
);
export const getAllPendingPayment = createAsyncThunk(
  "getAllPendingPayment",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/accountService/api/v1/payment-legal-verification/pending?userId=${userId}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);
export const reviewPendingPayment = createAsyncThunk(
  "reviewPendingPayment",
  async ({ reviewedBy, requestId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/payment-legal-verification/${requestId}/review?reviewedBy=${reviewedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getAllAdvanceTaxInvoiceRequests = createAsyncThunk(
  "advanceTaxInvoice/getAllAdvanceTaxInvoiceRequests",
  async (
    { userId, status = "PENDING", page = 0, size = 10 },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(
        "/accountService/api/v1/advance-tax-invoice-requests",
        {
          params: {
            userId,
            status,
            page,
            size,
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to fetch advance tax invoice requests",
      );
    }
  },
);

export const createAdvanceTaxInvoiceRequest = createAsyncThunk(
  "accounts/createAdvanceTaxInvoiceRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/accountService/api/v1/advance-tax-invoice-requests",
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message:
            error?.message || "Failed to create advance tax invoice request",
        },
      );
    }
  },
);

export const approveAdvanceTaxInvoiceRequest = createAsyncThunk(
  "advanceTaxInvoice/approveAdvanceTaxInvoiceRequest",
  async ({ requestId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/advance-tax-invoice-requests/${requestId}/approve`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to approve advance tax invoice request",
      );
    }
  },
);

export const confirmAdvanceTaxInvoiceEInvoiceAndCreateProject =
  createAsyncThunk(
    "advanceTaxInvoice/confirmAdvanceTaxInvoiceEInvoiceAndCreateProject",
    async ({ requestId, data }, { rejectWithValue }) => {
      try {
        /*
         * The backend path variable is named invoiceId.
         * As required by the frontend flow, requestId is passed
         * in that path position.
         */
        const response = await api.put(
          `/accountService/api/v1/advance-tax-invoice-requests/${requestId}/confirm-e-invoice-and-create-project`,
          data,
        );

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error?.response?.data ||
            error?.message ||
            "Failed to confirm E-Invoice and create project",
        );
      }
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
    invoiceReport: [],
    estimateReport: [],
    estimateList: [],
    creditNoteList: [],
    tdsDetail: {},
    procurementPurchaseOrderList: [],
    procurementPaymentRequestList: [],
    invoicesByUnbilled: [],
    vendorsDetails: [],
    paymentLegerList: [],
    paymentLegalVerification: [],
    allAdvanceTaxInvoiceRequests: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    },
    advanceTaxInvoiceRequestsLoading: false,
    advanceTaxInvoiceRequestsError: null,
    advanceTaxInvoiceRequestCreating: false,
    advanceTaxInvoiceRequestCreateError: null,
    advanceTaxInvoiceRequestApproving: false,
    advanceTaxInvoiceRequestApproveError: null,
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

    builder.addCase(getAllInvoiceReport.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllInvoiceReport.fulfilled, (state, action) => {
      state.loading = "success";
      state.invoiceReport = [action.payload];
    });
    builder.addCase(getAllInvoiceReport.rejected, (state) => {
      state.loading = "rejected";
      state.invoiceReport = [];
    });

    builder.addCase(getEstimatesByLeadId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getEstimatesByLeadId.fulfilled, (state, action) => {
      state.loading = "success";
      state.estimateList = action.payload || [];
    });
    builder.addCase(getEstimatesByLeadId.rejected, (state) => {
      state.loading = "rejected";
      state.estimateList = [];
    });

    builder.addCase(getTdsDetailByEstimateId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTdsDetailByEstimateId.fulfilled, (state, action) => {
      state.loading = "success";
      state.tdsDetail = action.payload || [];
    });
    builder.addCase(getTdsDetailByEstimateId.rejected, (state) => {
      state.loading = "rejected";
      state.tdsDetail = {};
    });

    builder.addCase(getAllCreditNotes.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCreditNotes.fulfilled, (state, action) => {
      state.loading = "success";
      console.log("Action Payload", action.payload);
      state.creditNoteList = action.payload || [];
    });
    builder.addCase(getAllCreditNotes.rejected, (state) => {
      state.loading = "rejected";
      state.creditNoteList = {};
    });
    builder.addCase(approveCreditNote.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(approveCreditNote.fulfilled, (state, action) => {
      state.loading = "success";
    });
    builder.addCase(approveCreditNote.rejected, (state) => {
      state.loading = "rejected";
    });
    builder.addCase(rejectCreditNote.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(rejectCreditNote.fulfilled, (state, action) => {
      state.loading = "success";
    });
    builder.addCase(rejectCreditNote.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getProcurementPurchaseOrder.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getProcurementPurchaseOrder.fulfilled, (state, action) => {
      state.loading = "success";
      state.procurementPurchaseOrderList = action.payload.data || [];
      console.log("One Success:", action.payload.data);
    });
    builder.addCase(getProcurementPurchaseOrder.rejected, (state) => {
      state.loading = "rejected";
      state.procurementPurchaseOrderList = [];
    });

    builder.addCase(getProcurementPaymentRequestList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getProcurementPaymentRequestList.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.procurementPaymentRequestList = action.payload || [];
      },
    );
    builder.addCase(getProcurementPaymentRequestList.rejected, (state) => {
      state.loading = "rejected";
      state.procurementPaymentRequestList = [];
    });

    builder.addCase(getInvoicesByUnbilledId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getInvoicesByUnbilledId.fulfilled, (state, action) => {
      state.loading = "success";
      state.invoicesByUnbilled = action.payload || [];
    });
    builder.addCase(getInvoicesByUnbilledId.rejected, (state) => {
      state.loading = "rejected";
      state.invoicesByUnbilled = [];
    });

    builder.addCase(getAllVendorDetails.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorDetails.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsDetails = action.payload || [];
    });
    builder.addCase(getAllVendorDetails.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(
      getActivePaymentLedgerForPaymentRegister.pending,
      (state) => {
        state.loading = "pending";
      },
    );
    builder.addCase(
      getActivePaymentLedgerForPaymentRegister.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.paymentLegerList = action.payload || [];
      },
    );
    builder.addCase(
      getActivePaymentLedgerForPaymentRegister.rejected,
      (state) => {
        state.loading = "rejected";
      },
    );
    builder.addCase(getAllPendingPayment.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPendingPayment.fulfilled, (state, action) => {
      state.loading = "success";
      state.paymentLegalVerification = action.payload || [];
    });
    builder.addCase(getAllPendingPayment.rejected, (state) => {
      state.loading = "rejected";
    });
    builder.addCase(getAllAdvanceTaxInvoiceRequests.pending, (state) => {
      state.advanceTaxInvoiceRequestsLoading = true;
      state.advanceTaxInvoiceRequestsError = null;
    });
    builder.addCase(
      getAllAdvanceTaxInvoiceRequests.fulfilled,
      (state, action) => {
        state.advanceTaxInvoiceRequestsLoading = false;
        state.advanceTaxInvoiceRequestsError = null;
        state.allAdvanceTaxInvoiceRequests = action.payload || {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          first: true,
          last: true,
          empty: true,
        };
      },
    );
    builder.addCase(
      getAllAdvanceTaxInvoiceRequests.rejected,
      (state, action) => {
        state.advanceTaxInvoiceRequestsLoading = false;
        state.advanceTaxInvoiceRequestsError =
          action.payload || action.error?.message || "Failed to fetch requests";
        state.allAdvanceTaxInvoiceRequests = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          first: true,
          last: true,
          empty: true,
        };
      },
    );

    builder.addCase(createAdvanceTaxInvoiceRequest.pending, (state) => {
      state.advanceTaxInvoiceRequestCreating = true;
      state.advanceTaxInvoiceRequestCreateError = null;
    });
    builder.addCase(createAdvanceTaxInvoiceRequest.fulfilled, (state) => {
      state.advanceTaxInvoiceRequestCreating = false;
      state.advanceTaxInvoiceRequestCreateError = null;
    });
    builder.addCase(
      createAdvanceTaxInvoiceRequest.rejected,
      (state, action) => {
        state.advanceTaxInvoiceRequestCreating = false;
        state.advanceTaxInvoiceRequestCreateError =
          action.payload || action.error?.message || "Failed to create request";
      },
    );

    builder.addCase(approveAdvanceTaxInvoiceRequest.pending, (state) => {
      state.advanceTaxInvoiceRequestApproving = true;
      state.advanceTaxInvoiceRequestApproveError = null;
    });
    builder.addCase(
      approveAdvanceTaxInvoiceRequest.fulfilled,
      (state, action) => {
        state.advanceTaxInvoiceRequestApproving = false;
        state.advanceTaxInvoiceRequestApproveError = null;

        const approvedRequest = action.payload;

        if (approvedRequest?.requestId) {
          const currentContent =
            state.allAdvanceTaxInvoiceRequests?.content || [];

          state.allAdvanceTaxInvoiceRequests = {
            ...state.allAdvanceTaxInvoiceRequests,
            content: currentContent.map((item) =>
              item?.requestId === approvedRequest.requestId
                ? approvedRequest
                : item,
            ),
          };
        }
      },
    );
    builder.addCase(
      approveAdvanceTaxInvoiceRequest.rejected,
      (state, action) => {
        state.advanceTaxInvoiceRequestApproving = false;
        state.advanceTaxInvoiceRequestApproveError =
          action.payload ||
          action.error?.message ||
          "Failed to approve advance tax invoice request";
      },
    );

    builder.addCase(
      confirmAdvanceTaxInvoiceEInvoiceAndCreateProject.pending,
      (state) => {
        state.advanceTaxInvoiceEInvoiceConfirming = true;
        state.advanceTaxInvoiceEInvoiceConfirmError = null;
      },
    );
    builder.addCase(
      confirmAdvanceTaxInvoiceEInvoiceAndCreateProject.fulfilled,
      (state) => {
        state.advanceTaxInvoiceEInvoiceConfirming = false;
        state.advanceTaxInvoiceEInvoiceConfirmError = null;
      },
    );
    builder.addCase(
      confirmAdvanceTaxInvoiceEInvoiceAndCreateProject.rejected,
      (state, action) => {
        state.advanceTaxInvoiceEInvoiceConfirming = false;
        state.advanceTaxInvoiceEInvoiceConfirmError =
          action.payload ||
          action.error?.message ||
          "Failed to confirm E-Invoice and create project";
      },
    );

    builder.addCase(confirmEInvoice.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(confirmEInvoice.fulfilled, (state, action) => {
      state.loading = "success";
    });
    builder.addCase(confirmEInvoice.rejected, (state) => {
      state.loading = "rejected";
    });
  },
});

export default AccountSlice.reducer;
