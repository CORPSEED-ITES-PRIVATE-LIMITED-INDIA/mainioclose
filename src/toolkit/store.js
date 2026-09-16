import { combineReducers, configureStore } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import leadReducer from "./slices/leadSlice";
import commonReducer from "./slices/commonSlice";
import settingReducer from "./slices/settingSlice";
import companyReducer from "./slices/companySlice";
import accountReducer from "./slices/accountSlice";
import vendorsReducer from "./slices/vendorsSlice";
import dashboardReducer from "./slices/dashboardSlice";
import organizationReducer from "./slices/organizationSlice";
import productReducer from "./slices/productSlice";
import operationReducer from "./slices/operationSlice";

// `auth` is deliberately not persisted here: it hydrates synchronously from the
// sessionStorage "userDetail" key that Login and the axios interceptor already
// use. A second, asynchronous copy would race the route guard on reload.
const rootPersistConfig = {
  key: "root",
  storage,
  blacklist: ["auth"],
};

const appReducer = combineReducers({
  auth: authReducer,
  leads: leadReducer,
  common: commonReducer,
  setting: settingReducer,
  company: companyReducer,
  account: accountReducer,
  vendors: vendorsReducer,
  dashboard: dashboardReducer,
  organization: organizationReducer,
  product: productReducer,
  operation: operationReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, appReducer);

const rootReducer = (state, action) => {
  if (action.type === "auth/logoutFun") {
    storage.removeItem("persist:root");
    return appReducer(undefined, action);
  }

  return persistedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
