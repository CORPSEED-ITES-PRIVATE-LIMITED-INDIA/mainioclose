import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getAllNewCompanies = createAsyncThunk(
  "getAllNewCompanies",
  async ({ userId, filterUserId, type, rating, page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllParentCompanyV2?userId=${userId}&filterUserId=${filterUserId}&type=${type}&rating=${rating}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllGstTypeByCompanyTypeId = createAsyncThunk(
  "getAllGstTypeById",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getGstTypeById?id=${id}`
    );
    return response.data;
  }
);

export const getBusinessTypeByGstTypeId = createAsyncThunk(
  "getBusinessTypeByGstTypeId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getPriceTypeByBussinessTypeId?id=${id}`
    );
    return response.data;
  }
);

export const getAllCompanyType = createAsyncThunk(
  "getAllCompanyType",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCompanyType`
    );
    return response.data;
  }
);

export const getGstListByCompanyId = createAsyncThunk(
  "getGstListByCompanyId",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/v1/company/getGstAndStateByCompanyId?companyId=${companyId}`
    );
    return response.data;
  }
);

export const addGstInCompany = createAsyncThunk(
  "addGstInCompany",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/company/addGstUnitInCompany`,
      data
    );
    return response.data;
  }
);

export const getCompanyUnitsByStateAndCompanyId = createAsyncThunk(
  "getCompanyUnitsByStateAndCompanyId",
  async ({ companyId, stateName }) => {
    const response = await api.get(
      `/leadService/api/v1/company/getCompanyByGstAndCompanyId?companyId=${companyId}&state=${stateName}`
    );
    return response.data;
  }
);

export const getLeadsByCompanyId = createAsyncThunk(
  "getLeadsByCompanyId",
  async (id) => {
    const getCompanyLeadsData = await api.get(
      `/leadService/api/v1/company/getAllLeadByCompany?companyId=${id}`
    );
    return getCompanyLeadsData?.data;
  }
);

export const getCompanyProjectAction = createAsyncThunk(
  "get-company-project-action",
  async ( id ) => {
    const getCompanyProjectData = await api.get(
      `/leadService/api/v1/company/getAllProjectByCompany?companyId=${id}`
    );
    return getCompanyProjectData?.data;
  }
);

export const getCompanyByUnitId = createAsyncThunk(
  "getCompanyByUnitId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/company/getCompanyById?id=${id}`
    );
    return response.data;
  }
);

const CompanySlice = createSlice({
  name: "company",
  initialState: {
    newCompaniesList: [],
    loading: "",
    gstTypeList: {},
    businessTypeList: {},
    companyTypeList: [],
    companyGstList: [],
    companyUnitList: [],
    comapanyLeadsList: [],
    companyProjectList:[],
    companyDetail:{}
  },
  extraReducers: (builder) => {
    builder.addCase(getAllNewCompanies.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllNewCompanies.fulfilled, (state, action) => {
      state.loading = "success";
      state.newCompaniesList = action?.payload;
    });
    builder.addCase(getAllNewCompanies.rejected, (state) => {
      state.loading = "rejected";
      state.newCompaniesList = [];
    });

    builder.addCase(getAllGstTypeByCompanyTypeId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.fulfilled, (state, action) => {
      state.gstTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.rejected, (state) => {
      state.loading = "rejected";
      state.gstTypeList = {};
    });

    builder.addCase(getBusinessTypeByGstTypeId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getBusinessTypeByGstTypeId.fulfilled, (state, action) => {
      state.businessTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getBusinessTypeByGstTypeId.rejected, (state) => {
      state.loading = "rejected";
      state.businessTypeList = {};
    });

    builder.addCase(getAllCompanyType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyType.fulfilled, (state, action) => {
      state.companyTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyType.rejected, (state) => {
      state.loading = "rejected";
      state.companyTypeList = [];
    });

    builder.addCase(getGstListByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getGstListByCompanyId.fulfilled, (state, action) => {
      state.companyGstList = action?.payload;
      state.loading = "success";
    });
    builder.addCase(getGstListByCompanyId.rejected, (state) => {
      state.companyGstList = [];
      state.loading = "rejected";
    });

    builder.addCase(getCompanyUnitsByStateAndCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getCompanyUnitsByStateAndCompanyId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.companyUnitList = action?.payload;
      }
    );
    builder.addCase(getCompanyUnitsByStateAndCompanyId.rejected, (state) => {
      state.loading = "rejected";
      state.companyUnitList = [];
    });

    builder.addCase(getLeadsByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadsByCompanyId.fulfilled, (state, action) => {
      state.loading = "success";
      state.comapanyLeadsList = action?.payload;
    });
    builder.addCase(getLeadsByCompanyId.rejected, (state) => {
      state.loading = "rejected";
      state.comapanyLeadsList = [];
    });

     builder.addCase(getCompanyProjectAction.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyProjectAction.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyProjectList = action.payload;
    });
    builder.addCase(getCompanyProjectAction.rejected, (state) => {
      state.loading = "rejected";
      state.companyProjectList = [];
    });

     builder.addCase(getCompanyByUnitId.pending, (state) => {
      state.loading = "pending";

    });
    builder.addCase(getCompanyByUnitId.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyDetail = action.payload;
    });
    builder.addCase(getCompanyByUnitId.rejected, (state) => {
      state.loading = "rejected";
      state.companyDetail = {};
    });
  },
});

export default CompanySlice.reducer;
