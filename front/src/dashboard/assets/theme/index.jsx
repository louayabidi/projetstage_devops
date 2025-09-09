/*!
=========================================================
* Vision UI Free React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-react
* Copyright 2021 Creative Tim[](https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-react/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import { createTheme } from "@mui/material/styles";

// Vision UI Dashboard React base styles
import colors from "dashboard-assets/theme/base/colors";
import breakpoints from "dashboard-assets/theme/base/breakpoints";
import typography from "dashboard-assets/theme/base/typography";
import boxShadows from "dashboard-assets/theme/base/boxShadows";
import borders from "dashboard-assets/theme/base/borders";
import globals from "dashboard-assets/theme/base/globals";

// Vision UI Dashboard React helper functions
import boxShadow from "dashboard-assets/theme/functions/boxShadow";
import hexToRgb from "dashboard-assets/theme/functions/hexToRgb";
import linearGradient from "dashboard-assets/theme/functions/linearGradient";
import tripleLinearGradient from "dashboard-assets/theme/functions/tripleLinearGradient";
import pxToRem from "dashboard-assets/theme/functions/pxToRem";
import rgba from "dashboard-assets/theme/functions/rgba";

// Vision UI Dashboard React components base styles for @mui material components
import sidenav from "dashboard-assets/theme/components/sidenav";
import list from "dashboard-assets/theme/components/list";
import listItem from "dashboard-assets/theme/components/list/listItem";
import listItemText from "dashboard-assets/theme/components/list/listItemText";
import card from "dashboard-assets/theme/components/card";
import cardMedia from "dashboard-assets/theme/components/card/cardMedia";
import cardContent from "dashboard-assets/theme/components/card/cardContent";
import button from "dashboard-assets/theme/components/button";
import iconButton from "dashboard-assets/theme/components/iconButton";
import inputBase from "dashboard-assets/theme/components/form/inputBase";
import menu from "dashboard-assets/theme/components/menu";
import menuItem from "dashboard-assets/theme/components/menu/menuItem";
import switchButton from "dashboard-assets/theme/components/form/switchButton";
import divider from "dashboard-assets/theme/components/divider";
import tableContainer from "dashboard-assets/theme/components/table/tableContainer";
import tableHead from "dashboard-assets/theme/components/table/tableHead";
import tableCell from "dashboard-assets/theme/components/table/tableCell";
import linearProgress from "dashboard-assets/theme/components/linearProgress";
import breadcrumbs from "dashboard-assets/theme/components/breadcrumbs";
import slider from "dashboard-assets/theme/components/slider";
import avatar from "dashboard-assets/theme/components/avatar";
import tooltip from "dashboard-assets/theme/components/tooltip";
import appBar from "dashboard-assets/theme/components/appBar";
import tabs from "dashboard-assets/theme/components/tabs";
import tab from "dashboard-assets/theme/components/tabs/tab";
import stepper from "dashboard-assets/theme/components/stepper";
import step from "dashboard-assets/theme/components/stepper/step";
import stepConnector from "dashboard-assets/theme/components/stepper/stepConnector";
import stepLabel from "dashboard-assets/theme/components/stepper/stepLabel";
import stepIcon from "dashboard-assets/theme/components/stepper/stepIcon";
import select from "dashboard-assets/theme/components/form/select";
import formControlLabel from "dashboard-assets/theme/components/form/formControlLabel";
import formLabel from "dashboard-assets/theme/components/form/formLabel";
import checkbox from "dashboard-assets/theme/components/form/checkbox";
import radio from "dashboard-assets/theme/components/form/radio";
import autocomplete from "dashboard-assets/theme/components/form/autocomplete";
import input from "dashboard-assets/theme/components/form/input";
import container from "dashboard-assets/theme/components/container";
import popover from "dashboard-assets/theme/components/popover";
import buttonBase from "dashboard-assets/theme/components/buttonBase";
import icon from "dashboard-assets/theme/components/icon";
import svgIcon from "dashboard-assets/theme/components/svgIcon";
import link from "dashboard-assets/theme/components/link";

export default createTheme({
  breakpoints: { ...breakpoints },
  palette: { ...colors },
  typography: { ...typography },
  boxShadows: { ...boxShadows },
  borders: { ...borders },
  functions: {
    boxShadow,
    hexToRgb,
    linearGradient,
    tripleLinearGradient,
    pxToRem,
    rgba,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...globals,
        ...container,
      },
    },
    MuiDrawer: { ...sidenav },
    MuiList: { ...list },
    MuiListItem: { ...listItem },
    MuiListItemText: { ...listItemText },
    MuiCard: { ...card },
    MuiCardMedia: { ...cardMedia },
    MuiCardContent: { ...cardContent },
    MuiButton: { ...button },
    MuiIconButton: { ...iconButton },
    MuiInputBase: { ...inputBase },
    MuiMenu: { ...menu },
    MuiMenuItem: { ...menuItem },
    MuiSwitch: { ...switchButton },
    MuiDivider: { ...divider },
    MuiTableContainer: { ...tableContainer },
    MuiTableHead: { ...tableHead },
    MuiTableCell: { ...tableCell },
    MuiLinearProgress: { ...linearProgress },
    MuiBreadcrumbs: { ...breadcrumbs },
    MuiSlider: { ...slider },
    MuiAvatar: { ...avatar },
    MuiTooltip: { ...tooltip },
    MuiAppBar: { ...appBar },
    MuiTabs: { ...tabs },
    MuiTab: { ...tab },
    MuiStepper: { ...stepper },
    MuiStep: { ...step },
    MuiStepConnector: { ...stepConnector },
    MuiStepLabel: { ...stepLabel },
    MuiStepIcon: { ...stepIcon },
    MuiSelect: { ...select },
    MuiFormControlLabel: { ...formControlLabel },
    MuiFormLabel: { ...formLabel },
    MuiCheckbox: { ...checkbox },
    MuiRadio: { ...radio },
    MuiAutocomplete: { ...autocomplete },
    MuiInput: { ...input },
    MuiOutlinedInput: { ...input },
    MuiFilledInput: { ...input },
    MuiPopover: { ...popover },
    MuiButtonBase: { ...buttonBase },
    MuiIcon: { ...icon },
    MuiSvgIcon: { ...svgIcon },
    MuiLink: { ...link },
  },
});