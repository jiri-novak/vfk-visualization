import { Injectable } from '@angular/core';

import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';

@Injectable()
export class OlStyles {
  public styles: any;

  constructor() {
    const image: CircleStyle = new CircleStyle({
      radius: 5,
      fill: null,
      stroke: new Stroke({ color: 'red', width: 1 })
    });

    this.styles = {
      Point: new Style({
        image
      }),
      LineString: new Style({
        stroke: new Stroke({
          color: 'green',
          width: 1
        })
      }),
      MultiLineString: new Style({
        stroke: new Stroke({
          color: 'green',
          width: 1
        })
      }),
      MultiPoint: new Style({
        image
      }),
      MultiPolygon: new Style({
        stroke: new Stroke({
          color: 'rgba(44,127,184, 1)',
          width: 5
        }),
        fill: new Fill({
          color: 'rgba(44,127,184, 0.5)'
        })
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      }),
      GeometryCollection: new Style({
        stroke: new Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new Fill({
          color: 'magenta'
        }),
        image: new CircleStyle({
          radius: 10,
          fill: null,
          stroke: new Stroke({
            color: 'magenta'
          })
        })
      }),
      Circle: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
    };
  }
}
