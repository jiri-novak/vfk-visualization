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

export interface ILocalizationByCoordinates {
  x: number;
  y: number;
}

export interface IFeatureInfoData {
  telId: number;
  x: number;
  y: number;
  par: ISortableLabel[];
  lv: ISortableLabel[];
  vl: ISortableLabel[][];
  cena?: number;
  poznamka: string;
  datum: Date;
  pracoviste?: string;
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
  code?: number;
}

export interface ILvInfo {
  vlastnici: IVlastnik[];
  cena: IPrice;
}

export interface IVlastnik {
  pracoviste: string;
  jmeno: string;
  adresa: string;
  podil?: number;
  podilM2?: number;
  typ: string;
  zemedelec: boolean;
}

export interface IGenerateExcel {
  exportId: number;
}

export interface ISession {
  activeKatuzeKod?: number;
  activeKatuzeName?: string;
  activeExport?: IExport;
}

export interface IExport {
  id: number;
  name: string;
  createdAt: Date;
  prices: IPrice[];
}

export interface IExportDetails {
  prices: IPriceDetails[];
}

export interface IPriceDetails extends IPrice {
  pracoviste: string;
  ku: string;
  cisloLv: number;
}

export interface IPrice {
  telId: number;
  x: number;
  y: number;
  createdAt: Date;
  cenaNabidkova?: number;
  poznamka?: string;
}

export interface IExportId {
  id: number;
  name: string;
  createdAt: Date;
}

export interface IKatuze {
  id: number;
  name: string;
}

export interface ISetPrice {
  exportId: number;
  x: number;
  y: number;
  price?: number;
}

export interface ISetComment {
  exportId: number;
  x: number;
  y: number;
  comment?: string;
}

export interface ICreateExport {
  name: string;
}