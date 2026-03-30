declare module 'leaflet-ant-path' {
  import * as L from 'leaflet';

  interface AntPathOptions extends L.PolylineOptions {
    delay?: number;
    dashArray?: [number, number];
    weight?: number;
    color?: string;
    pulseColor?: string;
    paused?: boolean;
    reverse?: boolean;
    hardwareAccelerated?: boolean;
  }

  function antPath(
    latlngs: L.LatLngExpression[] | L.LatLngExpression[][],
    options?: AntPathOptions
  ): L.Polyline;

  export { antPath };
}