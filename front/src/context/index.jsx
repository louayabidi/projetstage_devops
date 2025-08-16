import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  miniSidenav: false,
  direction: "ltr",
  layout: "dashboard",
  openConfigurator: false,
  sidenavColor: "info"
};

function reducer(state, action) {
  switch (action.type) {
    case 'MINI_SIDENAV':
      return { ...state, miniSidenav: action.value };
    case 'DIRECTION':
      return { ...state, direction: action.value };
    case 'LAYOUT':
      return { ...state, layout: action.value };
    case 'OPEN_CONFIGURATOR':
      return { ...state, openConfigurator: action.value };
    case 'SIDENAV_COLOR':
      return { ...state, sidenavColor: action.value };
    default:
      return state;
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
  if (!context) {
    throw new Error(
      'useVisionUIController should be used inside the VisionUIControllerProvider'
    );
  }
  return context;
}