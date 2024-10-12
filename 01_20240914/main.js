

const map = new maplibregl.Map({
  container: 'map',
  center: [138.7275, 35.36083333], // 中心座標
  zoom: 8, // ズームレベル
  style: {
    // スタイル仕様のバージョン番号。8を指定する
    version: 8,
    // データソース
    sources: {
      standard: {
        type: 'raster',
        tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: "地図の出典：<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>",
      },
      //トラックデータ
      track :{
        type: 'geojson',
        data: './data/track.geojson'
      },
    },
    // 表示するレイヤ
    layers: [
      {
        id: 'standard-layer',
        type: 'raster',
        source: 'standard',
        layout: {
          visibility: 'visible',
        },
      },
      {
        id: 'track',
        type: 'line',
        source: 'track',
        paint: {
          'line-color': '#5AFF19',
          'line-width': 5.0,
        },
        layout: {
          visibility: 'visible',
        },
      },
    ],
  },
});

// スケール表示
map.addControl(new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: 'metric'
}));
// コントロール関係表示
map.addControl(new maplibregl.NavigationControl());

map.on('load', async () => {
  const iconImage = await map.loadImage('./img/camera.png');
  map.addImage('camera_icon', iconImage.data);

  map.addSource('picture_point', {
    type: 'geojson',
    data: './data/img_info.geojson',
  });
  map.addLayer({
    id: 'photo_point',
    type: 'symbol',
    source: 'picture_point',
    layout: {
      'icon-image': 'camera_icon',
      'icon-size': 1.0,
    },
  });
});

// 山頂のアイコンをクリックした時の挙動
// map.on()の２つ目の引数はid
map.on('click', 'photo_point', (e) => {
  var coordinates = e.features[0].geometry.coordinates.slice();
  var altitude = e.features[0].properties.altitude;
  var path = e.features[0].properties.name;
  var datetime = e.features[0].properties.datetime;
 
  popup_str = "日時：" + datetime + "<br>標高：" + altitude + " [m]<br><img src=" + path + " height='300' >";

  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }
  // ポップアップを表示する
  new maplibregl.Popup({
    offset: 10, // ポップアップの位置
    closeButton: false, // 閉じるボタンの表示
  })
    .setLngLat(coordinates)
    .setHTML(popup_str)
    .addTo(map);
});
