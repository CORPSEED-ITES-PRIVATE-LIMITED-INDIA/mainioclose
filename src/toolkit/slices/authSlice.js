import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getCurrentUser = createAsyncThunk("currentUser", async (data) => {
  const userData = await api.post(`/securityService/api/auth/signin`, data);
  return userData?.data;
});

export const changePasswordAuthentication = createAsyncThunk(
  "changePassAuth",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/isManagerApproved?userId=${id}`
    );
    return response.data;
  }
);

export const forgetPasswordApi = createAsyncThunk(
  "forgetPassword",
  async (data) => {
    const passData = await api.post(
      `/securityService/api/auth/forgetOtp?email=${data}`
    );
    return passData?.data;
  }
);

export const updatePassword = createAsyncThunk(
  "updatePassword",
  async (data) => {
    const response = await api.put(
      `/securityService/api/auth/updateUser`,
      data
    );
    return response?.data;
  }
);

export const getDepartmentOfUser = createAsyncThunk(
  "getDepartment",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/getSingleUserById?userId=${id}`
    );
    return response.data;
  }
);

export const createAuthDepartment = createAsyncThunk(
  "createDepartment",
  async (data) => {
    const response = await api.post(
      `/securityService/api/department/createDepartment?name=${data?.name}`
    );
    return response;
  }
);

export const createAuthDesigination = createAsyncThunk(
  "createAuthDesignibnation",
  async (data) => {
    const response = await api.post(
      `/securityService/api/designation/createDesignation?name=${data?.name}&weight=${data?.weight}`
    );
    return response;
  }
);

export const createDesiginationByDepartment = createAsyncThunk(
  "createDesiginationByDepartment",
  async (data) => {
    const response = await api.post(
      `/securityService/api/department/createDepartmentInDesignation`,
      data
    );
    return response.data;
  }
);

export const toggleAutoOnFeature = createAsyncThunk(
  "toggleAutoOnOffFeature",
  async ({ userId, flag }) => {
    const response = await api.put(
      `/leadService/api/v1/users/autoPresentOn?userId=${userId}&flag=${flag}`
    );
    return response.data;
  }
);

export const toggleAutoOffFeature = createAsyncThunk(
  "toggleAutoOnOffFeature",
  async ({ userId, flag }) => {
    const response = await api.put(
      `/leadService/api/v1/users/autoPresentOff?userId=${userId}&flag=${flag}`
    );
    return response.data;
  }
);

export const handleToggleAutomation = createAsyncThunk(
  "handleToggleAutomation",
  async () => {
    const response = await api.put(`/leadService/api/v1/auto/autoOnOff`);
    return response.data;
  }
);

export const getAutomationStatus = createAsyncThunk(
  "getAutomationStatus",
  async () => {
    const response = await api.get(`/leadService/api/v1/auto/getAutoOnOff`);
    return response.data;
  }
);

export const createNewUserInAuth = createAsyncThunk(
  "createNewUserInAuth",
  async (data) => {
    const response = await api.post(
      `/securityService/api/auth/createNewUserByEmail`,
      data
    );
    return response;
  }
);

export const updateUserData = createAsyncThunk("updateUser", async (data) => {
  const response = await api.put(
    `/securityService/api/auth/updateUserData`,
    data
  );
  return response;
});

export const deleteUserInAuth = createAsyncThunk(
  "deleteUserInAuth",
  async (id) => {
    const response = await api.delete(
      `/securityService/api/auth/deleteUser?userId=${id}`
    );
    return response.data;
  }
);

export const activateUserByAdminInAuth = createAsyncThunk(
  "activateUserByAdminInAuth",
  async (id) => {
    const response = await api.put(
      `/securityService/api/auth/activateUser?userId=${id}`
    );
    return response.data;
  }
);

export const AuthSlice = createSlice({
  name: "auth",
  initialState: {
    loginLoading: false,
    currentUser: {},
    loginError: false,
    roles: [],
    jwt: "",
    isAuth: false,
    isManagerApproved: false,
    getDepartmentDetail: {},
    userLoading: "",
    automationStatus: false,
  },
  reducers: {
    logoutFun: (state, action) => {
      state.isAuth = false;
      state.currentUser = {};
      localStorage.removeItem("persist:root");
      localStorage.removeItem("userDetail");
      localStorage.removeItem("vendorDetail");
    },
    handleLoadingState: (state, action) => {
      state.userLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCurrentUser.pending, (state, action) => {
      state.loginLoading = true;
      state.loginError = false;
      state.userLoading = "pending";
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem("userDetail", JSON.stringify(action.payload));
      state.jwt = action.payload.jwt;
      state.roles = action.payload.roles;
      state.loginLoading = false;
      state.isAuth = true;
    });
    builder.addCase(changePasswordAuthentication.fulfilled, (state, action) => {
      state.isManagerApproved = action.payload;
    });
    builder.addCase(changePasswordAuthentication.rejected, (state, action) => {
      state.loginError = true;
    });

    builder.addCase(getDepartmentOfUser.pending, (state, action) => {
      state.loginLoading = true;
      state.loginError = false;
    });
    builder.addCase(getDepartmentOfUser.fulfilled, (state, action) => {
      state.getDepartmentDetail = action.payload;
    });
    builder.addCase(getDepartmentOfUser.rejected, (state, action) => {
      state.loginError = true;
    });

    builder.addCase(getAutomationStatus.pending, (state, action) => {});
    builder.addCase(getAutomationStatus.fulfilled, (state, action) => {
      state.automationStatus = action.payload;
    });
    builder.addCase(getAutomationStatus.rejected, (state, action) => {});
  },
});

export const { logoutFun, handleLoadingState } = AuthSlice.actions;
export default AuthSlice.reducer;
