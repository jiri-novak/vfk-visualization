import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, Subscription, iif, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

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
import { IFeatureInfoData, ISortableLabel, ISortableLabelDefinition, IVlastnik } from '../models/models';
import { ServerAppService } from 'src/app/services/serverapp.service';
import { ToastrService } from 'ngx-toastr';
import { Geometry, MultiPolygon } from 'ol/geom';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: false
})
export class MapComponent implements OnInit {

  @ViewChild('location', { static: true }) locationRef: ElementRef;
  @ViewChild('map', { static: true }) mapRef: ElementRef;
  @ViewChild('scale', { static: true }) scaleRef: ElementRef;

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
      ['zemedelec', { label: 'zemědělec:', order: 1, unit: '', transformFunc: this.transformTrueFalse, ccsClassFunc: this.zvyrazniZemedelce }],
      ['jmeno', { label: 'jméno:', order: 2, unit: '' }],
      ['adresa', { label: 'adresa:', order: 3, unit: '' }],
      ['podil', { label: 'podíl:', order: 4, unit: ' %' }],
      ['podilM2', { label: 'podíl:', order: 5, unit: ' m<sup>2</sup>' }],
      ['typ', { label: 'typ:', order: 6, unit: '', transformFunc: this.transformTypVlastnictvi }],
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
  legendCollapsed: boolean = true;

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
      properties: {
        title: 'Základní mapa',
        type: 'base',
      },
      visible: true,
      source: this.sourceZm10
    });

    this.layerOrtofoto = new Tile({
      properties: {
        title: 'Ortofoto',
        type: 'base',
      },
      visible: false,
      source: this.sourceOrtofoto
    });

    this.layerVfk = new Tile({
      properties: {
        title: 'Data VFK',
      },
      visible: true,
      zIndex: 9,
      source: this.sourceVfk
    });

    this.layerKm = new Tile({
      properties: {
        title: 'Katastrální mapa',
      },
      visible: false,
      zIndex: 10,
      source: this.sourceKm
    });

    this.layerLpis = new Tile({
      properties: {
        title: 'LPIS',
      },
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
        // projection: this.epsg5514,
        target: this.locationRef.nativeElement,
        // undefinedHTML: '&nbsp;'
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
          properties: {
            title: 'Další vrstvy',
          },
          layers: [
            this.layerLpis
          ]
        }),
        new LayerGroup({
          properties: {
            title: 'Podkladové mapy:',
          },
          layers: [
            this.layerZm10,
            this.layerOrtofoto
          ]
        }),
        new LayerGroup({
          properties: {
            title: 'Katastr nemovistostí:',
          },
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
      const x: number = evt.coordinate[0];
      const y: number = evt.coordinate[1];
      this.getByCoordinates(x, y);
    });
  }

  private getByCoordinates(x: number, y: number) {
    const step = 0.01;
    const bbox = `${x - step},${y - step},${x + step},${y + step}`;

    this.busy = this.getFeatureByBboxGeoJson$('VFK:PAR', bbox, 1)
      .pipe(
        switchMap(respPar => {
          const featuresClickedPar: Array<Feature> = (new GeoJSON()).readFeatures(respPar);
          const featuresClickedParProperties = featuresClickedPar[0].getProperties();
          const lvId = featuresClickedParProperties.LVID;
          const kuKod = featuresClickedParProperties.KATUZE_KOD;
          return forkJoin([
            this.getFeatureGeoJson$('VFK:LV', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`),
            this.getFeatureGeoJson$('VFK:PAR', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`)
          ]).pipe(
            map(resp => [
              featuresClickedPar,
              new GeoJSON().readFeatures(resp[0]),
              new GeoJSON().readFeatures(resp[1])]))
        }))
      .subscribe(([featuresClickedPar, featuresLv, featuresPar]) => {
        this.getByFeatures(featuresLv, featuresPar, featuresClickedPar);
      }, () => this.toastrService.error('Nepodařilo se načíst informace pro daný bod v mapě.', 'Lokalizace dle souřadnic'));
  }

  private getByFeatures(featuresLv: Feature<Geometry>[], featuresPar: Feature<Geometry>[], featuresClickedPar: Feature<Geometry>[]) {
    let dataLv: ISortableLabel[] = [];
    let dataPars: ISortableLabel[][] = [];
    let dataVl: ISortableLabel[][] = [];
    let clickedPars: string[] = [];

    if (featuresClickedPar.length > 0) {
      this.sourceVector.clear();
      this.sourceVector.addFeatures(featuresClickedPar);
      clickedPars = featuresClickedPar.map(x => x.getProperties()['PAR_CISLO']);
    }

    if (featuresLv.length > 0 && featuresPar.length > 0) {
      const propertiesLv = featuresLv[0].getProperties();
      const propertiesPars = featuresPar.map(x => x.getProperties());
      const telId = propertiesLv.TEL_ID;

      dataLv = this.getData(propertiesLv, this.lvAttrTranslate);
      dataPars = propertiesPars
        .sort((a: { [x: string]: any }, b: { [x: string]: any }) => {
          var aClicked = clickedPars.includes(a['PAR_CISLO']);
          var bClicked = clickedPars.includes(b['PAR_CISLO']);
          if (aClicked == bClicked) {
            return b['VYMERA'] - a['VYMERA']; // vymera DESC
          }
          return aClicked ? -1 : 1; // clicked first
        })
        .map(x => this.getData(x, this.parAttrTranslate));

      this.busy = this.serverAppService.getLvInfo(telId).subscribe(lvInfo => {
        dataVl = lvInfo.vlastnici
          .sort((a: IVlastnik, b: IVlastnik) => {
            return (a.zemedelec ? 'ano' : 'ne').localeCompare(b.zemedelec ? 'ano' : 'ne') // zemedelec ASC
              || b.podil - a.podil; // podil DESC
          })
          .map(v => this.getData(v, this.vlAttrTranslate));

        this.featureInfoData.next({
          pars: dataPars,
          lv: dataLv,
          vl: dataVl,
          telId: telId,
          cena: lvInfo.cena?.cenaNabidkova,
          poznamka: lvInfo.cena?.poznamka,
          datum: lvInfo.cena?.createdAt,
          pracoviste: lvInfo.vlastnici.length >= 1 ? lvInfo.vlastnici[0].pracoviste : null,
          activeTab: featuresClickedPar.length > 0 ? 'par' : 'lv',
          clickedParIds: clickedPars,
        });
      }, () => this.toastrService.error('Nepodařilo se načíst informace pro daný bod v mapě.', 'Lokalizace dle souřadnic'));
    };
  }

  private getData(properties: any, translate: Map<string, ISortableLabelDefinition>): ISortableLabel[] {
    let data: ISortableLabel[] = [];

    for (const key of Object.keys(properties)) {
      if (!translate.has(key)) {
        continue;
      }

      const metadata = translate.get(key);
      const unit = !!properties[key] ? metadata.unit : null;
      let value = metadata.transformFunc == null
        ? properties[key]
        : metadata.transformFunc(properties[key]);
      if (unit == ' m<sup>2</sup>') {
        value = parseFloat(value).toLocaleString('cs-CZ');
      }
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
        valueWithUnit,
      });
    }

    const ku = data.find(x => x.id == 'KU');
    const kuKod = data.find(x => x.id == 'KATUZE_KOD');

    if (!!ku && !!kuKod) {
      ku.value = `${ku.value} (${kuKod.value})`;
      ku.valueWithUnit = ku.value;
      ku.code = parseInt(kuKod.value);
      data = data.filter(x => x != kuKod);
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
    return forkJoin([
      this.getFeatureGeoJson$('VFK:LV', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`),
      this.getFeatureGeoJson$('VFK:PAR', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`)
    ])
      .pipe(
        tap(resp => {
          const lvFeatures = this.localizeToFeature$(resp[0]);
          const parFeatures = (new GeoJSON()).readFeatures(resp[1]);
          this.getByFeatures(lvFeatures, parFeatures, []);
        }),
      );
  }

  private localizeByKu$(kuKod: number): Observable<any> {
    return this.getFeatureGeoJson$('VFK:KU', `KOD=${kuKod}`)
      .pipe(
        map(resp => this.localizeToFeature$(resp)),
      );
  }

  public localizeByPar$(kuKod: number, parcelKod: string): Observable<any> {
    return this.getFeatureGeoJson$('VFK:PAR', `PAR_CISLO='${parcelKod}' AND KATUZE_KOD=${kuKod}`)
      .pipe(
        map(resp => this.localizeToFeature$(resp)),
        switchMap((fClickedPars: Feature<Geometry>[]) => {
          const parProperties = fClickedPars[0].getProperties();
          const lvId = parProperties.LVID;
          return forkJoin([
            this.getFeatureGeoJson$('VFK:LV', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`),
            this.getFeatureGeoJson$('VFK:PAR', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`)
          ]).pipe(
            map(resp => [
              fClickedPars,
              new GeoJSON().readFeatures(resp[0]),
              new GeoJSON().readFeatures(resp[1])]))
        }),
        tap(([fClickedPars, fLv, fPar]) => {
          this.getByFeatures(fLv, fPar, fClickedPars);
        }),
      );
  }

  private localizeToFeature$(resp: any): Feature<Geometry>[] {
    this.sourceVector.clear();
    const features = (new GeoJSON()).readFeatures(resp);
    this.sourceVector.addFeatures(features);
    this.view.fit(this.sourceVector.getExtent());
    return features;
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
