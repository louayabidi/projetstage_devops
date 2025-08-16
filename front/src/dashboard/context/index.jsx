import React, { createContext, useContext, useReducer } from 'react';

// COMPLETE initialState with every possible property
const initialState = {
  miniSidenav: false,
  direction: "ltr",
  layout: "dashboard",
  openConfigurator: false,
  sidenavColor: "info",
  transparentNavbar: false,
  fixedNavbar: true,
  transparentSidenav: false,
  darkMode: false
};

// EXHAUSTIVE reducer handling all actions
function reducer(state, action) {
  switch (action.type) {
    case 'MINI_SIDENAV': return {...state, miniSidenav: action.value};
    case 'DIRECTION': return {...state, direction: action.value};
    case 'LAYOUT': return {...state, layout: action.value};
    case 'OPEN_CONFIGURATOR': return {...state, openConfigurator: action.value};
    case 'SIDENAV_COLOR': return {...state, sidenavColor: action.value};
    case 'TRANSPARENT_NAVBAR': return {...state, transparentNavbar: action.value};
    case 'FIXED_NAVBAR': return {...state, fixedNavbar: action.value};
    case 'TRANSPARENT_SIDENAV': return {...state, transparentSidenav: action.value};
    case 'DARK_MODE': return {...state, darkMode: action.value};
    default: return state;
  }
}

export const VisionUIControllerContext = createContext();

export function VisionUIControllerProvider({ children }) {
  const [controller, dispatch] = useReducer(reducer, initialState);
  return (
    <VisionUIControllerContext.Provider value={[controller, dispatch]}>
      {children}
    </VisionUIControllerContext.Provider>
  );
}

export function useVisionUIController() {
  const context = useContext(VisionUIControllerContext);
  if (!context) throw new Error('useVisionUIController must be used within VisionUIControllerProvider');
  return context;
}

// COMPLETE list of ALL action creators
export const setMiniSidenav = (dispatch, value) => dispatch({type: 'MINI_SIDENAV', value});
export const setDirection = (dispatch, value) => dispatch({type: 'DIRECTION', value});
export const setLayout = (dispatch, value) => dispatch({type: 'LAYOUT', value});
export const setOpenConfigurator = (dispatch, value) => dispatch({type: 'OPEN_CONFIGURATOR', value});
export const setSidenavColor = (dispatch, value) => dispatch({type: 'SIDENAV_COLOR', value});
export const setTransparentNavbar = (dispatch, value) => dispatch({type: 'TRANSPARENT_NAVBAR', value});
export const setFixedNavbar = (dispatch, value) => dispatch({type: 'FIXED_NAVBAR', value});
export const setTransparentSidenav = (dispatch, value) => dispatch({type: 'TRANSPARENT_SIDENAV', value});
export const setDarkMode = (dispatch, value) => dispatch({type: 'DARK_MODE', value});