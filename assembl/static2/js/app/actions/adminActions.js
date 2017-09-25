export const updateSelectedLocale = (newLocale) => {
  return {
    newLocale: newLocale,
    type: 'UPDATE_SELECTED_LOCALE'
  };
};

export const updateThematics = (thematics) => {
  return {
    thematics: thematics,
    type: 'UPDATE_THEMATICS'
  };
};

export const updateThematicImgUrl = (id, value) => {
  return {
    id: id,
    value: value,
    type: 'UPDATE_THEMATIC_IMG_URL'
  };
};

export const updateThematicTitle = (id, locale, value) => {
  return {
    id: id,
    locale: locale,
    value: value,
    type: 'UPDATE_THEMATIC_TITLE'
  };
};

export const deleteThematic = (id) => {
  return {
    id: id,
    type: 'DELETE_THEMATIC'
  };
};

export const createNewThematic = (id) => {
  return {
    id: id,
    type: 'CREATE_NEW_THEMATIC'
  };
};

export const addQuestionToThematic = (id, locale) => {
  return {
    id: id,
    locale: locale,
    type: 'ADD_QUESTION_TO_THEMATIC'
  };
};

export const updateQuestionTitle = (thematicId, index, locale, value) => {
  return {
    thematicId: thematicId,
    index: index,
    locale: locale,
    value: value,
    type: 'UPDATE_QUESTION_TITLE'
  };
};

export const removeQuestion = (thematicId, index) => {
  return {
    thematicId: thematicId,
    index: index,
    type: 'REMOVE_QUESTION'
  };
};

export const toggleMedia = (id) => {
  return { id: id, type: 'TOGGLE_MEDIA' };
};

export const updateMediaHtmlCode = (id, value) => {
  return { id: id, value: value, type: 'UPDATE_MEDIA_HTML_CODE' };
};

export const updateMediaDescriptionTop = (id, locale, value) => {
  return { id: id, locale: locale, value: value, type: 'UPDATE_MEDIA_DESCRIPTION_TOP' };
};

export const updateMediaDescriptionBottom = (id, locale, value) => {
  return { id: id, locale: locale, value: value, type: 'UPDATE_MEDIA_DESCRIPTION_BOTTOM' };
};

export const updateMediaDescriptionSide = (id, locale, value) => {
  return { id: id, locale: locale, value: value, type: 'UPDATE_MEDIA_DESCRIPTION_SIDE' };
};

export const updateMediaTitle = (id, locale, value) => {
  return { id: id, locale: locale, value: value, type: 'UPDATE_MEDIA_TITLE' };
};

export const addLanguagePreference = (locale) => {
  return { locale: locale, selected: true, type: 'ADD_LANGUAGE_PREFERENCE' };
};

export const removeLanguagePreference = (locale) => {
  return { locale: locale, selected: false, type: 'REMOVE_LANGUAGE_PREFERENCE' };
};

export const languagePreferencesHasChanged = (state) => {
  return { state: state, type: 'LANGUAGE_PREFERENCE_HAS_CHANGED' };
};