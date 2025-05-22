import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getQuery } from "../../API/GetQuery";
import { postQuery } from "../../API/PostQuery";
import { deleteQuery } from "../../API/DeleteQuery";
import { putQuery } from "../../API/PutQuery";

export const getAllDesiginations = createAsyncThunk(
  "allDesiginations",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/designation/getAllDesignation`
    );
    return response.data;
  }
);
export const createDesigination = createAsyncThunk(
  "createDesination",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/designation/createDesignation?name=${data?.name}&weight=${data?.weight}`
    );
    return response.data;
  }
);

export const getAllDepartment = createAsyncThunk(
  "getAllDepartment",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/designation/getAllDepartment`
    );
    return response.data;
  }
);
export const createDepartment = createAsyncThunk(
  "createDepartment",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/designation/createDepartment?name=${data?.name}`
    );
    return response.data;
  }
);

export const createDesiginationByDepartmentId = createAsyncThunk(
  "createDesiginationByDepartmentId",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/designation/createDepartmentInDesignation`,
      data
    );
    return response.data;
  }
);

export const getAllIpAddress = createAsyncThunk("allIpAddress", async () => {
  const response = await getQuery(`/securityService/api/auth/getAllIpAddress`);
  return response.data;
});

export const addIpAddress = createAsyncThunk("addIpAddress", async (data) => {
  const response = await postQuery(
    `/securityService/api/auth/addIpAddress?ipAddressName=${data?.ipaddress}`
  );
  return response.data;
});

export const getClientDesiginationList = createAsyncThunk(
  "getClientDesiginationList",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/clientDesignation/getAllClientDesignation`
    );
    return response.data;
  }
);

export const createClientDesigination = createAsyncThunk(
  "createClientDesigination",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/clientDesignation/createClientDesignation?name=${data?.name}`
    );
    return response.data;
  }
);

export const deleteClientDesigination = createAsyncThunk(
  "deleteClientDesigination",
  async (id) => {
    const response = await deleteQuery(
      `/leadService/api/v1/clientDesignation/deleteClientDesignation?id=${id}`
    );
    return response.data;
  }
);

export const updateClientDesigination = createAsyncThunk(
  "updateClientDesigination",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/clientDesignation/updateClientDesignation?id=${data?.id}&name=${data?.name}`
    );
    return response.data;
  }
);

export const addStatusInDepartment = createAsyncThunk(
  "addStatusInDepartment",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/status/addStatusInDepartment`,
      data
    );
    return response.data;
  }
);

const settingSlice = createSlice({
  name: "setting",
  initialState: {
    desiginationList: [],
    loading: "",
    allDepartment: [],
    allIpAddress: [],
    clientDesiginationList: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getAllDesiginations.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDesiginations.fulfilled, (state, action) => {
      state.loading = "success";
      state.desiginationList = action.payload;
    });
    builder.addCase(getAllDesiginations.rejected, (state, action) => {
      state.loading = "rejected";
    });
    builder.addCase(createDesigination.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(createDesigination.fulfilled, (state, action) => {
      state.loading = "success";
      state.desiginationList = [...state.desiginationList, action.payload];
    });
    builder.addCase(createDesigination.rejected, (state, action) => {
      state.loading = "rejected";
    });
    builder.addCase(getAllDepartment.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDepartment.fulfilled, (state, action) => {
      state.loading = "success";
      state.allDepartment = action.payload;
    });
    builder.addCase(getAllDepartment.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(createDepartment.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(createDepartment.fulfilled, (state, action) => {
      state.loading = "success";
      state.allDepartment = [...state.allDepartment, action.payload];
    });
    builder.addCase(createDepartment.rejected, (state, action) => {
      state.loading = "rejected";
    });
    builder.addCase(getAllIpAddress.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllIpAddress.fulfilled, (state, action) => {
      state.loading = "success";
      state.allIpAddress = action.payload;
    });
    builder.addCase(getAllIpAddress.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getClientDesiginationList.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getClientDesiginationList.fulfilled, (state, action) => {
      state.loading = "success";
      state.clientDesiginationList = action.payload;
    });
    builder.addCase(getClientDesiginationList.rejected, (state, action) => {
      state.loading = "rejected";
    });
  },
});

export default settingSlice.reducer;
