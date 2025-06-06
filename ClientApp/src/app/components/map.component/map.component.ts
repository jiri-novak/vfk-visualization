import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import Feature from 'ol/Feature';
import View from 'ol/View';
import { defaults } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import OlMap from 'ol/Map';
import Tile from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import Projection from 'ol/proj/Projection';
import MousePosition from 'ol/control/MousePosition';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { METERS_PER_UNIT } from 'ol/proj';
import LayerSwitcher from 'ol-layerswitcher';

import { OlStyles } from 'src/app/services/ol.styling.service';
import { IFeatureInfoData, ISortableLabel, ISortableLabelDefinition } from '../models/models';
import { ServerAppService } from 'src/app/services/serverapp.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @ViewChild('location') locationRef: ElementRef;
  @ViewChild('map') mapRef: ElementRef;
  @ViewChild('scale') scaleRef: ElementRef;

  public busy: Subscription;

  @Output() featureInfoData: EventEmitter<IFeatureInfoData> = new EventEmitter<IFeatureInfoData>();

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private olStylingService: OlStyles,
    private serverAppService: ServerAppService) {
    this.lvAttrTranslate = new Map([
      ['OBEC', { label: 'obec:', order: 2, unit: '' }],
      ['KU', { label: 'k.ú.:', order: 3, unit: '' }],
      ['LVID', { label: 'číslo:', order: 4, unit: '' }],
      ['VYMERA', { label: 'výměra:', order: 5, unit: ' m<sup>2</sup>' }],
      ['V_BPEJ', { label: 'výměra BPEJ:', order: 6, unit: ' m<sup>2</sup>' }],
      ['ORNA', { label: 'orná:', order: 7, unit: ' m<sup>2</sup>' }],
      ['TTP', { label: 'ttp:', order: 8, unit: ' m<sup>2</sup>' }],
      ['PRU_BPEJ', { label: 'cena BPEJ/m<sup>2</sup>:', order: 9, unit: ' Kč' }],
      ['PARCEL', { label: 'poč. parcel:', order: 10, unit: '' }],
      ['V_LPIS_PR', { label: 'LPIS:', order: 11, unit: ' %' }],
      ['TYP_VL', { label: 'typ vl.:', order: 12, unit: '', transformFunc: this.transformTypVlastnictvi }],
      ['P_VL', { label: 'poč. vl.:', order: 13, unit: '' }],
      ['KATUZE_KOD', { label: 'kód k.ú.:', order: 14, unit: '' }]
    ]);

    this.parAttrTranslate = new Map([
      ['KU', { label: 'k.ú.:', order: 1, unit: '' }],
      ['KATUZE_KOD', { label: 'kód k.ú.:', order: 2, unit: '' }],
      ['LVID', { label: 'číslo LV:', order: 3, unit: '' }],
      ['PAR_CISLO', { label: 'číslo:', order: 4, unit: '' }],
      ['DRUH', { label: 'druh:', order: 5, unit: '' }],
      ['VYUZITI', { label: 'využití:', order: 6, unit: '' }],
      ['VYMERA', { label: 'výměra:', order: 7, unit: ' m<sup>2</sup>' }],
      ['V_LV_PR', { label: 'výměra z LV:', order: 8, unit: ' m<sup>2</sup>' }],
    ]);

    this.vlAttrTranslate = new Map([
      ['jmeno', { label: 'jméno:', order: 1, unit: '' }],
      ['adresa', { label: 'adresa:', order: 2, unit: '' }],
      ['podil', { label: 'podíl:', order: 3, unit: ' %' }],
      ['podilM2', { label: 'podíl:', order: 4, unit: ' m<sup>2</sup>' }],
      ['typ', { label: 'typ:', order: 5, unit: '', transformFunc: this.transformTypVlastnictvi }],
      ['zemedelec', { label: 'zemědělec:', order: 6, unit: '', transformFunc: this.transformTrueFalse, ccsClassFunc: this.zvyrazniZemedelce }],
    ]);
  }

  private lvAttrTranslate: Map<string, ISortableLabelDefinition>;
  private parAttrTranslate: Map<string, ISortableLabelDefinition>;
  private vlAttrTranslate: Map<string, ISortableLabelDefinition>;

  epsg5514Ne: Projection;
  epsg5514: Projection;

  sourceVector: VectorSource;
  sourceVfk: TileWMS;
  sourceOrtofoto: TileWMS;
  sourceZm10: TileWMS;
  sourceKm: TileWMS;
  sourceLpis: TileWMS;

  layerVector: VectorLayer;
  layerVfk: Tile;
  layerOrtofoto: Tile;
  layerZm10: Tile;
  layerKm: Tile;
  layerLpis: Tile;

  map: OlMap;
  view: View;
  mousePosition: MousePosition;
  layerSwitcher: LayerSwitcher;

  ngOnInit() {
    this.epsg5514Ne = new Projection({
      code: 'EPSG:5514',
      units: 'm',
      axisOrientation: 'neu',
      global: false
    });

    this.epsg5514 = new Projection({
      code: 'EPSG:5514',
      units: 'm',
      axisOrientation: 'enu',
      global: false
    });

    this.sourceZm10 = new TileWMS({
      url: 'http://geoportal.cuzk.cz/WMS_ZM10_PUB/WMService.aspx',
      projection: this.epsg5514,
      params: {
        FORMAT: 'image/png',
        VERSION: '1.3.0',
        LAYERS: 'GR_ZM10',
        tiled: true
      }
    });

    this.sourceOrtofoto = new TileWMS({
      url: 'http://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/WMService.aspx',
      projection: this.epsg5514,
      params: {
        FORMAT: 'image/png',
        VERSION: '1.3.0',
        LAYERS: 'GR_ORTFOTORGB',
        tiled: true
      }
    });

    this.sourceVfk = new TileWMS({
      url: 'http://localhost:8080/geoserver/VFK/wms',
      projection: this.epsg5514Ne,
      params: {
        FORMAT: 'image/png',
        VERSION: '1.1.1',
        LAYERS: 'VFK:DATA',
        tiled: true
      }
    });

    this.sourceKm = new TileWMS({
      url: 'http://services.cuzk.cz/wms/local-KM-wms.asp?service=WMS',
      projection: this.epsg5514,
      params: {
        FORMAT: 'image/png',
        VERSION: '1.3.0',
        LAYERS: 'KN',
        tiled: true
      }
    });

    this.sourceLpis = new TileWMS({
      url: 'https://mze.gov.cz/public/app/wms/public_DPB_PB_OPV.fcgi',
      projection: this.epsg5514,
      params: {
        FORMAT: 'image/png',
        LAYERS: 'DPB_KUL',
        tiled: true
      }
    });

    this.sourceVector = new VectorSource();

    this.layerZm10 = new Tile({
      title: 'Základní mapa',
      type: 'base',
      visible: true,
      source: this.sourceZm10
    });

    this.layerOrtofoto = new Tile({
      title: 'Ortofoto',
      type: 'base',
      visible: false,
      source: this.sourceOrtofoto
    });

    this.layerVfk = new Tile({
      title: 'Data VFK',
      visible: true,
      zIndex: 9,
      source: this.sourceVfk
    });

    this.layerKm = new Tile({
      title: 'Katastrální mapa',
      visible: false,
      zIndex: 10,
      source: this.sourceKm
    });

    this.layerLpis = new Tile({
      title: 'LPIS',
      visible: false,
      zIndex: 11,
      source: this.sourceLpis
    });

    this.layerVector = new VectorLayer({
      zIndex: 12,
      visible: true,
      source: this.sourceVector,
      style: (feature: Feature) => this.olStylingService.styles[feature.getGeometry().getType()]
    });

    this.view = new View({
      projection: this.epsg5514,
      center: [-696019, -1057391],
      zoom: 11
    });

    this.mousePosition = new MousePosition(
      {
        className: 'custom-mouse-position',
        coordinateFormat: createStringXY(5),
        projection: this.epsg5514,
        target: this.locationRef.nativeElement,
        undefinedHTML: '&nbsp;'
      }
    );

    this.layerSwitcher = new LayerSwitcher();

    this.map = new OlMap({
      target: this.mapRef.nativeElement,
      controls: defaults({
        attribution: false
      }).extend([
        this.mousePosition,
        this.layerSwitcher
      ]),
      layers: [
        this.layerVector,
        new LayerGroup({
          title: 'LPIS',
          layers: [
            this.layerLpis
          ]
        }),
        new LayerGroup({
          title: 'Podkladové mapy:',
          layers: [
            this.layerZm10,
            this.layerOrtofoto
          ]
        }),
        new LayerGroup({
          title: 'Katastr nemovistostí:',
          layers: [
            this.layerKm,
            this.layerVfk
          ]
        })
      ],
      view: this.view
    });

    // resolution
    const self = this;
    this.map.getView().on('change:resolution', function (evt) {
      const resolution = evt.target.get('resolution');
      const units = this.getProjection().getUnits();
      const dpi = 25.4 / 0.28;
      const mpu = METERS_PER_UNIT[units];
      const scale = Math.round(resolution * mpu * 39.37 * dpi);
      self.scaleRef.nativeElement.innerHTML = `1 : ${scale}`;
    });

    this.map.on('singleclick', evt => {
      const step = 0.5;
      const x: number = evt.coordinate[0];
      const y: number = evt.coordinate[1];
      const bbox = `${x - step},${y - step},${x + step},${y + step}`;

      this.busy = forkJoin(
        self.getFeatureByBboxGeoJson$('VFK:LV', bbox, 1),
        self.getFeatureByBboxGeoJson$('VFK:PAR', bbox, 1),
      ).subscribe(([respLv, respPar]) => {
        const featuresLv: Array<Feature> = (new GeoJSON()).readFeatures(respLv);
        const featuresPar: Array<Feature> = (new GeoJSON()).readFeatures(respPar);

        let dataLv: ISortableLabel[] = [];
        let dataPar: ISortableLabel[] = [];
        let dataVl: ISortableLabel[][] = [];

        self.sourceVector.clear();

        if (featuresLv.length > 0 && featuresPar.length > 0) {
          self.sourceVector.addFeature(featuresLv[0]);

          const propertiesLv = featuresLv[0].getProperties();
          const propertiesPar = featuresPar[0].getProperties();
          const telId = propertiesLv.TEL_ID;

          dataLv = self.getData(propertiesLv, self.lvAttrTranslate);
          dataPar = self.getData(propertiesPar, self.parAttrTranslate);

          this.busy = self.serverAppService.getLvInfo(telId).subscribe(vlastnici => {
            dataVl = vlastnici.map(v => self.getData(v, self.vlAttrTranslate));

            self.featureInfoData.next({ par: dataPar, lv: dataLv, vl: dataVl, telId });
          }, () => this.toastrService.error('Nepodařilo se načíst informace pro daný bod v mapě.', 'Informace'));
        }
      }, () => {
        this.toastrService.error('Nepodařilo se načíst informace pro daný bod v mapě.', 'Informace');
      });
    });
  }

  private getData(properties: any, translate: Map<string, ISortableLabelDefinition>): ISortableLabel[] {
    const data: ISortableLabel[] = [];

    for (const key of Object.keys(properties)) {
      if (!translate.has(key)) {
        continue;
      }

      const metadata = translate.get(key);
      const unit = !!properties[key] ? metadata.unit : null;
      const value = metadata.transformFunc == null
        ? properties[key]
        : metadata.transformFunc(properties[key]);
      const valueWithUnit = value != null
        ? unit != null
          ? `${value} ${unit}`
          : value
        : null;
      const cssClass = metadata.ccsClassFunc == null
        ? ''
        : metadata.ccsClassFunc(properties[key]);

      data.push({
        id: key,
        label: metadata.label,
        value,
        unit,
        order: metadata.order,
        class: cssClass,
        valueWithUnit
      });
    }

    data.sort((a: ISortableLabel, b: ISortableLabel) => {
      if (a.order < b.order) {
        return -1;
      }
      if (a.order > b.order) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });

    return data;
  }

  private transformTypVlastnictvi(value: string): string {
    if (value === 'OFO') {
      return 'fyzická';
    } else if (value === 'OPO') {
      return 'právnická';
    } else if (value === 'OST') {
      return 'kombinace';
    } else if (value === 'STAT') {
      return 'státní';
    } else if (value === 'BSM') {
      return 'manželé';
    }

    return value;
  }

  private transformTrueFalse(value: boolean): string {
    if (value) {
      return 'ano';
    }
    return 'ne';
  }

  private zvyrazniZemedelce(value: boolean): string {
    if (value) {
      return 'red';
    }
    return '';
  }

  public localizeByLv(event: any) {
    this.busy = this.localizeByLv$(event.katuzeKod, event.lvId).subscribe(
      () => { }, () => this.toastrService.error('Nepodařilo lokalizovat se zadané LV', 'Lokalizace dle LV'));
  }

  public localizeByKu(event: any) {
    this.busy = this.localizeByKu$(event.katuzeKod).subscribe(
      () => { }, () => this.toastrService.error('Nepodařilo lokalizovat se zadané k.ú.', 'Lokalizace dle k.ú.'));
  }

  public localizeByPar(event: any) {
    this.busy = this.localizeByPar$(event.katuzeKod, event.parCislo).subscribe(
      () => { }, () => this.toastrService.error('Nepodařilo lokalizovat se zadanou parcelu', 'Lokalizace dle parcely'));
  }

  public cancelLocalization() {
    this.sourceVector.clear();
    this.sourceVector.refresh();
  }

  private localizeByLv$(kuKod: number, lvId: number): Observable<any> {
    return this.getFeatureGeoJson$('VFK:LV', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`)
      .pipe(
        map(resp => this.localizeToFeature$(resp))
      );
  }

  private localizeByKu$(kuKod: number): Observable<any> {
    return this.getFeatureGeoJson$('VFK:KU', `KOD=${kuKod}`)
      .pipe(
        map(resp => this.localizeToFeature$(resp))
      );
  }

  public localizeByPar$(kuKod: number, parcelKod: string): Observable<any> {
    return this.getFeatureGeoJson$('VFK:PAR', `PAR_CISLO='${parcelKod}' AND KATUZE_KOD=${kuKod}`)
      .pipe(
        map(resp => this.localizeToFeature$(resp))
      );
  }

  private localizeToFeature$(resp: any) {
    this.sourceVector.clear();
    const features = (new GeoJSON()).readFeatures(resp);
    this.sourceVector.addFeatures(features);
    this.view.fit(this.sourceVector.getExtent());
  }

  private getFeatureGeoJson$(typeName: string, cqlFilter: string): Observable<any> {
    const params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      srsName: 'EPSG:5514',
      outputFormat: 'application/json',
      typeName,
      cql_filter: cqlFilter
    };

    return this.http.get('http://localhost:8080/geoserver/VFK/ows', { params });
  }

  private getFeatureByBboxGeoJson$(typeName: string, bbox: string, count: number): Observable<any> {
    const params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      srsName: 'EPSG:5514',
      outputFormat: 'application/json',
      count: `${count}`,
      typeName,
      bbox
    };

    return this.http.get('http://localhost:8080/geoserver/VFK/ows', { params });
  }
}
