import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

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

const OrganizationSlice = createSlice({
  name: "organization",
  initialState: {
    loading: "",
    groupList: [],
    groupLedgerList: [],
    ledgerList: [],
    ledgerCount: 0,
    groupVoucherList: [],
    ledgerTypeList: [],
  },
  extraReducers: (builder) => {
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
  },
});

export default OrganizationSlice.reducer;
