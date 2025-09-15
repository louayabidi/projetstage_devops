import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const initialState = {
  miniSidenav: false,
  direction: "ltr",
  layout: "dashboard",
  openConfigurator: false,
  sidenavColor: "info",
  transparentNavbar: false,
  fixedNavbar: true,
  transparentSidenav: false,
  darkMode: false,
  user: null,
  userLoading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case "MINI_SIDENAV":
      return { ...state, miniSidenav: action.value };
    case "DIRECTION":
      return { ...state, direction: action.value };
    case "LAYOUT":
      return { ...state, layout: action.value };
    case "OPEN_CONFIGURATOR":
      return { ...state, openConfigurator: action.value };
    case "SIDENAV_COLOR":
      return { ...state, sidenavColor: action.value };
    case "TRANSPARENT_NAVBAR":
      return { ...state, transparentNavbar: action.value };
    case "FIXED_NAVBAR":
      return { ...state, fixedNavbar: action.value };
    case "TRANSPARENT_SIDENAV":
      return { ...state, transparentSidenav: action.value };
    case "DARK_MODE":
      return { ...state, darkMode: action.value };
    case "SET_USER":
      return { ...state, user: action.value, userLoading: false };
    case "SET_USER_LOADING":
      return { ...state, userLoading: action.value };
    default:
      return state;
  }
}

export const VisionUIControllerContext = createContext();

export function VisionUIControllerProvider({ children }) {
  const [controller, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initializeUser = async () => {
      setUserLoading(dispatch, true);
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const tokenPayload = jwtDecode(token);
          if (tokenPayload.exp * 1000 < Date.now()) {
            console.log("Token expired");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setUser(dispatch, null);
            return;
          }

          // Fetch user data from server
          const response = await axios.get("http://localhost:3000/api/auth/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("User data from server:", response.data);
          setUser(dispatch, response.data.user || tokenPayload);
        } catch (error) {
          console.error("Error initializing user:", error.response?.data || error.message);
          const tokenPayload = jwtDecode(token);
          if (tokenPayload.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setUser(dispatch, null);
          } else {
            // Fallback to decoded token if server call fails
            console.log("Falling back to decoded token:", tokenPayload);
            setUser(dispatch, tokenPayload);
          }
        }
      } else {
        console.log("No token found in localStorage");
        setUser(dispatch, null);
      }
      setUserLoading(dispatch, false);
    };

    initializeUser();
  }, []);

  return (
    <VisionUIControllerContext.Provider value={[controller, dispatch]}>
      {children}
    </VisionUIControllerContext.Provider>
  );
}

export function useVisionUIController() {
  const context = useContext(VisionUIControllerContext);
  if (!context) throw new Error("useVisionUIController must be used within VisionUIControllerProvider");
  return context;
}

export const setMiniSidenav = (dispatch, value) => dispatch({ type: "MINI_SIDENAV", value });
export const setDirection = (dispatch, value) => dispatch({ type: "DIRECTION", value });
export const setLayout = (dispatch, value) => dispatch({ type: "LAYOUT", value });
export const setOpenConfigurator = (dispatch, value) => dispatch({ type: "OPEN_CONFIGURATOR", value });
export const setSidenavColor = (dispatch, value) => dispatch({ type: "SIDENAV_COLOR", value });
export const setTransparentNavbar = (dispatch, value) => dispatch({ type: "TRANSPARENT_NAVBAR", value });
export const setFixedNavbar = (dispatch, value) => dispatch({ type: "FIXED_NAVBAR", value });
export const setTransparentSidenav = (dispatch, value) => dispatch({ type: "TRANSPARENT_SIDENAV", value });
export const setDarkMode = (dispatch, value) => dispatch({ type: "DARK_MODE", value });
export const setUser = (dispatch, value) => dispatch({ type: "SET_USER", value });
export const setUserLoading = (dispatch, value) => dispatch({ type: "SET_USER_LOADING", value });