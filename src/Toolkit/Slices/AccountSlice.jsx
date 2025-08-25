import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postQuery } from "../../API/PostQuery";
import { getQuery } from "../../API/GetQuery";
import { putQuery } from "../../API/PutQuery";

export const createVoucherType = createAsyncThunk(
  "createVoucherType",
  async ({ name }) => {
    const response = await postQuery(
      `/accountService/api/v1/voucherType/createVoucherType?name=${name}`
    );
    return response.data;
  }
);

export const getAllVoucherType = createAsyncThunk(
  "getAllVoucherType",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/voucherType/getAllVoucherType`
    );
    return response.data;
  }
);

export const updateVouchersType = createAsyncThunk(
  "updateVouchersType",
  async ({ name, id }) => {
    const response = await putQuery(
      `/accountService/api/v1/voucherType/updateVoucherType?name=${name}&id=${id}`
    );
    return response.data;
  }
);

export const createLedgerType = createAsyncThunk(
  "createLedgerType",
  async (data) => {
    const response = await postQuery(
      `/accountService/api/v1/ledgerType/createLedgerType`,
      data
    );
    return response.data;
  }
);

export const updateLedgerType = createAsyncThunk(
  "updateLedgerType",
  async (data) => {
    const response = await putQuery(
      `/accountService/api/v1/ledgerType/updateLedgerType`,
      data
    );
    return response.data;
  }
);

export const getAllLedgerType = createAsyncThunk(
  "getAllLedgerType",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/ledgerType/getAllLedgerType`
    );
    return response.data;
  }
);

export const createLedger = createAsyncThunk("createLedger", async (data) => {
  const response = await postQuery(
    `/accountService/api/v1/ledger/createLedger`,
    data
  );
  return response.data;
});

export const updateLedger = createAsyncThunk("updateLedger", async (data) => {
  const response = await putQuery(
    `/accountService/api/v1/ledger/updateLedger`,
    data
  );
  return response.data;
});

export const getAllLedger = createAsyncThunk(
  "getAllLedger",
  async ({ page, size }) => {
    const response = await getQuery(
      `/accountService/api/v1/ledger/getAllLedger?page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllLedgerCounts = createAsyncThunk(
  "getAllLedgerCounts",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/ledger/getAllLedgerCount`
    );
    return response.data;
  }
);

export const getLedgerTypeById = createAsyncThunk(
  "getLedgerTypeById",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/ledgerType/getAllLedgerTypeById?id=${id}`
    );
    return response.data;
  }
);

export const getLedgerById = createAsyncThunk("getLedgerById", async (id) => {
  const response = await getQuery(
    `/accountService/api/v1/ledger/getLedgerById?id=${id}`
  );
  return response.data;
});

export const createStatutory = createAsyncThunk(
  "createStatutory",
  async (data) => {
    const response = await postQuery(
      `/accountService/api/v1/statutory/addStatutoryDetails`,
      data
    );
    return response.data;
  }
);

export const getAllStatutoryList = createAsyncThunk(
  "getAllStatutoryList",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/statutory/getAllStatutoryDetails?currentUserId=${id}`
    );
    return response.data;
  }
);

export const getStatutoryItemDetail = createAsyncThunk(
  "getStatutoryItemDetail",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/statutory/getStatutoryDetails?id=${id}`
    );
    return response.data;
  }
);

export const updateStatutory = createAsyncThunk(
  "updateStatutory",
  async (data) => {
    const response = await putQuery(
      `/accountService/api/v1/statutory/updateStatutoryDetails`,
      data
    );
    return response.data;
  }
);

export const getAllVoucher = createAsyncThunk("getAllVoucher", async () => {
  const response = await getQuery(
    `/accountService/api/v1/voucher/getAllVoucher`
  );
  return response.data;
});

export const createVoucher = createAsyncThunk("createVoucher", async (data) => {
  const response = await postQuery(
    `/accountService/api/v1/voucher/createVoucher`,
    data
  );
  return response.data;
});

// export const updateVoucher=createAsyncThunk('updateVoucher',async()=>{
//   const response=await putQuery(``)
// })

export const getAllOrganizations = createAsyncThunk(
  "getAllOrganizations",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/organization/getAllOrganization`
    );
    return response.data;
  }
);

export const getOrganizationByName = createAsyncThunk(
  "getOrganizationByName",
  async (name) => {
    const response = await getQuery(
      `/accountService/api/v1/organization/getAllOrganizationByName?name=${name}`
    );
    return response.data;
  }
);

export const createOrganization = createAsyncThunk(
  "createOrganization",
  async (data) => {
    const response = await postQuery(
      `/accountService/api/v1/organization/createOrganization`,
      data
    );
    return response.data;
  }
);

export const getAllDailyBookRecord = createAsyncThunk(
  "getAllDailyBookRecord",
  async ({ startDate, endDate }) => {
    const response = await getQuery(
      `/accountService/api/v1/voucher/getAllVoucherInBetweenDate?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
);

export const getAllBankStatements = createAsyncThunk(
  "getAllBankStatements",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/bankStatements/getAllBankStatements`
    );
    return response.data;
  }
);

export const addBankDetails = createAsyncThunk(
  "addBankDetails",
  async (data) => {
    const response = await postQuery(
      `/accountService/api/v1/bankStatements/createBankStatement`,
      data
    );
    return response.data;
  }
);

export const createPaymentRegister = createAsyncThunk(
  "createPaymentRegister",
  async (data) => {
    const response = await postQuery(
      `/accountService/api/v1/paymentRegister/createPaymentRegister`,
      data
    );
    return response.data;
  }
);

export const createPurchaseOrder = createAsyncThunk(
  "createPurchaseOrder",
  async (data) => {
    const response = await postQuery(
      `/accountService/api/v1/paymentRegister/createPurchaseOrder`,
      data
    );
    return response.data;
  }
);

export const getAllPaymentRegister = createAsyncThunk(
  "getAllPaymentRegister",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegister`
    );
    return response.data;
  }
);

export const getUnusedBankStatement = createAsyncThunk(
  "getUnusedBankStatement",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/bankStatements/getUnusedBankStatement`
    );
    return response.data;
  }
);

export const getAllTdsList = createAsyncThunk("getAllTdsList", async () => {
  const response = await getQuery(`/accountService/api/v1/tds/getAllTds`);
  return response.data;
});

export const createTDS = createAsyncThunk("createTDS", async (data) => {
  const response = await postQuery(
    `/accountService/api/v1/tds/createTds`,
    data
  );
  return response.data;
});

export const getTdsAmounts = createAsyncThunk("getTdsAmounts", async () => {
  const response = await getQuery(`/accountService/api/v1/tds/getAllTdsCount`);
  return response.data;
});

export const approvedPayment = createAsyncThunk(
  "approvedPayment",
  async ({ bankstatementId, registerAmountId }) => {
    const response = await postQuery(
      `/accountService/api/v1/bankStatements/addRegisterAmountInBankStatement?bankstatementId=${bankstatementId}&registerAmountId=${registerAmountId}`
    );
    return response.data;
  }
);

export const getPaymentDetailListByEstimateId = createAsyncThunk(
  "getPaymentDetailListByEstimateId",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/paymentRegister/getPaymentRegisterByEstimateId?id=${id}`
    );
    return response.data;
  }
);

export const getAllGroups = createAsyncThunk("getAllGroups", async () => {
  const response = await getQuery(
    `/accountService/api/v1/ledgerType/getAllLedgerType`
  );
  return response.data;
});

export const getLedgerByGroupId = createAsyncThunk(
  "getLedgerByGroupId",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/ledger/getAllLedgerByGroupId?id=${id}`
    );
    return response.data;
  }
);

export const getAmountByGroupId = createAsyncThunk(
  "getLedgerCountByGroupId",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/ledger/getAllAmountByGroupId?id=${id}`
    );
    return response.data;
  }
);

export const getEstimateByStatus = createAsyncThunk(
  "getEstimateByStatus",
  async ({ status, page, size, userId }) => {
    const response = await getQuery(
      `/leadService/api/v1/leadEstimate/getEstimateByStatus?status=${status}&page=${page}&size=${size}&userId=${userId}`
    );
    return response.data;
  }
);

export const getTotalCountOfEstimate = createAsyncThunk(
  "getTotalCountOfEstimate",
  async ({ status, userId }) => {
    const response = await getQuery(
      `/leadService/api/v1/leadEstimate/getEstimateByStatusCount?status=${status}&userId=${userId}`
    );
    return response.data;
  }
);

export const searchAccountEstimate = createAsyncThunk(
  "searchAccountEstimate",
  async ({ searchText, userId }) => {
    const response = await getQuery(
      `/leadService/api/v1/leadEstimate/searchEstimate?search=${searchText}&userId=${userId}`
    );
    return response.data;
  }
);

export const approvedAndDisapprovedStatus = createAsyncThunk(
  "approvedAndDisapprovedStatus",
  async ({ status, estimateId, userId }) => {
    const response = await putQuery(
      `/leadService/api/v1/leadEstimate/approvedEstimate?status=${status}&estimateId=${estimateId}&userId=${userId}`
    );
    return response.data;
  }
);

export const getVoucherByGroupLedgerId = createAsyncThunk(
  "getVoucherByLedgerId",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/voucher/getAllVoucherByLedgerId?ledgerId=${id}`
    );
    return response.data;
  }
);

export const getAllInvoice = createAsyncThunk("getAllInvoice", async (id) => {
  const response = await getQuery(
    `/accountService/api/v1/paymentRegister/getAllInvoice?userId=${id}`
  );
  return response.data;
});

export const getAllInvoiceForSale = createAsyncThunk(
  "getAllInvoiceForSale",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/paymentRegister/getAllInvoiceForSales?userId=${id}`
    );
    return response.data;
  }
);

export const paymentRegisterconfirm = createAsyncThunk(
  "paymentRegisterconfirm",
  async ({ paymentRegisterId, estimateId }) => {
    const response = await putQuery(
      `/accountService/api/v1/paymentRegister/paymentApproveV3?paymentRegisterId=${paymentRegisterId}&estimateId=${estimateId}`
    );
    return response.data;
  }
);

export const getAllPaymentApprovals = createAsyncThunk(
  "getAllPaymentApprovals",
  async (userId) => {
    const response = await getQuery(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterWithCompany?userId=${userId}`
    );
    return response.data;
  }
);

export const approvedCompanyInPayment = createAsyncThunk(
  "approvedCompanyInPayment",
  async ({ stage, id }) => {
    const response = await putQuery(
      `/leadService/api/v1/company/updateStage?stage=${stage}&id=${id}`
    );
    return response.data;
  }
);

export const addStagingInProduct = createAsyncThunk(
  "addStagingInProduct",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/product/addStageInProduct`,
      data
    );
    return response.data;
  }
);

export const getAllPaymentRegisterCount = createAsyncThunk(
  "getAllPaymentRegisterCount",
  async (status) => {
    const response = await getQuery(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterCount?status=${status}`
    );
    return response.data;
  }
);

export const getAllPaymentRegisterWithPagination = createAsyncThunk(
  "getAllPaymentRegisterWithPagination",
  async ({ page, size, status }) => {
    const response = await getQuery(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterWithPage?page=${page}&size=${size}&status=${status}`
    );
    return response.data;
  }
);

export const getAllUnbillList = createAsyncThunk(
  "getAllUnbillList",
  async () => {
    const response = await getQuery(
      `/accountService/api/v1/ledgerType/getAllUnbilled`
    );
    return response.data;
  }
);

export const getUnbillItemById = createAsyncThunk(
  "getUnbillItemById",
  async (id) => {
    const response = await getQuery(
      `/accountService/api/v1/ledgerType/getUnbilledById?id=${id}`
    );
    return response.data;
  }
);

export const createUnbillItems = createAsyncThunk(
  "unbillItems",
  async (data) => {
    const response = await postQuery(
      `/accountService/api/v1/ledgerType/createUnbilled`,
      data
    );
    return response.data;
  }
);

const AccountSlice = createSlice({
  name: "account",
  initialState: {
    voucherTypeLoading: "",
    voucherTypeList: [],
    ledgerTypeLoading: "",
    ledgerTypeList: [],
    ledgerLoading: "",
    ledgerList: [],
    voucherLoading: "",
    voucherList: [],
    loading: "",
    ledgerDetail: {},
    organiztionList: [],
    statutoryList: [],
    statutoryDetail: {},
    dailybookList: [],
    organizationDetail: {},
    bankStatementList: [],
    paymentRegisterList: [],
    unusedBankStatementList: [],
    tdsList: [],
    tdsAmount: {},
    paymentList: [],
    groupList: [],
    groupLedgerList: [],
    allEstimateByStatus: [],
    totalEstimateCount: 0,
    groupVoucherList: [],
    salesInvoiceList: [],
    allInvoiceList: [],
    paymentApprovalList: [],
    paymentRegistercont: null,
    allPaymentRegisterList: [],
    ledgerCount: 0,
    unBillList: [],
    unBillItemDetail: {},
  },
  extraReducers: (builder) => {
    builder.addCase(getAllVoucherType.pending, (state, action) => {
      state.voucherTypeLoading = "pending";
    });
    builder.addCase(getAllVoucherType.fulfilled, (state, action) => {
      state.voucherTypeLoading = "success";
      state.voucherTypeList = action.payload;
    });
    builder.addCase(getAllVoucherType.rejected, (state, action) => {
      state.voucherTypeLoading = "rejected";
      state.voucherTypeList = [];
    });

    builder.addCase(getAllLedgerType.pending, (state, action) => {
      state.ledgerTypeLoading = "pending";
    });
    builder.addCase(getAllLedgerType.fulfilled, (state, action) => {
      state.ledgerTypeLoading = "success";
      state.ledgerTypeList = action.payload;
    });
    builder.addCase(getAllLedgerType.rejected, (state, action) => {
      state.ledgerTypeLoading = "rejected";
      state.ledgerTypeList = [];
    });

    builder.addCase(getAllLedger.pending, (state, action) => {
      state.ledgerLoading = "pending";
    });
    builder.addCase(getAllLedger.fulfilled, (state, action) => {
      state.ledgerLoading = "success";
      state.ledgerList = action.payload;
    });
    builder.addCase(getAllLedger.rejected, (state, action) => {
      state.ledgerLoading = "rejected";
      state.ledgerList = [];
    });

    builder.addCase(getAllVoucher.pending, (state, action) => {
      state.voucherLoading = "pending";
    });
    builder.addCase(getAllVoucher.fulfilled, (state, action) => {
      state.voucherLoading = "success";
      state.voucherList = action.payload;
    });
    builder.addCase(getAllVoucher.rejected, (state, action) => {
      state.voucherLoading = "rejected";
      state.voucherList = [];
    });

    builder.addCase(getLedgerById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getLedgerById.fulfilled, (state, action) => {
      state.loading = "success";
      state.ledgerDetail = action.payload;
    });
    builder.addCase(getLedgerById.rejected, (state, action) => {
      state.loading = "rejected";
      state.ledgerDetail = {};
    });

    builder.addCase(getAllStatutoryList.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllStatutoryList.fulfilled, (state, action) => {
      state.loading = "success";
      state.statutoryList = action.payload;
    });
    builder.addCase(getAllStatutoryList.rejected, (state, action) => {
      state.loading = "rejected";
      state.statutoryList = [];
    });

    builder.addCase(getAllOrganizations.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllOrganizations.fulfilled, (state, action) => {
      state.loading = "success";
      state.organiztionList = action.payload;
    });
    builder.addCase(getAllOrganizations.rejected, (state, action) => {
      state.loading = "rejected";
      state.organiztionList = [];
    });

    builder.addCase(getStatutoryItemDetail.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getStatutoryItemDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.statutoryDetail = action.payload;
    });
    builder.addCase(getStatutoryItemDetail.rejected, (state, action) => {
      state.loading = "rejected";
      state.statutoryDetail = [];
    });

    builder.addCase(getAllDailyBookRecord.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDailyBookRecord.fulfilled, (state, action) => {
      state.loading = "success";
      state.dailybookList = action.payload;
    });
    builder.addCase(getAllDailyBookRecord.rejected, (state, action) => {
      state.loading = "rejected";
      state.dailybookList = [];
    });

    builder.addCase(getOrganizationByName.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getOrganizationByName.fulfilled, (state, action) => {
      state.loading = "success";
      state.organizationDetail = action.payload;
    });
    builder.addCase(getOrganizationByName.rejected, (state, action) => {
      state.loading = "rejected";
      state.organizationDetail = {};
    });

    builder.addCase(getAllBankStatements.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBankStatements.fulfilled, (state, action) => {
      state.loading = "success";
      state.bankStatementList = action.payload;
    });
    builder.addCase(getAllBankStatements.rejected, (state, action) => {
      state.loading = "rejected";
      state.bankStatementList = [];
    });

    builder.addCase(getAllPaymentRegister.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPaymentRegister.fulfilled, (state, action) => {
      state.loading = "success";
      state.paymentRegisterList = action.payload;
    });
    builder.addCase(getAllPaymentRegister.rejected, (state, action) => {
      state.loading = "rejected";
      state.paymentRegisterList = [];
    });

    builder.addCase(getUnusedBankStatement.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getUnusedBankStatement.fulfilled, (state, action) => {
      state.loading = "success";
      state.unusedBankStatementList = action.payload;
    });
    builder.addCase(getUnusedBankStatement.rejected, (state, action) => {
      state.loading = "rejected";
      state.unusedBankStatementList = [];
    });

    builder.addCase(getAllTdsList.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTdsList.fulfilled, (state, action) => {
      state.loading = "success";
      state.tdsList = action.payload;
    });
    builder.addCase(getAllTdsList.rejected, (state, action) => {
      state.loading = "rejected";
      state.tdsList = [];
    });

    builder.addCase(getTdsAmounts.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getTdsAmounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.tdsAmount = action.payload;
    });
    builder.addCase(getTdsAmounts.rejected, (state, action) => {
      state.loading = "rejected";
      state.tdsAmount = [];
    });

    builder.addCase(
      getPaymentDetailListByEstimateId.pending,
      (state, action) => {
        state.loading = "pending";
      }
    );
    builder.addCase(
      getPaymentDetailListByEstimateId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.paymentList = action.payload;
      }
    );
    builder.addCase(
      getPaymentDetailListByEstimateId.rejected,
      (state, action) => {
        state.loading = "rejected";
        state.tdsAmount = [];
      }
    );

    builder.addCase(getAllGroups.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllGroups.fulfilled, (state, action) => {
      state.loading = "success";
      state.groupList = action.payload;
    });
    builder.addCase(getAllGroups.rejected, (state, action) => {
      state.loading = "rejected";
      state.tdsAmount = [];
    });

    builder.addCase(getEstimateByStatus.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getEstimateByStatus.fulfilled, (state, action) => {
      state.loading = "success";
      state.allEstimateByStatus = action.payload;
    });
    builder.addCase(getEstimateByStatus.rejected, (state, action) => {
      state.loading = "rejected";
      state.allEstimateByStatus = [];
    });

    builder.addCase(getTotalCountOfEstimate.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalCountOfEstimate.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalEstimateCount = action.payload;
    });
    builder.addCase(getTotalCountOfEstimate.rejected, (state, action) => {
      state.loading = "rejected";
      state.totalEstimateCount = 0;
    });

    builder.addCase(getLedgerByGroupId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getLedgerByGroupId.fulfilled, (state, action) => {
      state.loading = "success";
      state.groupLedgerList = action.payload;
    });
    builder.addCase(getLedgerByGroupId.rejected, (state, action) => {
      state.loading = "rejected";
      state.groupLedgerList = [];
    });

    builder.addCase(getAmountByGroupId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAmountByGroupId.fulfilled, (state, action) => {
      state.loading = "success";
      state.groupAmountDetail = action.payload;
    });
    builder.addCase(getAmountByGroupId.rejected, (state, action) => {
      state.loading = "rejected";
      state.groupAmountDetail = {};
    });

    builder.addCase(getVoucherByGroupLedgerId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getVoucherByGroupLedgerId.fulfilled, (state, action) => {
      state.loading = "success";
      state.groupVoucherList = action.payload;
    });
    builder.addCase(getVoucherByGroupLedgerId.rejected, (state, action) => {
      state.loading = "rejected";
      state.groupVoucherList = [];
    });

    builder.addCase(getAllInvoice.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllInvoice.fulfilled, (state, action) => {
      state.loading = "success";
      state.allInvoiceList = action.payload;
    });
    builder.addCase(getAllInvoice.rejected, (state, action) => {
      state.loading = "rejected";
      state.allInvoiceList = [];
    });

    builder.addCase(getAllInvoiceForSale.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllInvoiceForSale.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesInvoiceList = action.payload;
    });
    builder.addCase(getAllInvoiceForSale.rejected, (state, action) => {
      state.loading = "rejected";
      state.salesInvoiceList = [];
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

    builder.addCase(getAllPaymentRegisterCount.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPaymentRegisterCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.paymentRegistercont = action.payload;
    });
    builder.addCase(getAllPaymentRegisterCount.rejected, (state, action) => {
      state.loading = "rejected";
      state.paymentRegistercont = null;
    });

    builder.addCase(getAllLedgerCounts.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLedgerCounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.ledgerCount = action.payload;
    });
    builder.addCase(getAllLedgerCounts.rejected, (state, action) => {
      state.loading = "rejected";
      state.ledgerCount = 0;
    });

    builder.addCase(
      getAllPaymentRegisterWithPagination.pending,
      (state, action) => {
        state.loading = "pending";
      }
    );
    builder.addCase(
      getAllPaymentRegisterWithPagination.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.allPaymentRegisterList = action.payload;
      }
    );
    builder.addCase(
      getAllPaymentRegisterWithPagination.rejected,
      (state, action) => {
        state.loading = "rejected";
        state.allPaymentRegisterList = [];
      }
    );

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

    builder.addCase(getUnbillItemById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getUnbillItemById.fulfilled, (state, action) => {
      state.loading = "success";
      state.unBillItemDetail = action.payload;
    });
    builder.addCase(getUnbillItemById.rejected, (state) => {
      state.loading = "rejected";
      state.unBillItemDetail = {};
    });
  },
});

export default AccountSlice.reducer;
