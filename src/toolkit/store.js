import { combineReducers, configureStore } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/lib/storage";
import storageSession from "redux-persist/lib/storage/session";

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

const authPersistConfig = {
  key: "auth",
  storage: storageSession,
};

const rootPersistConfig = {
  key: "root",
  storage,
  blacklist: ["auth"],
};

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
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
    storageSession.removeItem("persist:auth");
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
