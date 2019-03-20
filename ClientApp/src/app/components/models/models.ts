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
  par: IKeyValue[];
  lv: IKeyValue[];
}

export interface IKeyValue {
  key: string;
  value: string;
}
