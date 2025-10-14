import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getOrganizationByName = createAsyncThunk(
  "getOrganizationByName",
  async (name) => {
    const response = await api.get(
      `/accountService/api/v1/organization/getAllOrganizationByName?name=${name}`
    );
    return response.data;
  }
);

export const createOrganization = createAsyncThunk(
  "createOrganization",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/organization/createOrganization`,
      data
    );
    return response.data;
  }
);

export const addStatutory = createAsyncThunk("addStatutory", async (data) => {
  const response = await api.post(
    `/accountService/api/v1/statutory/addStatutoryDetails`,
    data
  );
  return response.data;
});

export const getAllOrganizations = createAsyncThunk(
  "getAllOrganizations",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/organization/getAllOrganization`
    );
    return response.data;
  }
);

export const getAllGroups = createAsyncThunk("getAllGroups", async () => {
  const response = await api.get(
    `/accountService/api/v1/ledgerType/getAllLedgerType`
  );
  return response.data;
});

export const getLedgerListByGroupId = createAsyncThunk(
  "getLedgerByGroupId",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/ledger/getAllLedgerByGroupId?id=${id}`
    );
    return response.data;
  }
);

export const getAllLedger = createAsyncThunk(
  "getAllLedger",
  async ({ page, size }) => {
    const response = await api.get(
      `/accountService/api/v1/ledger/getAllLedger?page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllLedgerCounts = createAsyncThunk(
  "getAllLedgerCounts",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/ledger/getAllLedgerCount`
    );
    return response.data;
  }
);

export const getVoucherByGroupLedgerId = createAsyncThunk(
  "getVoucherByLedgerId",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/voucher/getAllVoucherByLedgerId?ledgerId=${id}`
    );
    return response.data;
  }
);

export const getAllLedgerType = createAsyncThunk(
  "getAllLedgerType",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/ledgerType/getAllLedgerType`
    );
    return response.data;
  }
);

export const createLedger = createAsyncThunk("createLedger", async (data) => {
  const response = await api.post(
    `/accountService/api/v1/ledger/createLedger`,
    data
  );
  return response.data;
});

export const updateLedger = createAsyncThunk("updateLedger", async (data) => {
  const response = await api.put(
    `/accountService/api/v1/ledger/updateLedger`,
    data
  );
  return response.data;
});

export const getLedgerTypeById = createAsyncThunk(
  "getLedgerTypeById",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/ledgerType/getAllLedgerTypeById?id=${id}`
    );
    return response.data;
  }
);

export const getAllVoucher = createAsyncThunk("getAllVoucher", async () => {
  const response = await api.get(
    `/accountService/api/v1/voucher/getAllVoucher`
  );
  return response.data;
});

export const getLedgerById = createAsyncThunk("getLedgerById", async (id) => {
  const response = await api.get(
    `/accountService/api/v1/ledger/getLedgerById?id=${id}`
  );
  return response.data;
});

export const createVoucher = createAsyncThunk("createVoucher", async (data) => {
  const response = await api.post(
    `/accountService/api/v1/voucher/createVoucher`,
    data
  );
  return response.data;
});

export const getAllVoucherType = createAsyncThunk(
  "getAllVoucherType",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/voucherType/getAllVoucherType`
    );
    return response.data;
  }
);

export const getEstimateByStatus = createAsyncThunk(
  "getEstimateByStatus",
  async ({ status, page, size, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateByStatus?status=${status}&page=${page}&size=${size}&userId=${userId}`
    );
    return response.data;
  }
);

export const getTotalCountOfEstimate = createAsyncThunk(
  "getTotalCountOfEstimate",
  async ({ status, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateByStatusCount?status=${status}&userId=${userId}`
    );
    return response.data;
  }
);

export const getAllDailyBookRecord = createAsyncThunk(
  "getAllDailyBookRecord",
  async ({ start, end }) => {
    const response = await api.get(
      `/accountService/api/v1/voucher/getAllVoucherInBetweenDate?startDate=${start}&endDate=${end}`
    );
    return response.data;
  }
);

export const estimateApprovedAndDisapprovedStatus = createAsyncThunk(
  "approvedAndDisapprovedStatus",
  async ({ status, estimateId, userId }) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/approvedEstimate?status=${status}&estimateId=${estimateId}&userId=${userId}`
    );
    return response.data;
  }
);

export const getAllBankStatements = createAsyncThunk(
  "getAllBankStatements",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/bankStatements/getAllBankStatements`
    );
    return response.data;
  }
);

export const addBankDetails = createAsyncThunk(
  "addBankDetails",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/bankStatements/createBankStatement`,
      data
    );
    return response.data;
  }
);

export const getAllPaymentRegisterWithPagination = createAsyncThunk(
  "getAllPaymentRegisterWithPagination",
  async ({ page, size, status }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterWithPage?page=${page}&size=${size}&status=${status}`
    );
    return response.data;
  }
);

export const getAllPaymentRegisterCount = createAsyncThunk(
  "getAllPaymentRegisterCount",
  async (status) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterCount?status=${status}`
    );
    return response.data;
  }
);

export const paymentRegisterAction = createAsyncThunk(
  "paymentRegisterAction",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/paymentRegister/paymentApproveManual`,
      data
    );
    return response.data;
  }
);

export const getAllInvoice = createAsyncThunk(
  "getAllInvoice",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllInvoice?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllInvoiceCount = createAsyncThunk(
  "getAllInvoiceCount",
  async (userId) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllInvoiceCount?userId=${userId}`
    );
    return response.data;
  }
);

export const getAllUnbillList = createAsyncThunk(
  "getAllUnbillList",
  async ({ page, size }) => {
    const response = await api.get(
      `/accountService/api/v1/ledgerType/getAllUnbilled?page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllUnbillCount = createAsyncThunk(
  "getAllUnbillCount",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/ledgerType/getAllUnbilledCount`
    );
    return response.data;
  }
);

export const getAllInvoiceForSale = createAsyncThunk(
  "getAllInvoiceForSale",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllInvoiceForSales?userId=${id}`
    );
    return response.data;
  }
);

export const getAllTdsList = createAsyncThunk("getAllTdsList", async () => {
  const response = await api.get(`/accountService/api/v1/tds/getAllTds`);
  return response.data;
});

export const createTDS = createAsyncThunk("createTDS", async (data) => {
  const response = await api.post(`/accountService/api/v1/tds/createTds`, data);
  return response.data;
});

export const getTdsAmounts = createAsyncThunk("getTdsAmounts", async () => {
  const response = await api.get(`/accountService/api/v1/tds/getAllTdsCount`);
  return response.data;
});

export const updateVouchersType = createAsyncThunk(
  "updateVouchersType",
  async ({ name, id }) => {
    const response = await api.put(
      `/accountService/api/v1/voucherType/updateVoucherType?name=${name}&id=${id}`
    );
    return response.data;
  }
);

export const createVoucherType = createAsyncThunk(
  "createVoucherType",
  async ({ name }) => {
    const response = await api.post(
      `/accountService/api/v1/voucherType/createVoucherType?name=${name}`
    );
    return response.data;
  }
);

export const updateLedgerType = createAsyncThunk(
  "updateLedgerType",
  async (data) => {
    const response = await api.put(
      `/accountService/api/v1/ledgerType/updateLedgerType`,
      data
    );
    return response.data;
  }
);

export const createLedgerType = createAsyncThunk(
  "createLedgerType",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/ledgerType/createLedgerType`,
      data
    );
    return response.data;
  }
);

export const getAllTrailBalance = createAsyncThunk(
  "unbillItems",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/trialBalance/getAllTrialBalance?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const getAllProfitList = createAsyncThunk(
  "getAllProfitList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllProfit?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const getAllLossList = createAsyncThunk(
  "getAllLossList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllLoss?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const getAllOutFlowList = createAsyncThunk(
  "getAllOutFlowList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllOutFlow?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const getAllInFlowList = createAsyncThunk(
  "getAllInFlowList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllInFlow?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const getAllBalanceSheetLiabilities = createAsyncThunk(
  "getAllBalanceSheetLiabilities",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/balanceSheet/getAllBalanceSheetLiabilities?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const getAllBalanceSheetAssets = createAsyncThunk(
  "getAllBalanceSheetAssets",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/balanceSheet/getAllBalanceSheetAssets?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const deleteVoucherById = createAsyncThunk(
  "deleteVoucherById",
  async (id) => {
    const response = await api.delete(
      `/accountService/api/v1/voucher/deleteVoucherById?id=${id}`
    );
    return response.data;
  }
);

const OrganizationSlice = createSlice({
  name: "organization",
  initialState: {
    loading: "",
    organizationDetail: {},
    groupList: [],
    groupLedgerList: [],
    ledgerList: [],
    ledgerCount: 0,
    groupVoucherList: [],
    ledgerTypeList: [],
    voucherList: [],
    ledgerDetail: {},
    voucherTypeList: [],
    allEstimateByStatus: [],
    totalEstimateCount: 0,
    dailybookDetail: {},
    bankStatementList: [],
    allPaymentRegisterList: [],
    paymentRegistercont: 0,
    allInvoiceList: [],
    allInvoiceCount: 0,
    unBillList: [],
    unBillCount: 0,
    salesInvoiceList: [],
    tdsList: [],
    tdsAmount: {},
    profitDetail: {},
    lossDetail: {},
    inFlowList: [],
    outFlowList: [],
    trailBalanceList: [],
    balanceSheetLiabilitiesList: [],
    balanceSheetAssetsList: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getOrganizationByName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getOrganizationByName.fulfilled, (state, action) => {
      state.loading = "success";
      state.organizationDetail = action.payload;
    });
    builder.addCase(getOrganizationByName.rejected, (state) => {
      state.loading = "rejected";
      state.organizationDetail = {};
    });

    builder.addCase(getAllGroups.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllGroups.fulfilled, (state, action) => {
      state.loading = "success";
      state.groupList = action.payload;
    });
    builder.addCase(getAllGroups.rejected, (state) => {
      state.loading = "rejected";
      state.tdsAmount = [];
    });

    builder.addCase(getLedgerListByGroupId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLedgerListByGroupId.fulfilled, (state, action) => {
      state.loading = "success";
      state.groupLedgerList = action.payload;
    });
    builder.addCase(getLedgerListByGroupId.rejected, (state) => {
      state.loading = "rejected";
      state.groupLedgerList = [];
    });

    builder.addCase(getAllLedger.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLedger.fulfilled, (state, action) => {
      state.loading = "success";
      state.ledgerList = action.payload;
    });
    builder.addCase(getAllLedger.rejected, (state) => {
      state.loading = "rejected";
      state.ledgerList = [];
    });

    builder.addCase(getAllLedgerCounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLedgerCounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.ledgerCount = action.payload;
    });
    builder.addCase(getAllLedgerCounts.rejected, (state) => {
      state.loading = "rejected";
      state.ledgerCount = 0;
    });

    builder.addCase(getVoucherByGroupLedgerId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getVoucherByGroupLedgerId.fulfilled, (state, action) => {
      state.loading = "success";
      state.groupVoucherList = action.payload;
    });
    builder.addCase(getVoucherByGroupLedgerId.rejected, (state) => {
      state.loading = "rejected";
      state.groupVoucherList = [];
    });

    builder.addCase(getAllLedgerType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLedgerType.fulfilled, (state, action) => {
      state.loading = "success";
      state.ledgerTypeList = action.payload;
    });
    builder.addCase(getAllLedgerType.rejected, (state) => {
      state.loading = "rejected";
      state.ledgerTypeList = [];
    });

    builder.addCase(getAllVoucher.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVoucher.fulfilled, (state, action) => {
      state.loading = "success";
      state.voucherList = action.payload;
    });
    builder.addCase(getAllVoucher.rejected, (state) => {
      state.loading = "rejected";
      state.voucherList = [];
    });

    builder.addCase(getLedgerById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLedgerById.fulfilled, (state, action) => {
      state.loading = "success";
      state.ledgerDetail = action.payload;
    });
    builder.addCase(getLedgerById.rejected, (state) => {
      state.loading = "rejected";
      state.ledgerDetail = {};
    });

    builder.addCase(getAllVoucherType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVoucherType.fulfilled, (state, action) => {
      state.loading = "success";
      state.voucherTypeList = action.payload;
    });
    builder.addCase(getAllVoucherType.rejected, (state) => {
      state.loading = "rejected";
      state.voucherTypeList = [];
    });

    builder.addCase(getEstimateByStatus.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getEstimateByStatus.fulfilled, (state, action) => {
      state.loading = "success";
      state.allEstimateByStatus = action.payload;
    });
    builder.addCase(getEstimateByStatus.rejected, (state) => {
      state.loading = "rejected";
      state.allEstimateByStatus = [];
    });

    builder.addCase(getTotalCountOfEstimate.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalCountOfEstimate.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalEstimateCount = action.payload;
    });
    builder.addCase(getTotalCountOfEstimate.rejected, (state) => {
      state.loading = "rejected";
      state.totalEstimateCount = 0;
    });

    builder.addCase(getAllDailyBookRecord.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDailyBookRecord.fulfilled, (state, action) => {
      state.loading = "success";
      state.dailybookDetail = action.payload;
    });
    builder.addCase(getAllDailyBookRecord.rejected, (state) => {
      state.loading = "rejected";
      state.dailybookDetail = {};
    });

    builder.addCase(getAllBankStatements.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBankStatements.fulfilled, (state, action) => {
      state.loading = "success";
      state.bankStatementList = action.payload;
    });
    builder.addCase(getAllBankStatements.rejected, (state) => {
      state.loading = "rejected";
      state.bankStatementList = [];
    });

    builder.addCase(getAllPaymentRegisterWithPagination.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllPaymentRegisterWithPagination.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.allPaymentRegisterList = action.payload;
      }
    );
    builder.addCase(getAllPaymentRegisterWithPagination.rejected, (state) => {
      state.loading = "rejected";
      state.allPaymentRegisterList = [];
    });

    builder.addCase(getAllPaymentRegisterCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPaymentRegisterCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.paymentRegistercont = action.payload;
    });
    builder.addCase(getAllPaymentRegisterCount.rejected, (state) => {
      state.loading = "rejected";
      state.paymentRegistercont = null;
    });

    builder.addCase(getAllInvoice.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllInvoice.fulfilled, (state, action) => {
      state.loading = "success";
      state.allInvoiceList = action.payload;
    });
    builder.addCase(getAllInvoice.rejected, (state) => {
      state.loading = "rejected";
      state.allInvoiceList = [];
    });

    builder.addCase(getAllInvoiceCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllInvoiceCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.allInvoiceCount = action.payload;
    });
    builder.addCase(getAllInvoiceCount.rejected, (state) => {
      state.loading = "rejected";
      state.allInvoiceCount = 0;
    });

    builder.addCase(getAllUnbillList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUnbillList.fulfilled, (state, action) => {
      state.loading = "success";
      state.unBillList = action.payload;
    });
    builder.addCase(getAllUnbillList.rejected, (state) => {
      state.loading = "rejected";
      state.unBillList = [];
    });

    builder.addCase(getAllUnbillCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUnbillCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.unBillCount = action.payload;
    });
    builder.addCase(getAllUnbillCount.rejected, (state) => {
      state.loading = "rejected";
      state.unBillCount = [];
    });

    builder.addCase(getAllInvoiceForSale.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllInvoiceForSale.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesInvoiceList = action.payload;
    });
    builder.addCase(getAllInvoiceForSale.rejected, (state) => {
      state.loading = "rejected";
      state.salesInvoiceList = [];
    });

    builder.addCase(getAllTdsList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTdsList.fulfilled, (state, action) => {
      state.loading = "success";
      state.tdsList = action.payload;
    });
    builder.addCase(getAllTdsList.rejected, (state) => {
      state.loading = "rejected";
      state.tdsList = [];
    });

    builder.addCase(getTdsAmounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTdsAmounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.tdsAmount = action.payload;
    });
    builder.addCase(getTdsAmounts.rejected, (state) => {
      state.loading = "rejected";
      state.tdsAmount = [];
    });

    builder.addCase(getAllProfitList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProfitList.fulfilled, (state, action) => {
      state.loading = "success";
      state.profitDetail = action.payload;
    });
    builder.addCase(getAllProfitList.rejected, (state) => {
      state.loading = "rejected";
      state.profitDetail = {};
    });

    builder.addCase(getAllLossList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLossList.fulfilled, (state, action) => {
      state.loading = "success";
      state.lossDetail = action.payload;
    });
    builder.addCase(getAllLossList.rejected, (state) => {
      state.loading = "rejected";
      state.lossDetail = {};
    });

    builder.addCase(getAllInFlowList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllInFlowList.fulfilled, (state, action) => {
      state.loading = "success";
      state.inFlowList = action.payload;
    });
    builder.addCase(getAllInFlowList.rejected, (state) => {
      state.loading = "rejected";
      state.inFlowList = [];
    });

    builder.addCase(getAllOutFlowList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllOutFlowList.fulfilled, (state, action) => {
      state.loading = "success";
      state.outFlowList = action.payload;
    });
    builder.addCase(getAllOutFlowList.rejected, (state) => {
      state.loading = "rejected";
      state.outFlowList = [];
    });

    builder.addCase(getAllTrailBalance.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTrailBalance.fulfilled, (state, action) => {
      state.loading = "success";
      state.trailBalanceList = action.payload;
    });
    builder.addCase(getAllTrailBalance.rejected, (state) => {
      state.loading = "rejected";
      state.trailBalanceList = [];
    });

    builder.addCase(getAllBalanceSheetLiabilities.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllBalanceSheetLiabilities.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.balanceSheetLiabilitiesList = action.payload;
      }
    );
    builder.addCase(getAllBalanceSheetLiabilities.rejected, (state) => {
      state.loading = "rejected";
      state.balanceSheetLiabilitiesList = [];
    });

    builder.addCase(getAllBalanceSheetAssets.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBalanceSheetAssets.fulfilled, (state, action) => {
      state.loading = "success";
      state.balanceSheetAssetsList = action.payload;
    });
    builder.addCase(getAllBalanceSheetAssets.rejected, (state) => {
      state.loading = "rejected";
      state.balanceSheetAssetsList = [];
    });
  },
});

export default OrganizationSlice.reducer;
