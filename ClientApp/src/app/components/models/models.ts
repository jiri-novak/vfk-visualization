export interface ILocalizationByKu {
  katuzeKod: number;
}

export interface ILocalizationByPar {
  katuzeKod: number;
  parCislo: string;
}

export interface ILocalizationByLv {
  katuzeKod: number;
  lvId: number;
}

export interface IFeatureInfoData {
  par: IValue[];
  lv: IValue[];
}

export interface IValue {
  key: string;
  valueWithUnit: string;
}

export interface ISortableLabelDefinition {
  label: string;
  unit: string;
  order: number;
}

export interface ISortableLabel {
  id: string;
  label: string;
  value: string;
  unit: string;
  order: number;
}
