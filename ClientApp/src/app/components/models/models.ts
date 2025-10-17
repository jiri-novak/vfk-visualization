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
  telId: number;
  lv: ISortableLabel[];
  vl: ISortableLabel[][];
  cena?: number;
  poznamka: string;
  datum: Date;
  pracoviste?: string;
  pars: ISortableLabel[][];
  activeTab: ActiveTab;
  clickedParIds: string[];
}

export type ActiveTab = 'lv' | 'par';

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
  exportId: number;
  prices: IPriceDetails[];
}

export interface IPriceDetails extends IPrice {
  pracoviste: string;
  ku: string;
  kuKod: number;
  cisloLv: number;
}

export interface IPrice {
  telId: number;
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

export interface ISetPriceAndComment {
  exportId: number;
  price?: number;
  comment?: string;
}

export interface ICreateExport {
  name: string;
}

export interface IRenameExport {
  newName: string;
}