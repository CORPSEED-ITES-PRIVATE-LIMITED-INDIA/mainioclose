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

const reducers = combineReducers({
  auth: authReducer,
  leads: leadReducer,
  common: commonReducer,
  setting: settingReducer,
  company: companyReducer,
  account:accountReducer
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
