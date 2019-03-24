import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
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
import { IFeatureInfoData, ISortableLabel, ISortableLabelDefinition, IValue } from '../models/models';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @ViewChild('location') locationRef: ElementRef;
  @ViewChild('map') mapRef: ElementRef;
  @ViewChild('scale') scaleRef: ElementRef;

  @Output() featureInfoData: EventEmitter<IFeatureInfoData> = new EventEmitter<IFeatureInfoData>();

  constructor(private http: HttpClient, private olStylingService: OlStyles) {
    this.lvAttrTranslate = new Map([
      ['CENA_M2', { label: 'nabídková cena / m<sup>2</sup>', order: 1, unit: ' Kč' }],
      ['OBEC', { label: 'obec', order: 2, unit: '' }],
      ['KU', { label: 'kú', order: 3, unit: '' }],
      ['LVID', { label: 'číslo', order: 4, unit: '' }],
      ['VYMERA', { label: 'výměra', order: 5, unit: ' m<sup>2</sup>' }],
      ['V_BPEJ', { label: 'výměra BPEJ', order: 6, unit: ' m<sup>2</sup>' }],
      ['ORNA', { label: 'orná', order: 7, unit: ' m<sup>2</sup>' }],
      ['TTP', { label: 'ttp', order: 8, unit: ' m<sup>2</sup>' }],
      ['PRU_BPEJ', { label: 'cena BPEJ/m<sup>2</sup>', order: 9, unit: ' Kč' }],
      ['PARCEL', { label: 'poč. parcel', order: 10, unit: '' }],
      ['V_LPIS_PR', { label: 'LPIS', order: 11, unit: ' %' }],
      ['TYP_VL', { label: 'typ vl.', order: 12, unit: '' }],
      ['P_VL', { label: 'poč. vl.', order: 13, unit: '' }],
      ['KATUZE_KOD', { label: 'kód k.ú.', order: 14, unit: '' }],
    ]);

    this.parAttrTranslate = new Map([
      ['KU', { label: 'ku', order: 1, unit: '' }],
      ['KATUZE_KOD', { label: 'kód k.ú.', order: 2, unit: '' }],
      ['LVID', { label: 'číslo LV', order: 3, unit: '' }],
      ['PAR_CISLO', { label: 'číslo', order: 4, unit: '' }],
      ['DRUH', { label: 'druh', order: 5, unit: '' }],
      ['VYUZITI', { label: 'využití', order: 6, unit: '' }],
      ['VYMERA', { label: 'výměra', order: 7, unit: ' m<sup>2</sup>' }],
      ['V_LV_PR', { label: 'výměra z LV', order: 8, unit: ' %' }],
    ]);
  }

  private lvAttrTranslate: Map<string, ISortableLabelDefinition>;
  private parAttrTranslate: Map<string, ISortableLabelDefinition>;

  epsg5514Ne: Projection;
  epsg5514: Projection;

  sourceVector: VectorSource;
  sourceVfk: TileWMS;
  sourceOrtofoto: TileWMS;
  sourceZm10: TileWMS;
  sourceKm: TileWMS;

  layerVector: VectorLayer;
  layerVfk: Tile;
  layerOrtofoto: Tile;
  layerZm10: Tile;
  layerKm: Tile;

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

    this.layerVector = new VectorLayer({
      zIndex: 11,
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

      forkJoin(
        self.getFeatureByBboxGeoJson$('VFK:LV', bbox, 1),
        self.getFeatureByBboxGeoJson$('VFK:PAR', bbox, 1)
      ).subscribe(([respLv, respPar]) => {
        const featuresLv: Array<Feature> = (new GeoJSON()).readFeatures(respLv);
        const featuresPar: Array<Feature> = (new GeoJSON()).readFeatures(respPar);

        let dataLv: IValue[] = [];
        let dataPar: IValue[] = [];

        self.sourceVector.clear();

        if (featuresLv.length > 0) {
          self.sourceVector.addFeature(featuresLv[0]);
          dataLv = self.getData(featuresLv, self.lvAttrTranslate);
        }

        if (featuresPar.length > 0) {
          dataPar = self.getData(featuresPar, self.parAttrTranslate);
        }

        self.featureInfoData.next({ par: dataPar, lv: dataLv });
      });
    });
  }

  private getData(features: Array<Feature>, translate: Map<string, ISortableLabelDefinition>): IValue[] {
    const data: ISortableLabel[] = [];

    if (features.length > 0) {
      const properties = features[0].getProperties();
      for (const key of Object.keys(properties)) {
        if (!translate.has(key)) {
          continue;
        }

        const isEmpty = !properties[key];
        const d = translate.get(key);
        data.push({ id: key, label: d.label, value: properties[key], unit: isEmpty ? null : d.unit, order: d.order });
      }
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

    return data.map(x => {
      return { key: x.label, valueWithUnit: !!x.value || !!x.unit ? `${x.value} ${x.unit}` : null };
    });
  }

  public localizeByLv(event: any) {
    this.localizeByLv$(event.katuzeKod, event.lvId).subscribe();
  }

  public localizeByKu(event: any) {
    this.localizeByKu$(event.katuzeKod).subscribe();
  }

  public localizeByPar(event: any) {
    this.localizeByPar$(event.katuzeKod, event.parCislo).subscribe();
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

  private getLegend$(): Observable<any> {
    return this.http.get('http://localhost:8080/geoserver/VFK/wms', {
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetLegendGraphic',
        FORMAT: 'image/png',
        WIDTH: '30',
        HEIGHT: '30',
        format_options: 'layout:legend&legend_options=countMatched:true;fontAntiAliasing:true'
      }
    });
  }
}
