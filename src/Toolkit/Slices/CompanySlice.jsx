import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getQuery } from "../../API/GetQuery";
import { postQuery } from "../../API/PostQuery";
import { putQuery } from "../../API/PutQuery";
import { deleteQuery } from "../../API/DeleteQuery";
import { deleteQueryWithData } from "../../API/DeleteQueryWithData";

export const getCompanyAction = createAsyncThunk(
  "getallCompanyData",
  async ({ id, page, filterUserId, size }) => {
    const getCompanyData = await getQuery(
      `/leadService/api/v1/company/getAllCompany?userId=${id}&filterUserId=${filterUserId}&page=${page}&size=${size}`
    );
    return getCompanyData?.data;
  }
);

export const getCompanyProjectAction = createAsyncThunk(
  "get-company-project-action",
  async ({ id }) => {
    const getCompanyProjectData = await getQuery(
      `/leadService/api/v1/company/getAllProjectByCompany?companyId=${id}`
    );
    return getCompanyProjectData?.data;
  }
);

export const getCompanyLeadsAction = createAsyncThunk(
  "get-company-leads-action",
  async ({ id }) => {
    const getCompanyLeadsData = await getQuery(
      `/leadService/api/v1/company/getAllLeadByCompany?companyId=${id}`
    );
    return getCompanyLeadsData?.data;
  }
);

export const createCompany = createAsyncThunk("createCompany", async (data) => {
  const response = await postQuery(
    `/leadService/api/v1/company/createCompany`,
    data
  );
  return response.data;
});
export const getAllComapany = createAsyncThunk("getAllComapny", async (id) => {
  const response = await getQuery(
    `/leadService/api/v1/company/getAllCompany?userId=${id}`
  );
  return response.data;
});

export const getAllParentCompany = createAsyncThunk(
  "allParentCompany",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllParentCompany`
    );
    return response.data;
  }
);

export const createCompanyByLeads = createAsyncThunk(
  "createCompanyByLeads",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/company/createCompanyForm`,
      data
    );
    return response.data;
  }
);

export const getAllLeadCompanyies = createAsyncThunk(
  "getAllLeadCompanyies",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllCompanyForm`
    );
    return response.data;
  }
);

export const getAllCompanyByStatus = createAsyncThunk(
  "getCompaniesByStatus",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllCompanyFormByStatus?status=${data.status}&userId=${data?.id}&page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const getAllCompanyUnits = createAsyncThunk(
  "getAllCompanyUnits",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllCompanyUnit?id=${id}`
    );
    return response.data;
  }
);

export const updateCompanyAssignee = createAsyncThunk(
  "updateCompanyAssignee",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/updateCompanyAssignee?companyId=${data?.companyId}&assigneeId=${data?.assigneeId}&currentUserId=${data?.currentUserId}`
    );
    return response.data;
  }
);

export const getCompanyDetailsById = createAsyncThunk(
  "getCompanyDetailsById",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getSingleCompanyForm?id=${id}`
    );
    return response.data;
  }
);

export const updateCompanyForm = createAsyncThunk(
  "updateCompanyForm",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/updateCompanyForm`,
      data
    );
    return response.data;
  }
);

export const searchCompanyForm = createAsyncThunk(
  "searchCompanyForm",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/company/searchCompanyByStatus?searchNameAndGSt=${data?.inputText}&userId=${data?.userId}&status=${data?.status}&page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const searchCompany = createAsyncThunk("searchCompany", async (data) => {
  const response = await getQuery(
    `/leadService/api/v1/company/fetchAllCompanyDetails?searchNameAndGSt=${data?.inputText}&userId=${data?.userId}`
  );
  return response.data;
});

export const getFormComment = createAsyncThunk("getFormComment", async (id) => {
  const response = await getQuery(
    `/leadService/api/v1/company/getCompanyComment?companyFormId=${id}`
  );
  return response.data;
});

export const addCommentCompanyForm = createAsyncThunk(
  "addCommentCompanyForm",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/addComment?companyFormId=${data?.id}&comment=${data?.comment}`
    );
    return response.data;
  }
);

export const updateMultiCompanyAssignee = createAsyncThunk(
  "updateMultiAssignee",
  async (data) => {
    const response = putQuery(
      `/leadService/api/v1/company/updateMultiCompanyAssignee`,
      data
    );
    return response.data;
  }
);

export const getHistoryByCompanyId = createAsyncThunk(
  "getCompanyByHistoryId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/companyHistory/getAllCompanyHistory?companyId=${id}`
    );
    return response.data;
  }
);

export const getAllCompanyFormForMultipleServices = createAsyncThunk(
  "getAllCompanyFormForMultipleServices",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllCompanyFormByStatusAndCompany?status=${data?.status}&userId=${data?.userId}&page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const updateMultiCompanyFormStatus = createAsyncThunk(
  "updateMultiCompanyFormStatus",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/updateMultiCompanyFormStatus`,
      data
    );
    return response.data;
  }
);

export const searchFormCompaniesBy = createAsyncThunk(
  "searchFormCompaniesBy",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/company/searchCompanyFormDataCompanywise?searchNameAndGSt=${data?.inputText}&userId=${data?.userId}&status=${data?.status}`
    );
    return response.data;
  }
);

export const getAllTempCompanies = createAsyncThunk(
  "getAllTempCompanies",
  async ({ id, page, filterUserId, size }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllTempCompany?userId=${id}&filterUserId=${filterUserId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const updateMultiTempCompanyAssignee = createAsyncThunk(
  "updateMultiTempCompanyAssignee",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/updateMultiCompanyTempAssignee`,
      data
    );
    return response.data;
  }
);

export const deleteTempAssignee = createAsyncThunk(
  "deleteTempAssignee",
  async (data) => {
    const response = await deleteQueryWithData(
      `/leadService/api/v1/company/deleteTempAssignee`,
      data
    );
    return response.data;
  }
);

export const getAllConsultantByCompany = createAsyncThunk(
  "getAllConsultantByCompany",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllConsultantByCompany?userId=${data?.id}&filterUserId=${data?.filterUserId}&page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const getAllConsultantByCompanyCount = createAsyncThunk(
  "getAllConsultantByCompanyCount",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllConsultantByCompanyCount?userId=${id}`
    );
    return response.data;
  }
);

export const exportAllCompanyData = createAsyncThunk(
  "exportAllCompanyData",
  async ({ userId, filterUserId }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllCompanyForExport?userId=${userId}&filterUserId=${filterUserId}`
    );
    return response.data;
  }
);

export const createNewCompanyInLeads = createAsyncThunk(
  "createNewCompanyInLeads",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/company/createCompanyNew`,
      data
    );
    return response.data;
  }
);

export const getAllCompanyType = createAsyncThunk(
  "getAllCompanyType",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/state/getAllCompanyType`
    );
    return response.data;
  }
);
// fdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddb
export const getAllGstTypeByCompanyTypeId = createAsyncThunk(
  "getAllGstTypeById",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/state/getGstTypeById?id=${id}`
    );
    return response.data;
  }
);

export const getBusinessTypeByGstTypeId = createAsyncThunk(
  "getBusinessTypeByGstTypeId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/state/getPriceTypeByBussinessTypeId?id=${id}`
    );
    return response.data;
  }
);

//        kjhdisfouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu

export const getHandleSearchCompanies = createAsyncThunk(
  "getHandleSearchCompanies",
  async ({ userId, searchNameAndGSt, type }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/searchCompanyByNameAndGSTAndContactAndEmail?searchNameAndGSt=${searchNameAndGSt}&userId=${userId}&type=${type}`
    );
    return response.data;
  }
);

export const addCompanyInGst = createAsyncThunk(
  "addCompanyInGst",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/addGstUnitInCompany`,
      data
    );
    return response.data;
  }
);

export const addConsultantInGST = createAsyncThunk(
  "addConsultantInGST",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/company/addConsultantUnitInCompany`,
      data
    );
    return response.data;
  }
);

export const searchCompaniesForAccountTeam = createAsyncThunk(
  "searchCompaniesForAccountTeam",
  async ({ searchNameAndGSt, userId, fieldSearch }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/companySearchByAccountTeam?searchNameAndGSt=${searchNameAndGSt}&userId=${userId}&fieldSearch=${fieldSearch}`
    );
    return response.data;
  }
);

export const getConsultantCompanies = createAsyncThunk(
  "getConsultantCompanies",
  async (companyId) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllConsultantByCompanyId?companyId=${companyId}`
    );
    return response.data;
  }
);

export const getCompanyExistData = createAsyncThunk(
  "getCompanyExistData",
  async (leadId) => {
    const response = await getQuery(
      `/leadService/api/v1/company/searchCompanyByLeadId?leadId=${leadId}`
    );
    return response.data;
  }
);

export const updateCompanyData = createAsyncThunk(
  "updateCompanyName",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/editCompanyAndLeadConnection`,
      data
    );
    return response.data;
  }
);

export const getAllConsultantCompaniesById = createAsyncThunk(
  "getAllConsultantCompaniesById",
  async (companyId) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllCompanyAndServingByParentCompany?companyId=${companyId}`
    );
    return response.data;
  }
);

export const getAllServingGstCompany = createAsyncThunk(
  "getAllServingGstCompany",
  async ({ companyId, companyOrConsultant }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getGstAndStateForServingCompany?companyId=${companyId}&companyOrConsultant=${companyOrConsultant}`
    );
    return response.data;
  }
);

export const getAllConsultantUnitsByStateAndId = createAsyncThunk(
  "getAllConsultantUnitsByStateAndId",
  async ({ companyId, companyOrConsultant, state }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getServingAndCompanyByGstAndState?companyId=${companyId}&companyOrConsultant=${companyOrConsultant}&state=${state}`
    );
    return response.data;
  }
);

export const getServingCompanyDetail = createAsyncThunk(
  "getServingCompanyDetail",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getServingCompanyById?id=${id}`
    );
    return response.data;
  }
);

export const addServingCompanyUnit = createAsyncThunk(
  "addServingCompanyUnit",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/addServingCompany`,
      data
    );
    return response.data;
  }
);

export const getServingCompanyData = createAsyncThunk(
  "getServingCompanyData",
  async ({ companyId, companyOrConsultant }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getServingUnitByServingCompanyId?companyId=${companyId}&companyOrConsultant=${companyOrConsultant}`
    );
    return response.data;
  }
);

export const updateServingCompany = createAsyncThunk(
  "updateServingCompany",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/editServingCompany`,
      data
    );
    return response.data;
  }
);

export const getAllCompaniesForApprovals = createAsyncThunk(
  "getAllCompaniesForApprovals",
  async ({ userId, page, size, status }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllParentCompanyForAccount?userId=${userId}&page=${page}&size=${size}&status=${status}`
    );
    return response.data;
  }
);

export const updateApprovalCompany = createAsyncThunk(
  "updateApprovalCompany",
  async ({ userId, status, companyId }) => {
    const response = await putQuery(
      `/leadService/api/v1/company/updateCompanyStatusInCompany?userId=${userId}&status=${status}&companyId=${companyId}`
    );
    return response.data;
  }
);

export const getCompanyByUnitId = createAsyncThunk(
  "getCompanyByUnitId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getCompanyById?id=${id}`
    );
    return response.data;
  }
);

export const addServingUnitsForCompany = createAsyncThunk(
  "addServingUnitsForCompany",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/addServingUnit`,
      data
    );
    return response.data;
  }
);

export const getAllServingCompanyList = createAsyncThunk(
  "getAllServingCompanyList",
  async ({ userId, page, size, status }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllServingCompany?userId=${userId}&page=${page}&size=${size}&status=${status}`
    );
    return response.data;
  }
);

export const convertServingCompanyToCompany = createAsyncThunk(
  "convertServingCompanyToCompany",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/company/importServingIntoCompany`,
      data
    );
    return response.data;
  }
);

export const updateCompanyDetails = createAsyncThunk(
  "updateCompanyDetails",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/company/editCompany`,
      data
    );
    return response.data;
  }
);

const CompnaySlice = createSlice({
  name: "company",
  initialState: {
    allCompnay: [],
    loadingCompany: false,
    errorCompany: false,
    compProject: [],
    compProjectLoading: false,
    compProjectError: false,
    compLeads: [],
    compLeadsLoading: false,
    compLeadsError: false,
    allCompany: [],
    loading: "",
    allParentCompany: [],
    allLeadCompanyList: [],
    allCompanyUnits: [],
    companyDetail: {},
    page: 0,
    companyHistoryList: [],
    companyListWithServices: {},
    totalCompanyServiceCount: 0,
    allTemporaryCompanies: [],
    consultantCompanyList: [],
    consultantLoading: "",
    consultantCompanyCount: 0,
    companyTypeList: [],
    companiesSearchListForAccTeam: [],
    consultantCompaniesList: [],
    existingCompanyList: [],
    servingGstCompanyList: [],
    consultantUnitsList: [],
    servingCompanyDetail: {},
    singleServingCompanyData: [],
    approvalCompanyList: [],
    gstTypeList: [],
    businessTypeList: [],
    servingCompanyList: [],
  },
  reducers: {
    handleNextPagination: (state, action) => {
      state.page = state.page + 1;
    },
    handlePrevPagination: (state, action) => {
      state.page = state.page >= 0 ? state.page - 1 : 0;
    },
    handleResetExistingCompany: (state, action) => {
      state.existingCompanyList = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanyAction.pending, (state, action) => {
      state.loadingCompany = true;
      state.errorCompany = false;
    });
    builder.addCase(getCompanyAction.fulfilled, (state, action) => {
      state.allCompnay = action.payload;
      state.loadingCompany = false;
      state.errorCompany = false;
    });
    builder.addCase(getCompanyAction.rejected, (state, action) => {
      state.errorCompany = true;
      state.loadingCompany = false;
    });

    builder.addCase(getCompanyProjectAction.pending, (state, action) => {
      state.compProjectLoading = true;
      state.compProjectError = false;
    });
    builder.addCase(getCompanyProjectAction.fulfilled, (state, action) => {
      state.compProject = action.payload;
      state.compProjectLoading = false;
      state.compProjectError = false;
    });
    builder.addCase(getCompanyProjectAction.rejected, (state, action) => {
      state.compProjectError = true;
      state.compProjectLoading = false;
    });

    builder.addCase(getCompanyLeadsAction.pending, (state, action) => {
      state.compLeadsLoading = true;
      state.compLeadsError = false;
    });
    builder.addCase(getCompanyLeadsAction.fulfilled, (state, action) => {
      state.compLeads = action.payload;
      state.compLeadsLoading = false;
      state.compLeadsError = false;
    });
    builder.addCase(getCompanyLeadsAction.rejected, (state, action) => {
      state.compLeadsError = true;
      state.compLeadsLoading = false;
    });

    builder.addCase(getAllComapany.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllComapany.fulfilled, (state, action) => {
      state.allCompany = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllComapany.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllParentCompany.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllParentCompany.fulfilled, (state, action) => {
      state.allParentCompany = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllParentCompany.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllLeadCompanyies.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLeadCompanyies.fulfilled, (state, action) => {
      state.allLeadCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllLeadCompanyies.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllCompanyByStatus.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyByStatus.fulfilled, (state, action) => {
      state.allLeadCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyByStatus.rejected, (state, action) => {
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

    builder.addCase(getCompanyDetailsById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyDetailsById.fulfilled, (state, action) => {
      state.companyDetail = action.payload;
      state.loading = "success";
    });
    builder.addCase(getCompanyDetailsById.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(searchCompany.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(searchCompany.fulfilled, (state, action) => {
      state.allCompnay = action.payload;
      state.loading = "success";
    });
    builder.addCase(searchCompany.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getHandleSearchCompanies.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getHandleSearchCompanies.fulfilled, (state, action) => {
      state.allCompnay = action.payload;
      state.loading = "success";
    });
    builder.addCase(getHandleSearchCompanies.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(searchCompanyForm.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(searchCompanyForm.fulfilled, (state, action) => {
      state.allLeadCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(searchCompanyForm.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getHistoryByCompanyId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getHistoryByCompanyId.fulfilled, (state, action) => {
      state.companyHistoryList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getHistoryByCompanyId.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(
      getAllCompanyFormForMultipleServices.pending,
      (state, action) => {
        state.loading = "pending";
      }
    );
    builder.addCase(
      getAllCompanyFormForMultipleServices.fulfilled,
      (state, action) => {
        state.companyListWithServices = action.payload.data;
        state.totalCompanyServiceCount = action.payload.count;
        state.loading = "success";
      }
    );
    builder.addCase(
      getAllCompanyFormForMultipleServices.rejected,
      (state, action) => {
        state.loading = "rejected";
      }
    );

    builder.addCase(searchFormCompaniesBy.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(searchFormCompaniesBy.fulfilled, (state, action) => {
      state.companyListWithServices = action.payload;
      state.loading = "success";
    });
    builder.addCase(searchFormCompaniesBy.rejected, (state, action) => {
      state.loading = "rejected";
      state.companyListWithServices = {};
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

    builder.addCase(getAllTempCompanies.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTempCompanies.fulfilled, (state, action) => {
      state.allTemporaryCompanies = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllTempCompanies.rejected, (state, action) => {
      state.loading = "rejected";
      state.allTemporaryCompanies = [];
    });

    builder.addCase(getAllConsultantByCompany.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getAllConsultantByCompany.fulfilled, (state, action) => {
      state.consultantCompanyList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getAllConsultantByCompany.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.consultantCompanyList = [];
    });

    builder.addCase(getAllConsultantByCompanyCount.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(
      getAllConsultantByCompanyCount.fulfilled,
      (state, action) => {
        state.consultantCompanyCount = action.payload;
        state.consultantLoading = "success";
      }
    );
    builder.addCase(
      getAllConsultantByCompanyCount.rejected,
      (state, action) => {
        state.consultantLoading = "rejected";
        state.consultantCompanyCount = 0;
      }
    );

    builder.addCase(getAllCompanyType.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getAllCompanyType.fulfilled, (state, action) => {
      state.companyTypeList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getAllCompanyType.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.companyTypeList = [];
    });

    builder.addCase(searchCompaniesForAccountTeam.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(
      searchCompaniesForAccountTeam.fulfilled,
      (state, action) => {
        state.companiesSearchListForAccTeam = action.payload;
        state.consultantLoading = "success";
      }
    );
    builder.addCase(searchCompaniesForAccountTeam.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.companiesSearchListForAccTeam = [];
    });

    builder.addCase(getConsultantCompanies.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getConsultantCompanies.fulfilled, (state, action) => {
      state.consultantCompaniesList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getConsultantCompanies.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.consultantCompaniesList = [];
    });

    builder.addCase(getAllConsultantCompaniesById.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(
      getAllConsultantCompaniesById.fulfilled,
      (state, action) => {
        state.consultantCompaniesList = action.payload;
        state.consultantLoading = "success";
      }
    );
    builder.addCase(getAllConsultantCompaniesById.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.consultantCompaniesList = [];
    });

    builder.addCase(getAllServingGstCompany.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getAllServingGstCompany.fulfilled, (state, action) => {
      state.servingGstCompanyList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getAllServingGstCompany.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.servingGstCompanyList = [];
    });

    builder.addCase(
      getAllConsultantUnitsByStateAndId.pending,
      (state, action) => {
        state.consultantLoading = "pending";
      }
    );
    builder.addCase(
      getAllConsultantUnitsByStateAndId.fulfilled,
      (state, action) => {
        state.consultantUnitsList = action.payload;
        state.consultantLoading = "success";
      }
    );
    builder.addCase(
      getAllConsultantUnitsByStateAndId.rejected,
      (state, action) => {
        state.consultantLoading = "rejected";
        state.consultantUnitsList = [];
      }
    );

    builder.addCase(getServingCompanyDetail.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getServingCompanyDetail.fulfilled, (state, action) => {
      state.servingCompanyDetail = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getServingCompanyDetail.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.servingCompanyDetail = {};
    });

    builder.addCase(getServingCompanyData.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getServingCompanyData.fulfilled, (state, action) => {
      state.singleServingCompanyData = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getServingCompanyData.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.singleServingCompanyData = [];
    });

    builder.addCase(getAllCompaniesForApprovals.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getAllCompaniesForApprovals.fulfilled, (state, action) => {
      state.approvalCompanyList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getAllCompaniesForApprovals.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.approvalCompanyList = [];
    });

    builder.addCase(getAllGstTypeByCompanyTypeId.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.fulfilled, (state, action) => {
      state.gstTypeList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.gstTypeList = [];
    });

    builder.addCase(getBusinessTypeByGstTypeId.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getBusinessTypeByGstTypeId.fulfilled, (state, action) => {
      state.businessTypeList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getBusinessTypeByGstTypeId.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.businessTypeList = [];
    });

    builder.addCase(getCompanyByUnitId.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getCompanyByUnitId.fulfilled, (state, action) => {
      state.servingCompanyDetail = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getCompanyByUnitId.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.servingCompanyDetail = {};
    });

    builder.addCase(getAllServingCompanyList.pending, (state, action) => {
      state.consultantLoading = "pending";
    });
    builder.addCase(getAllServingCompanyList.fulfilled, (state, action) => {
      state.servingCompanyList = action.payload;
      state.consultantLoading = "success";
    });
    builder.addCase(getAllServingCompanyList.rejected, (state, action) => {
      state.consultantLoading = "rejected";
      state.servingCompanyList = [];
    });
  },
});

export const {
  handleNextPagination,
  handlePrevPagination,
  handleResetExistingCompany,
} = CompnaySlice.actions;

export default CompnaySlice.reducer;
