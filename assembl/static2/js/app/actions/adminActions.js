export const updateSelectedLocale = (newLocale) => {
  return {
    newLocale: newLocale,
    type: 'UPDATE_SELECTED_LOCALE'
  };
};

export const listThematicsToDelete = (thematicsToDelete) => {
  return {
    thematicsToDelete: thematicsToDelete,
    type: 'LIST_THEMATICS_TO_DELETE'
  };
};

export const listPreviewsToDisplay = (previewsToDisplay) => {
  return {
    previewsToDisplay: previewsToDisplay,
    type: 'LIST_PREVIEWS_TO_DISPLAY'
  };
};