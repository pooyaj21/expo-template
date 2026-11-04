export enum TestIdEnums {
  TOOLBAR_BACK = "toolbar-back",

  HOME_SCREEN = "home-screen",
  HOME_EXAMPLE_LIST = "home-example-list",

  EXAMPLE_LIST_SCREEN = "example-list-screen",
  EXAMPLE_LIST = "example-list",
  EXAMPLE_DETAIL_SCREEN = "example-detail-screen",

  SETTINGS_SCREEN = "settings-screen",
  SETTINGS_LANGUAGE = "settings-language",

  DIALOG_CONFIRM = "dialog-confirm",
  DIALOG_CANCEL = "dialog-cancel",
  DIALOG_CLOSE = "dialog-close",
}

export const testIdFor = (prefix: string, key: string | number): string =>
  `${prefix}-${key}`;

export const exampleCellTestId = (id: string | number): string =>
  testIdFor("example-cell", id);
