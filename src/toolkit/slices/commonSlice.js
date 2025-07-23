import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const emailChecker = createAsyncThunk("emailChecker", async (email) => {
  const response = await api.get(
    `/leadService/api/v1/users/checkEmailExist?email=${email}`
  );
  return response;
});
export const getDesiginationById = createAsyncThunk(
  "getDesiginationByID",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/designation/getAllDesignationByDepartment?departmentId=${id}`
    );
    return response.data;
  }
);

export const getManagerById = createAsyncThunk("getManagerById", async (id) => {
  const response = await api.get(
    `/leadService/api/v1/users/getUserManagerByDepartment?departmentId=${id}`
  );
  return response.data;
});

export const getProcurementAssigneeList = createAsyncThunk(
  "getProcurementAssigneeList",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/fetchProcurementUsers?userId=${id}`
    );
    return response.data;
  }
);

export const createContacts = createAsyncThunk(
  "createContacts",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/contact/createContact`,
      data
    );
    return response.data;
  }
);

export const createNewContacts = createAsyncThunk(
  "createContacts",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/contact/createNewContact`,
      data
    );
    return response.data;
  }
);

export const getAllCountries = createAsyncThunk("getAllCountries", async () => {
  const response = await api.get(`/leadService/api/v1/country/getAllCountry`);
  return response.data;
});

export const getAllSecondaryCountries = createAsyncThunk(
  "getAllSecondaryCountries",
  async () => {
    const response = await api.get(`/leadService/api/v1/country/getAllCountry`);
    return response.data;
  }
);

export const getAllStatesByCountryId = createAsyncThunk(
  "getAllStatesByCountryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryId?id=${id}`
    );
    return response.data;
  }
);

export const getAllStatesByCountryName = createAsyncThunk(
  "getAllStatesByCountryName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryName?name=${name}`
    );
    return response.data;
  }
);

export const getAllSecondaryStatesBySecondaryCountryName = createAsyncThunk(
  "getAllSecondaryStatesBySecondaryCountryName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryName?name=${name}`
    );
    return response.data;
  }
);

export const getAllCitiesByStateId = createAsyncThunk(
  "getAllCitiesByStateId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateId?id=${id}`
    );
    return response.data;
  }
);

export const getAllCitiesByStateName = createAsyncThunk(
  "getAllCitiesByStateName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateName?name=${name}`
    );
    return response.data;
  }
);

export const getAllSecondaryCitiesBySecondaryStateName = createAsyncThunk(
  "getAllSecondaryCitiesBySecondaryStateName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateName?name=${name}`
    );
    return response.data;
  }
);

export const panNumberExistOrNot = createAsyncThunk(
  "panNumberExistOrNot",
  async (panNo) => {
    const response = await api.get(
      `/leadService/api/v1/company/getCompanyPanNo?panNo=${panNo}`
    );
    return response.data;
  }
);

export const getAllUsers = createAsyncThunk("allUsers", async () => {
  const allUser = await api.get(`/leadService/api/v1/users/getAllUser`);
  return allUser?.data;
});

const CommonSlice = createSlice({
  name: "common",
  initialState: {
    desiginationListById: [],
    loading: "",
    managerListById: [],
    procurementAssigneeList: [],
    countriesList: [],
    statesList: [],
    citiesList: [],
    secondaryCountriesList: [],
    secondaryStateList: [],
    secondaryCitiesList: [],
    usersList: [],
    usersLoading: "",
  },
  reducers: {
    handleReset: (state, action) => {
      state.citiesList = [];
      state.statesList = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getDesiginationById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getDesiginationById.fulfilled, (state, action) => {
      state.loading = "success";
      state.desiginationListById = action.payload;
    });
    builder.addCase(getDesiginationById.rejected, (state, action) => {
      state.loading = "rejected";
    });
    builder.addCase(getManagerById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getManagerById.fulfilled, (state, action) => {
      state.loading = "success";
      state.managerListById = action.payload;
    });
    builder.addCase(getManagerById.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getProcurementAssigneeList.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getProcurementAssigneeList.fulfilled, (state, action) => {
      state.loading = "success";
      state.procurementAssigneeList = action.payload;
    });
    builder.addCase(getProcurementAssigneeList.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllCountries.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCountries.fulfilled, (state, action) => {
      state.loading = "success";
      state.countriesList = action.payload;
    });
    builder.addCase(getAllCountries.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllSecondaryCountries.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSecondaryCountries.fulfilled, (state, action) => {
      state.loading = "success";
      state.secondaryCountriesList = action.payload;
    });
    builder.addCase(getAllSecondaryCountries.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllStatesByCountryId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllStatesByCountryId.fulfilled, (state, action) => {
      state.loading = "success";
      state.statesList = action.payload;
    });
    builder.addCase(getAllStatesByCountryId.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllStatesByCountryName.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllStatesByCountryName.fulfilled, (state, action) => {
      state.loading = "success";
      state.statesList = action.payload;
    });
    builder.addCase(getAllStatesByCountryName.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.pending,
      (state, action) => {
        state.loading = "pending";
      }
    );
    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.secondaryStateList = action.payload;
      }
    );
    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.rejected,
      (state, action) => {
        state.loading = "rejected";
      }
    );

    builder.addCase(getAllCitiesByStateId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCitiesByStateId.fulfilled, (state, action) => {
      state.loading = "success";
      state.citiesList = action.payload;
    });
    builder.addCase(getAllCitiesByStateId.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllCitiesByStateName.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCitiesByStateName.fulfilled, (state, action) => {
      state.loading = "success";
      state.citiesList = action.payload;
    });
    builder.addCase(getAllCitiesByStateName.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.pending,
      (state, action) => {
        state.loading = "pending";
      }
    );
    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.secondaryCitiesList = action.payload;
      }
    );
    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.rejected,
      (state, action) => {
        state.loading = "rejected";
      }
    );

    builder.addCase(getAllUsers.pending, (state, action) => {
      state.usersLoading = "pending";
      state.usersList = [];
    });
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.usersList = action.payload;
      state.usersLoading = "success";
    });
    builder.addCase(getAllUsers.rejected, (state, action) => {
      state.usersList = [];
      state.usersLoading = "rejected";
    });
  },
});

export const { handleReset } = CommonSlice.actions;

export default CommonSlice.reducer;
