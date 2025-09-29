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
  async (id) => {
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

export const getAllServingCompanyList = createAsyncThunk(
  "getAllServingCompanyList",
  async ({ userId, page, size, status }) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllServingCompany?userId=${userId}&page=${page}&size=${size}&status=${status}`
    );
    return response.data;
  }
);

export const createNewCompanyInLeads = createAsyncThunk(
  "createNewCompanyInLeads",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/createCompanyNew`,
      data
    );
    return response.data;
  }
);

export const getAllCompanyByStatus = createAsyncThunk(
  "getCompaniesByStatus",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllCompanyFormByStatus?status=${data.status}&userId=${data?.id}&page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const searchCompanyForm = createAsyncThunk(
  "searchCompanyForm",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/company/searchCompanyByStatus?searchNameAndGSt=${data?.inputText}&userId=${data?.userId}&status=${data?.status}&page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const searchCompaniesForCompany = createAsyncThunk(
  "searchCompaniesForCompany",
  async ({ searchText, userId, searchField }) => {
    const response = await api.get(
      `/leadService/api/v1/company/companySearchByGstAndContactDetailsNew?searchNameAndGSt=${searchText}&userId=${userId}&fieldSearch=${searchField}`
    );
    return response.data;
  }
);

export const getAllCompanyUnits = createAsyncThunk(
  "getAllCompanyUnits",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllCompanyUnit?id=${id}`
    );
    return response.data;
  }
);

export const getAllContactListByCompanyId = createAsyncThunk(
  "getAllContactListByCompanyId",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/v1/company/getContactByCompanyId?companyId=${companyId}`
    );
    return response.data;
  }
);

export const updateCompanyAddress = createAsyncThunk(
  "updateCompanyAddress",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/updateCompanyAddress`,
      data
    );
    return response.data;
  }
);

export const getHistoryByCompanyId = createAsyncThunk(
  "getCompanyByHistoryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/companyHistory/getAllCompanyHistory?companyId=${id}`
    );
    return response.data;
  }
);

export const convertServingCompanyToCompany = createAsyncThunk(
  "convertServingCompanyToCompany",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/importServingIntoCompany`,
      data
    );
    return response.data;
  }
);

export const getCompanyExistData = createAsyncThunk(
  "getCompanyExistData",
  async (leadId) => {
    const response = await api.get(
      `/leadService/api/v1/company/searchCompanyByLeadId?leadId=${leadId}`
    );
    return response.data;
  }
);

export const createCompanyForm = createAsyncThunk(
  "createCompanyForm",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/createCompanyForm`,
      data
    );
    return response.data;
  }
);

export const getFormComment = createAsyncThunk("getFormComment", async (id) => {
  const response = await api.get(
    `/leadService/api/v1/company/getCompanyComment?companyFormId=${id}`
  );
  return response.data;
});

export const updateStatusById = createAsyncThunk(
  "updateStatebyid",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/company/updateCompanyStatus?status=${data?.status}&id=${data?.id}&currentUserId=${data?.userid}`
    );
    return response.data;
  }
);


export const addCommentCompanyForm = createAsyncThunk(
  "addCommentCompanyForm",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/company/addComment?companyFormId=${data?.id}&comment=${data?.comment}`
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
    companyProjectList: [],
    companyDetail: {},
    servingCompanyList: [],
    allLeadCompanyList: [],
    seachCompniesList: [],
    allCompanyUnits: [],
    contactListByCompanyId: [],
    companyHistoryList: [],
    existingCompanyList:[],
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

    builder.addCase(getAllServingCompanyList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllServingCompanyList.fulfilled, (state, action) => {
      state.servingCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllServingCompanyList.rejected, (state) => {
      state.loading = "rejected";
      state.servingCompanyList = [];
    });

    builder.addCase(getAllCompanyByStatus.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyByStatus.fulfilled, (state, action) => {
      state.allLeadCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyByStatus.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(searchCompanyForm.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchCompanyForm.fulfilled, (state, action) => {
      state.allLeadCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(searchCompanyForm.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(searchCompaniesForCompany.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchCompaniesForCompany.fulfilled, (state, action) => {
      state.seachCompniesList = action?.payload;
      state.loading = "success";
    });
    builder.addCase(searchCompaniesForCompany.rejected, (state) => {
      state.seachCompniesList = [];
      state.loading = "rejected";
    });

    builder.addCase(getAllCompanyUnits.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyUnits.fulfilled, (state, action) => {
      state.allCompanyUnits = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyUnits.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllContactListByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllContactListByCompanyId.fulfilled, (state, action) => {
      state.contactListByCompanyId = action?.payload;
      state.loading = "success";
    });
    builder.addCase(getAllContactListByCompanyId.rejected, (state) => {
      state.contactListByCompanyId = [];
      state.loading = "rejected";
    });

    builder.addCase(getHistoryByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getHistoryByCompanyId.fulfilled, (state, action) => {
      state.companyHistoryList = action?.payload;
      state.loading = "success";
    });
    builder.addCase(getHistoryByCompanyId.rejected, (state) => {
      state.companyHistoryList = [];
      state.loading = "rejected";
    });

        builder.addCase(getCompanyExistData.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyExistData.fulfilled, (state, action) => {
      state.existingCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getCompanyExistData.rejected, (state, action) => {
      state.loading = "rejected";
      state.existingCompanyList = [];
    });
  },
});

export default CompanySlice.reducer;
