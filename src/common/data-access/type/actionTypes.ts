export enum ActionEnums {
  INTERNAL = "internal",
  EXTERNAL = "external",
}

export interface ActionInterface {
  type: ActionEnums;
  target: string;
}

export interface ButtonInterface {
  text?: string;
  action: ActionInterface;
}
