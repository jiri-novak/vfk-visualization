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
  telId: string;
  par: ISortableLabel[];
  lv: ISortableLabel[];
  vl: ISortableLabel[][];
}

export interface ISortableLabelDefinition {
  label: string;
  unit: string;
  order: number;
  transformFunc?: (s) => string;
  ccsClassFunc?: (v) => string;
}

export interface ISortableLabel {
  id: string;
  label: string;
  value: string;
  class: string;
  unit: string;
  valueWithUnit: string;
  order: number;
}

export interface IVlastnik {
  jmeno: string;
  adresa: string;
  podil?: number;
  podilM2?: number;
  typ: string;
  zemedelec: boolean;
}

export interface IVybraneLv {
  telId: string;
  cena: number;
  ku: string;
  cislo: string;
  poznamka: string;

  inEdit: boolean;
}
