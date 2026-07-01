import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

export const getOrganizationByName = createAsyncThunk(
  "getOrganizationByName",
  async () => {
    const response = await api.get(`/accountService/api/v1`);
    return response.data;
  },
);

export const createOrganization = createAsyncThunk(
  "createOrganization",
  async ({ userId, data }) => {
    const response = await api.post(
      `/accountService/api/v1/createOrganization?userId=${userId}`,
      data,
    );
    return response.data;
  },
);

export const updateOrganization = createAsyncThunk(
  "updateOrganization",
  async ({ id, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/organizations/${id}?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const addStatutory = createAsyncThunk("addStatutory", async (data) => {
  const response = await api.post(
    `/accountService/api/v1/statutory/addStatutoryDetails`,
    data,
  );
  return response.data;
});

export const getAllOrganizations = createAsyncThunk(
  "getAllOrganizations",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/organization/getAllOrganization`,
    );
    return response.data;
  },
);

export const getAllGroups = createAsyncThunk("getAllGroups", async () => {
  const response = await api.get(
    `/accountService/api/v1/ledgerType/getAllLedgerType`,
  );
  return response.data;
});

export const getLedgerListByGroupId = createAsyncThunk(
  "getLedgerByGroupId",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/ledger/getAllLedgerByGroupId?id=${id}`,
    );
    return response.data;
  },
);

export const getAllLedger = createAsyncThunk(
  "getAllLedger",
  async ({ page, size }) => {
    const response = await api.get(
      `/accountService/api/v1/ledger/getAllLedger?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getAllLedgerCounts = createAsyncThunk(
  "getAllLedgerCounts",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/ledger/getAllLedgerCount`,
    );
    return response.data;
  },
);

export const getVoucherByGroupLedgerId = createAsyncThunk(
  "getVoucherByLedgerId",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/voucher/getAllVoucherByLedgerId?ledgerId=${id}`,
    );
    return response.data;
  },
);

export const getAllLedgerType = createAsyncThunk(
  "getAllLedgerType",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/ledgerType/getAllLedgerType`,
    );
    return response.data;
  },
);

export const getLedgerTypeById = createAsyncThunk(
  "getLedgerTypeById",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/ledgerType/getAllLedgerTypeById?id=${id}`,
    );
    return response.data;
  },
);

export const getAllVoucher = createAsyncThunk("getAllVoucher", async () => {
  const response = await api.get(
    `/accountService/api/v1/voucher/getAllVoucher`,
  );
  return response.data;
});

export const getLedgerById = createAsyncThunk("getLedgerById", async (id) => {
  const response = await api.get(
    `/accountService/api/v1/ledger/getLedgerById?id=${id}`,
  );
  return response.data;
});

export const createVoucher = createAsyncThunk("createVoucher", async (data) => {
  const response = await api.post(
    `/accountService/api/v1/voucher/createVoucher`,
    data,
  );
  return response.data;
});

export const getAllVoucherType = createAsyncThunk(
  "getAllVoucherType",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/voucherType/getAllVoucherType`,
    );
    return response.data;
  },
);

export const getEstimateByStatus = createAsyncThunk(
  "getEstimateByStatus",
  async ({ status, page, size, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateByStatus?status=${status}&page=${page}&size=${size}&userId=${userId}`,
    );
    return response.data;
  },
);

export const getTotalCountOfEstimate = createAsyncThunk(
  "getTotalCountOfEstimate",
  async ({ status, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getEstimateByStatusCount?status=${status}&userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllDailyBookRecord = createAsyncThunk(
  "getAllDailyBookRecord",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/voucher/getAllVoucherInBetweenDate?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const estimateApprovedAndDisapprovedStatus = createAsyncThunk(
  "approvedAndDisapprovedStatus",
  async ({ status, estimateId, userId }) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/approvedEstimate?status=${status}&estimateId=${estimateId}&userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllBankStatements = createAsyncThunk(
  "getAllBankStatements",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/bankStatements/getAllBankStatements`,
    );
    return response.data;
  },
);

export const addBankDetails = createAsyncThunk(
  "addBankDetails",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/bankStatements/createBankStatement`,
      data,
    );
    return response.data;
  },
);

export const getAllPaymentRegisterWithPagination = createAsyncThunk(
  "getAllPaymentRegisterWithPagination",
  async ({ page, size, status }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterWithPage?page=${page}&size=${size}&status=${status}`,
    );
    return response.data;
  },
);

export const getAllPaymentRegisterCount = createAsyncThunk(
  "getAllPaymentRegisterCount",
  async (status) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllPaymentRegisterCount?status=${status}`,
    );
    return response.data;
  },
);

export const paymentRegisterAction = createAsyncThunk(
  "paymentRegisterAction",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/paymentRegister/paymentApproveManual`,
      data,
    );
    return response.data;
  },
);

export const getAllInvoice = createAsyncThunk(
  "getAllInvoice",
  async ({ userId, page, size, status }) => {
    const response = await api.get(
      `/accountService/api/v1/invoices/list?status=${status}&userId=${userId}&page=${page}&size=${size}`,
    );
    console.log("Invoice API Res:", response);
    return response.data;
  },
);

export const getAllInvoiceCount = createAsyncThunk(
  "getAllInvoiceCount",
  async ({ userId, status }) => {
    const response = await api.get(
      `/accountService/api/v1/invoices/count?status=${status}&createdById=${userId}`,
    );
    return response.data;
  },
);

export const searchInvoiceByCompanyNameAndInvoice = createAsyncThunk(
  "searchInvoiceByCompanyNameAndInvoice",
  async (data, { rejectWithValue }) => {
    try {
      if (data?.type === "invoiceNumber") {
        const response = await api.get(
          `/accountService/api/v1/invoices/search?invoiceNumber=${data?.searchText}&page=${data?.page}&size=${data?.size}`,
        );
        return response.data;
      } else {
        const response = await api.get(
          `/accountService/api/v1/invoices/search?companyName=${data?.searchText}&page=${data?.page}&size=${data?.size}`,
        );
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const searchInvoiceCountByCompanyNameAndInvoice = createAsyncThunk(
  "searchInvoiceCountByCompanyNameAndInvoice",
  async (data, { rejectWithValue }) => {
    try {
      if (data?.type === "invoiceNumber") {
        const response = await api.get(
          `/accountService/api/v1/invoices/search/count?invoiceNumber=${data?.searchText}`,
        );
        return response.data;
      } else {
        const response = await api.get(
          `/accountService/api/v1/invoices/search/count?companyName=${data?.searchText}`,
        );
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllUnbillList = createAsyncThunk(
  "getAllUnbillList",
  async ({ page, size, status, userId }) => {
    const response = await api.get(
      `/accountService/api/v1/unbilled-invoices/list?status=${status}&userId=${userId}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);
export const getAllUnbillGovtFeeList = createAsyncThunk(
  "getAllUnbillGovtFeeList",
  async (unbilledId) => {
    const response = await api.get(
      `/accountService/api/v1/unbilled-invoices/government-fee?unbilledId=${unbilledId}`,
    );
    console.log("Govt Fee API Res:", response);
    return response.data;
  },
);

export const getAllUnbillCount = createAsyncThunk(
  "getAllUnbillCount",
  async ({ status, userId }) => {
    const response = await api.get(
      `/accountService/api/v1/unbilled-invoices/count?status=${status}&userId=${userId}`,
    );
    return response.data;
  },
);

export const updateStatusForUnbill = createAsyncThunk(
  "updateStatusForUnbill",
  async ({ unbilledId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/unbilled-invoices/${unbilledId}/updateStatus`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getAllInvoiceForSale = createAsyncThunk(
  "getAllInvoiceForSale",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllInvoiceForSales?userId=${id}`,
    );
    return response.data;
  },
);

export const getAllTdsList = createAsyncThunk("getAllTdsList", async () => {
  const response = await api.get(`/accountService/api/v1/tds/getAllTds`);
  return response.data;
});

export const createTDS = createAsyncThunk("createTDS", async (data) => {
  const response = await api.post(`/accountService/api/v1/tds/createTds`, data);
  return response.data;
});

export const claimTDS = createAsyncThunk(
  "claimTDS",
  async ({ id, amount, document, tdsClaimBy }) => {
    const response = await api.post(
      `/accountService/api/v1/tds/updateTdsClaimAmount?id=${id}&tdsClaimBy=${tdsClaimBy}&amount=${amount}&document=${document}`,
    );
    return response.data;
  },
);

export const getTdsAmounts = createAsyncThunk("getTdsAmounts", async () => {
  const response = await api.get(`/accountService/api/v1/tds/getAllTdsCount`);
  return response.data;
});

export const updateVouchersType = createAsyncThunk(
  "updateVouchersType",
  async ({ name, id }) => {
    const response = await api.put(
      `/accountService/api/v1/voucherType/updateVoucherType?name=${name}&id=${id}`,
    );
    return response.data;
  },
);

export const createVoucherType = createAsyncThunk(
  "createVoucherType",
  async ({ name }) => {
    const response = await api.post(
      `/accountService/api/v1/voucherType/createVoucherType?name=${name}`,
    );
    return response.data;
  },
);

export const updateLedgerType = createAsyncThunk(
  "updateLedgerType",
  async (data) => {
    const response = await api.put(
      `/accountService/api/v1/ledgerType/updateLedgerType`,
      data,
    );
    return response.data;
  },
);

export const createLedgerType = createAsyncThunk(
  "createLedgerType",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/ledgerType/createLedgerType`,
      data,
    );
    return response.data;
  },
);

export const getAllTrailBalance = createAsyncThunk(
  "unbillItems",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/trialBalance/getAllTrialBalanceData?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllProfitList = createAsyncThunk(
  "getAllProfitList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllProfit?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllLossList = createAsyncThunk(
  "getAllLossList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllLoss?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getProfitLossDetail = createAsyncThunk(
  "getProfitLossDetail",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllProfitAndLoss?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllOutFlowList = createAsyncThunk(
  "getAllOutFlowList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllOutFlow?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllInFlowList = createAsyncThunk(
  "getAllInFlowList",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllInFlow?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllCashFlowDetail = createAsyncThunk(
  "getAllCashFlowDetail",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/cashFlow/getAllCashInAndOutFlow?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllBalanceSheetLiabilities = createAsyncThunk(
  "getAllBalanceSheetLiabilities",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/balanceSheet/getAllBalanceSheetLiabilities?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllBalanceSheetAssets = createAsyncThunk(
  "getAllBalanceSheetAssets",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/balanceSheet/getAllBalanceSheetAssets?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getAllBalanceSheetDetail = createAsyncThunk(
  "getAllBalanceSheetDetail",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/balanceSheet/getAllAssetsAndLiabilities`,
    );
    return response.data;
  },
);

export const deleteVoucherById = createAsyncThunk(
  "deleteVoucherById",
  async (id) => {
    const response = await api.delete(
      `/accountService/api/v1/voucher/deleteVoucherById?id=${id}`,
    );
    return response.data;
  },
);

export const getAllStatutoryList = createAsyncThunk(
  "getAllStatutoryList",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/statutory/getAllStatutoryDetails?currentUserId=${id}`,
    );
    return response.data;
  },
);

export const updateStatutory = createAsyncThunk(
  "updateStatutory",
  async (data) => {
    const response = await api.put(
      `/accountService/api/v1/statutory/updateStatutoryDetails`,
      data,
    );
    return response.data;
  },
);

export const createStatutory = createAsyncThunk(
  "createStatutory",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/statutory/addStatutoryDetails`,
      data,
    );
    return response.data;
  },
);

export const getGstList = createAsyncThunk(
  "getGstList",
  async ({ page, size, startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/gstData/getAllGstDataCrm?page=${page}&size=${size}&startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getGstListCount = createAsyncThunk(
  "getGstListCount",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/gstData/getAllGstDataCrmCount?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getGstExportedData = createAsyncThunk(
  "getGstExportedData",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/gstData/getAllGstDataCrmForExport?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const clainGSTAmount = createAsyncThunk(
  "clainGSTAmount",
  async ({ id, amount, documents }) => {
    const response = await api.put(
      `/accountService/api/v1/gstData/updateGstClaimAmount?id=${id}&amount=${amount}&documents=${documents}`,
    );
    return response.data;
  },
);

export const getAllOrganizationBankAccounts = createAsyncThunk(
  "getAllOrganizationBankAccounts",
  async (organizationId) => {
    const response = await api.get(
      `/accountService/api/v1/organization/getAllBankAccountByOrganization?organizationId=${organizationId}`,
    );
    return response.data;
  },
);

export const addOrganizationBankDetail = createAsyncThunk(
  "addOrganizationBankDetail",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/organization/addBankAccountInOrganization`,
      data,
    );
    return response.data;
  },
);

export const getAllSalesReport = createAsyncThunk(
  "getAllSalesReport",
  async ({ page, size, status, startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/salesReport/getAllSalesReport?page=${page}&size=${size}&status=${status}&startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getSalesReportCount = createAsyncThunk(
  "getSalesReportCount",
  async ({ status }) => {
    const response = await api.get(
      `/accountService/api/v1/salesReport/getAllSalesReportCount?status=${status}&startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const getSalesReportExportedData = createAsyncThunk(
  "getSalesReportExportedData",
  async ({ status, startDate, endDate }) => {
    const response = await api.get(
      `/accountService/api/v1/salesReport/getAllSalesReportForExport?status=${status}&startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },
);

export const searchUnbilledByCompanyNameAndUnbilled = createAsyncThunk(
  "searchUnbilledByCompanyNameAndUnbilled",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/unbilled-invoices/search`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getUnbilledReport = createAsyncThunk(
  "organization/getUnbilledReport",
  async (
    { userId, createdByUserId, status, fromDate, toDate },
    { rejectWithValue },
  ) => {
    try {
      const params = {};

      if (userId !== undefined && userId !== null && userId !== "") {
        params.userId = userId;
      }

      if (
        createdByUserId !== undefined &&
        createdByUserId !== null &&
        createdByUserId !== ""
      ) {
        params.createdByUserId = createdByUserId;
      }

      if (status && status !== "ALL") {
        params.status = status;
      }

      if (fromDate) {
        params.fromDate = String(fromDate).trim();
      }

      if (toDate) {
        params.toDate = String(toDate).trim();
      }

      const response = await api.get(
        "/accountService/api/v1/unbilled-invoices/report",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: error?.message || "Failed to fetch unbilled report",
        },
      );
    }
  },
);

export const getInvoiceReport = createAsyncThunk(
  "organization/getInvoiceReport",
  async (
    { userId, createdByUserId, status, fromDate, toDate },
    { rejectWithValue },
  ) => {
    try {
      const params = {};

      if (userId !== undefined && userId !== null && userId !== "") {
        params.userId = userId;
      }

      if (
        createdByUserId !== undefined &&
        createdByUserId !== null &&
        createdByUserId !== ""
      ) {
        params.createdByUserId = createdByUserId;
      }

      if (status && status !== "ALL") {
        params.status = status;
      }

      if (fromDate) {
        params.fromDate = String(fromDate).trim();
      }

      if (toDate) {
        params.toDate = String(toDate).trim();
      }

      const response = await api.get("/accountService/api/v1/invoices/report", {
        params,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: error?.message || "Failed to fetch invoice report",
        },
      );
    }
  },
);

export const getLedgerGroups = createAsyncThunk(
  "ledgerGroup/getLedgerGroups",
  async (
    { search = "", groupType = "", active = "", page = 1, size = 20 } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = {
        page: Math.max(Number(page) - 1, 0), // UI page 1 => backend page 0
        size: Number(size) || 20,
      };

      if (search?.trim()) {
        params.search = search.trim();
      }

      if (groupType) {
        params.groupType = groupType;
      }

      if (active !== "" && active !== null && active !== undefined) {
        params.active = active;
      }

      const response = await api.get(`/accountService/api/v1/ledger-groups`, {
        params,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createLedgerGroup = createAsyncThunk(
  "ledgerGroup/createLedgerGroup",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/ledger-groups`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateLedgerGroup = createAsyncThunk(
  "ledgerGroup/updateLedgerGroup",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/ledger-groups/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteLedgerGroup = createAsyncThunk(
  "ledgerGroup/deleteLedgerGroup",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/accountService/api/v1/ledger-groups/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchLedgers = createAsyncThunk(
  "ledger/fetchLedgers",
  async (
    {
      search = "",
      ledgerType = "ALL",
      ledgerGroupId = "",
      active = "ALL",
      page = 1,
      size = 20,
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = {
        page,
        size,
      };

      if (search?.trim()) {
        params.search = search.trim();
      }

      if (ledgerType && ledgerType !== "ALL") {
        params.ledgerType = ledgerType;
      }

      if (ledgerGroupId !== "" && ledgerGroupId !== null) {
        params.ledgerGroupId = ledgerGroupId;
      }

      if (active !== "ALL") {
        params.active = active === true || active === "true";
      }

      const response = await api.get(`/accountService/api/v1/ledgers`, {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createLedger = createAsyncThunk(
  "ledger/createLedger",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/ledgers`,
        payload,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateLedger = createAsyncThunk(
  "ledger/updateLedger",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/ledgers/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteLedger = createAsyncThunk(
  "ledger/deleteLedger",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/accountService/api/v1/ledgers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getAccountingVouchers = createAsyncThunk(
  "accountingVoucher/getAccountingVouchers",
  async (
    {
      voucherType = "",
      sourceType = "",
      status = "",
      fromDate = "",
      toDate = "",
      page = 1,
      size = 20,
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = {
        page,
        size,
      };

      if (voucherType) {
        params.voucherType = voucherType;
      }

      if (sourceType) {
        params.sourceType = sourceType;
      }

      if (status) {
        params.status = status;
      }

      if (fromDate) {
        params.fromDate = fromDate;
      }

      if (toDate) {
        params.toDate = toDate;
      }

      const response = await api.get(
        "/accountService/api/v1/accounting-vouchers",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createAccountingVoucher = createAsyncThunk(
  "accountingVoucher/createAccountingVoucher",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/accountService/api/v1/accounting-vouchers",
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getAllLedgerGroupType = createAsyncThunk(
  "getAllLedgerGroupType",
  async () => {
    const response = await api.get(
      `/accountService/api/v1/ledger-groups/group-types`,
    );
    return response.data;
  },
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
    trailBalanceList: {},
    balanceSheetLiabilitiesList: [],
    balanceSheetAssetsList: [],
    statutoryList: [],
    gstList: [],
    gstListCount: 0,
    gstExportedDataList: [],
    profitLossDetail: {},
    balanceSheetDetail: {},
    cashInOutFlowDetail: [],
    allOrganizationAccountList: [],
    salesReportList: [],
    salesReportExportedData: [],
    salesReportCount: 0,
    ledgerGroupList: [],
    ledgerGroupPage: {},
    ledgerGroupTotalElements: 0,
    ledgerGroupTotalPages: 0,
    ledgerGroupPageNumber: 0,
    ledgerGroupPageSize: 20,
    ledgerGroupNumberOfElements: 0,
    ledgerGroupFirst: true,
    ledgerGroupLast: true,
    ledgerGroupEmpty: true,

    ledgerGroupLoading: "",
    createLedgerGroupLoading: "",
    updateLedgerGroupLoading: "",
    deleteLedgerGroupLoading: "",
    ledgerGroupError: "",

    ledgers: [],
    selectedLedgerId: null,

    search: "",
    ledgerTypeFilter: "ALL",
    ledgerGroupIdFilter: "",
    activeFilter: "ALL",

    page: 1,
    size: 20,
    totalPages: 0,
    totalElements: 0,

    loading: false,
    saving: false,
    deletingId: null,
    error: "",

    accountingVoucherList: [],
    accountingVoucherPage: {},
    accountingVoucherTotalElements: 0,
    accountingVoucherTotalPages: 0,
    accountingVoucherPageNumber: 0,
    accountingVoucherPageSize: 20,
    accountingVoucherNumberOfElements: 0,
    accountingVoucherFirst: true,
    accountingVoucherLast: true,
    accountingVoucherEmpty: true,

    accountingVoucherLoading: "",
    createAccountingVoucherLoading: "",
    accountingVoucherError: "",

    ledgerGroupTypeList: [],
  },
  reducers: {
    setSelectedLedgerId: (state, action) => {
      state.selectedLedgerId = action.payload;
    },

    setLedgerSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
    },

    setLedgerTypeFilter: (state, action) => {
      state.ledgerTypeFilter = action.payload;
      state.page = 1;
    },

    setLedgerGroupIdFilter: (state, action) => {
      state.ledgerGroupIdFilter = action.payload;
      state.page = 1;
    },

    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
      state.page = 1;
    },

    setLedgerPage: (state, action) => {
      state.page = action.payload;
    },

    clearLedgerError: (state) => {
      state.error = "";
    },
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
      },
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

    builder.addCase(searchInvoiceByCompanyNameAndInvoice.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      searchInvoiceByCompanyNameAndInvoice.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.allInvoiceList = action.payload;
      },
    );
    builder.addCase(searchInvoiceByCompanyNameAndInvoice.rejected, (state) => {
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

    builder.addCase(
      searchInvoiceCountByCompanyNameAndInvoice.pending,
      (state) => {
        state.loading = "pending";
      },
    );
    builder.addCase(
      searchInvoiceCountByCompanyNameAndInvoice.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.allInvoiceCount = action.payload;
      },
    );
    builder.addCase(
      searchInvoiceCountByCompanyNameAndInvoice.rejected,
      (state) => {
        state.loading = "rejected";
        state.allInvoiceCount = 0;
      },
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

    builder.addCase(getAllCashFlowDetail.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCashFlowDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.cashInOutFlowDetail = action.payload;
    });
    builder.addCase(getAllCashFlowDetail.rejected, (state) => {
      state.loading = "rejected";
      state.cashInOutFlowDetail = [];
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
      state.trailBalanceList = {};
    });

    builder.addCase(getAllBalanceSheetLiabilities.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllBalanceSheetLiabilities.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.balanceSheetLiabilitiesList = action.payload;
      },
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

    builder.addCase(getAllStatutoryList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllStatutoryList.fulfilled, (state, action) => {
      state.loading = "success";
      state.statutoryList = action.payload;
    });
    builder.addCase(getAllStatutoryList.rejected, (state) => {
      state.loading = "rejected";
      state.statutoryList = [];
    });

    builder.addCase(getGstList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getGstList.fulfilled, (state, action) => {
      state.loading = "success";
      state.gstList = action.payload;
    });
    builder.addCase(getGstList.rejected, (state) => {
      statusbar.loading = "rejected";
      state.gstList = [];
    });

    builder.addCase(getGstListCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getGstListCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.gstListCount = action.payload;
    });
    builder.addCase(getGstListCount.rejected, (state) => {
      statusbar.loading = "rejected";
      state.gstListCount = 0;
    });

    builder.addCase(getGstExportedData.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getGstExportedData.fulfilled, (state, action) => {
      state.loading = "success";
      state.gstExportedDataList = action.payload;
    });
    builder.addCase(getGstExportedData.rejected, (state) => {
      state.loading = "rejected";
      state.gstExportedDataList = [];
    });

    builder.addCase(getProfitLossDetail.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getProfitLossDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.profitLossDetail = action.payload;
    });
    builder.addCase(getProfitLossDetail.rejected, (state) => {
      statusbar.loading = "rejected";
      state.profitLossDetail = {};
    });

    builder.addCase(getAllBalanceSheetDetail.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBalanceSheetDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.balanceSheetDetail = action.payload;
    });
    builder.addCase(getAllBalanceSheetDetail.rejected, (state) => {
      statusbar.loading = "rejected";
      state.balanceSheetDetail = {};
    });

    builder.addCase(getAllOrganizationBankAccounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllOrganizationBankAccounts.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.allOrganizationAccountList = action.payload;
      },
    );
    builder.addCase(getAllOrganizationBankAccounts.rejected, (state) => {
      state.loading = "rejected";
      state.allOrganizationAccountList = [];
    });

    builder.addCase(getAllSalesReport.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSalesReport.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesReportList = action.payload;
    });
    builder.addCase(getAllSalesReport.rejected, (state) => {
      state.loading = "rejected";
      state.salesReportList = [];
    });

    builder.addCase(getSalesReportCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSalesReportCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesReportCount = action.payload;
    });
    builder.addCase(getSalesReportCount.rejected, (state) => {
      state.loading = "rejected";
      state.salesReportCount = 0;
    });

    builder.addCase(getSalesReportExportedData.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSalesReportExportedData.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesReportExportedData = action.payload;
    });
    builder.addCase(getSalesReportExportedData.rejected, (state) => {
      state.loading = "rejected";
      state.salesReportExportedData = [];
    });

    builder.addCase(searchUnbilledByCompanyNameAndUnbilled.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      searchUnbilledByCompanyNameAndUnbilled.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.unBillList = action.payload;
        state.unBillCount = action.payload?.[0]?.searchCount;
      },
    );
    builder.addCase(
      searchUnbilledByCompanyNameAndUnbilled.rejected,
      (state) => {
        state.loading = "rejected";
        state.unBillList = [];
      },
    );

    // GET LEDGER GROUPS
    builder.addCase(getLedgerGroups.pending, (state) => {
      state.ledgerGroupLoading = "pending";
      state.ledgerGroupError = "";
    });

    builder.addCase(getLedgerGroups.fulfilled, (state, action) => {
      const payload = action.payload || {};

      state.ledgerGroupLoading = "success";
      state.ledgerGroupPage = payload;

      state.ledgerGroupList = Array.isArray(payload.content)
        ? payload.content
        : [];

      state.ledgerGroupTotalElements = payload.totalElements ?? 0;
      state.ledgerGroupTotalPages = payload.totalPages ?? 0;
      state.ledgerGroupPageNumber = payload.number ?? 0;
      state.ledgerGroupPageSize = payload.size ?? 20;
      state.ledgerGroupNumberOfElements = payload.numberOfElements ?? 0;
      state.ledgerGroupFirst = payload.first ?? true;
      state.ledgerGroupLast = payload.last ?? true;
      state.ledgerGroupEmpty = payload.empty ?? true;
      state.ledgerGroupError = "";
    });

    builder.addCase(getLedgerGroups.rejected, (state, action) => {
      state.ledgerGroupLoading = "error";
      state.ledgerGroupList = [];
      state.ledgerGroupPage = {};
      state.ledgerGroupTotalElements = 0;
      state.ledgerGroupTotalPages = 0;
      state.ledgerGroupNumberOfElements = 0;
      state.ledgerGroupEmpty = true;
      state.ledgerGroupError =
        action.payload || "Failed to fetch ledger groups";
    });

    // CREATE LEDGER GROUP
    builder.addCase(createLedgerGroup.pending, (state) => {
      state.createLedgerGroupLoading = "pending";
      state.ledgerGroupError = "";
    });

    builder.addCase(createLedgerGroup.fulfilled, (state) => {
      state.createLedgerGroupLoading = "success";
      state.ledgerGroupError = "";
    });

    builder.addCase(createLedgerGroup.rejected, (state, action) => {
      state.createLedgerGroupLoading = "error";
      state.ledgerGroupError =
        action.payload || "Failed to create ledger group";
    });

    // UPDATE LEDGER GROUP
    builder.addCase(updateLedgerGroup.pending, (state) => {
      state.updateLedgerGroupLoading = "pending";
      state.ledgerGroupError = "";
    });

    builder.addCase(updateLedgerGroup.fulfilled, (state) => {
      state.updateLedgerGroupLoading = "success";
      state.ledgerGroupError = "";
    });

    builder.addCase(updateLedgerGroup.rejected, (state, action) => {
      state.updateLedgerGroupLoading = "error";
      state.ledgerGroupError =
        action.payload || "Failed to update ledger group";
    });

    // DELETE LEDGER GROUP
    builder.addCase(deleteLedgerGroup.pending, (state) => {
      state.deleteLedgerGroupLoading = "pending";
      state.ledgerGroupError = "";
    });

    builder.addCase(deleteLedgerGroup.fulfilled, (state) => {
      state.deleteLedgerGroupLoading = "success";
      state.ledgerGroupError = "";
    });

    builder.addCase(deleteLedgerGroup.rejected, (state, action) => {
      state.deleteLedgerGroupLoading = "error";
      state.ledgerGroupError =
        action.payload || "Failed to delete ledger group";
    });

    builder
      .addCase(fetchLedgers.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchLedgers.fulfilled, (state, action) => {
        const data = action.payload || {};
        const content = Array.isArray(data.content) ? data.content : [];

        state.loading = false;
        state.ledgers = content;
        state.totalPages = data.totalPages || 0;
        state.totalElements = data.totalElements || 0;

        const selectedExists = content.some(
          (ledger) => ledger.id === state.selectedLedgerId,
        );

        if (!selectedExists) {
          state.selectedLedgerId = content[0]?.id || null;
        }
      })
      .addCase(fetchLedgers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch ledgers";
      })

      .addCase(createLedger.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(createLedger.fulfilled, (state, action) => {
        state.saving = false;

        if (action.payload?.id) {
          state.selectedLedgerId = action.payload.id;
        }
      })
      .addCase(createLedger.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to create ledger";
      })

      .addCase(updateLedger.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(updateLedger.fulfilled, (state, action) => {
        state.saving = false;

        const updatedLedger = action.payload;

        if (updatedLedger?.id) {
          state.ledgers = state.ledgers.map((ledger) =>
            ledger.id === updatedLedger.id ? updatedLedger : ledger,
          );
          state.selectedLedgerId = updatedLedger.id;
        }
      })
      .addCase(updateLedger.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update ledger";
      })

      .addCase(deleteLedger.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = "";
      })
      .addCase(deleteLedger.fulfilled, (state, action) => {
        const deletedId = action.payload;

        state.deletingId = null;
        state.ledgers = state.ledgers.filter(
          (ledger) => ledger.id !== deletedId,
        );
        state.totalElements = Math.max(0, state.totalElements - 1);

        if (state.selectedLedgerId === deletedId) {
          state.selectedLedgerId = state.ledgers[0]?.id || null;
        }
      })
      .addCase(deleteLedger.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload || "Failed to delete ledger";
      });

    builder.addCase(getAccountingVouchers.pending, (state) => {
      state.accountingVoucherLoading = "pending";
      state.accountingVoucherError = "";
    });

    builder.addCase(getAccountingVouchers.fulfilled, (state, action) => {
      const data = action.payload || {};

      state.accountingVoucherLoading = "success";
      state.accountingVoucherList = Array.isArray(data.content)
        ? data.content
        : [];

      state.accountingVoucherPage = data.pageable || {};
      state.accountingVoucherTotalElements = data.totalElements || 0;
      state.accountingVoucherTotalPages = data.totalPages || 0;
      state.accountingVoucherPageNumber = data.number || 0;
      state.accountingVoucherPageSize = data.size || 20;
      state.accountingVoucherNumberOfElements = data.numberOfElements || 0;
      state.accountingVoucherFirst = data.first ?? true;
      state.accountingVoucherLast = data.last ?? true;
      state.accountingVoucherEmpty = data.empty ?? true;
    });

    builder.addCase(getAccountingVouchers.rejected, (state, action) => {
      state.accountingVoucherLoading = "failed";
      state.accountingVoucherError =
        action.payload || "Failed to fetch accounting vouchers";
    });

    builder.addCase(createAccountingVoucher.pending, (state) => {
      state.createAccountingVoucherLoading = "pending";
      state.accountingVoucherError = "";
    });

    builder.addCase(createAccountingVoucher.fulfilled, (state) => {
      state.createAccountingVoucherLoading = "success";
    });

    builder.addCase(createAccountingVoucher.rejected, (state, action) => {
      state.createAccountingVoucherLoading = "failed";
      state.accountingVoucherError =
        action.payload || "Failed to create accounting voucher";
    });

    builder.addCase(getAllLedgerGroupType.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAllLedgerGroupType.fulfilled, (state, action) => {
      state.loading = "success";
      state.ledgerGroupTypeList = Array.isArray(action.payload)
        ? action.payload
        : [];
    });

    builder.addCase(getAllLedgerGroupType.rejected, (state, action) => {
      state.loading = "rejected";
      state.ledgerGroupTypeList = [];
    });
  },
});

export const {
  setSelectedLedgerId,
  setLedgerSearch,
  setLedgerTypeFilter,
  setLedgerGroupIdFilter,
  setActiveFilter,
  setLedgerPage,
  clearLedgerError,
} = OrganizationSlice.actions;

export default OrganizationSlice.reducer;
