// @flow
import * as actionTypes from '../actionTypes';

type toggleLandingPageModuleAction = string => actionTypes.toggleLandingPageModule;
export const toggleLandingPageModule: toggleLandingPageModuleAction = id => ({
  id: id,
  type: actionTypes.TOGGLE_LANDING_PAGE_MODULE
});

type updateLandingPageModulesAction = actionTypes.LandingPageModules => actionTypes.UpdateLandingPageModules;
export const updateLandingPageModules: updateLandingPageModulesAction = modules => ({
  modules: modules,
  type: actionTypes.UPDATE_LANDING_PAGE_MODULES
});

type moveLandingPageModuleUpAction = string => actionTypes.MoveLandingPageModuleUp;
export const moveLandingPageModuleUp: moveLandingPageModuleUpAction = id => ({
  id: id,
  type: actionTypes.MOVE_LANDING_PAGE_MODULE_UP
});

type moveLandingPageModuleDownAction = string => actionTypes.MoveLandingPageModuleDown;
export const moveLandingPageModuleDown: moveLandingPageModuleDownAction = id => ({
  id: id,
  type: actionTypes.MOVE_LANDING_PAGE_MODULE_DOWN
});

export const createLandingPageModule = (id: string, identifier: string, numberOfDuplicatesModules: number, title: string, order: number): actionTypes.createLandingPageModule => ({
  id: id,
  identifier: identifier,
  numberOfDuplicatesModules: numberOfDuplicatesModules,
  title: title,
  order: order,
  type: actionTypes.CREATE_LANDING_PAGE_MODULE
});