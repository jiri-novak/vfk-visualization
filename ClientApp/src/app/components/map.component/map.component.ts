import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import Feature from 'ol/Feature';
import View from 'ol/View';
import { defaults } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import Map from 'ol/Map';
import Tile from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import Projection from 'ol/proj/Projection';
import MousePosition from 'ol/control/MousePosition';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { METERS_PER_UNIT, transform } from 'ol/proj';
import LayerSwitcher from 'ol-layerswitcher';

import { OlStyles } from 'src/app/services/ol.styling.service';
import { ILocalizationByKu, IFeatureInfoData, IKeyValue } from '../models/models';
import { stringify } from '@angular/compiler/src/util';

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
  }

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

  map: Map;
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

    this.map = new Map({
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

    this.map.on('singleclick', function (evt) {
      const view = this.getView();
      const viewResolution = view.getResolution();
      const source = self.sourceVfk;
      const url = source.getGetFeatureInfoUrl(evt.coordinate, viewResolution, view.getProjection(),
        { INFO_FORMAT: 'application/json', FEATURE_COUNT: 50 });

      self.http.get(url).subscribe(resp => {
        const features = (new GeoJSON()).readFeatures(resp);

        const lvData: IKeyValue[] = [];
        const parData: IKeyValue[] = [];

        for (const feature of features) {
          const properties = feature.getProperties();
          const id: string = feature.getId();

          for (const key of Object.keys(properties)) {
            if (key === 'geometry') {
              continue;
            }

            if (!!properties[key]) {
              if (id.startsWith('LV')) {
                lvData.push({ key, value: properties[key]});
              } else {
                parData.push({ key, value: properties[key]});
              }
            }
          }
        }

        self.featureInfoData.next({ par: parData, lv: lvData });
      });
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

  private localizeByTel$(telId: number): Observable<any> {
    return this.getFeatureGeoJson$('VFK:LV', `TEL_ID=${telId}`)
      .pipe(
        map(resp => this.localizeToFeature$(resp))
      );
  }

  private localizeByLv$(kuKod: number, lvId: number): Observable<any> {
    return this.getFeatureGeoJson$('VFK:LV', `LVID=${lvId} AND KATUZE_KOD=${kuKod}`)
      .pipe(
        map(resp => this.localizeToFeature$(resp))
      );
  }

  private localizeByKu$(kuKod: number): Observable<any> {
    return this.getFeatureGeoJson$('VFK:KATUZE_P', `KOD=${kuKod}`)
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
    return this.http.get('http://localhost:8080/geoserver/VFK/ows', {
      params: {
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        outputFormat: 'application/json',
        typeName,
        cql_filter: cqlFilter
      }
    });
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
