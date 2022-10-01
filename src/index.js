import "./styles.css";
const L = window.L;
let leavingArray;
let comingArray;

if (document.readyState !== "loading") {
  console.log("Document is ready!");
  startFunction();
} else {
  document.addEventListener("DOMContentLoaded", function (event) {
    event.preventDefault();
    console.log("Document is ready after waiting!");
    startFunction();
  });
}

function $(x) {
  return document.getElementById(x);
}

async function fetchData(url) {
  let data;
  console.log("fethcing");
  data = await fetch(url)
    .then((response) => response.json())
    .catch((error) => {
      console.log(error);
    });

  return data;
}

async function showMapD(data) {
  /*let map = L.map("map", {
    minZoom: -3
  });*/

  let map = L.map("map");
  let geoJson = L.geoJson(data, {
    onEachFeature: getFeature,
    style: getStyle
  }).addTo(map);
  let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  let baseMaps = {
    OpenStreetMap: osm
    //,"Google Maps": google
  };

  let overlayMaps = {
    Finland: geoJson
  };

  let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

  map.fitBounds(geoJson.getBounds());
}

const getColor = (leaving, coming) => {
  var x = Math.pow(coming / leaving, 3) * 60;
  if (x > 120) {
    x = 120;
  }

  return "hsl(" + x + ", 75%, 50%)";
};

const getKuntaValue = (kuntaID) => {
  var returnArray = [];
  var value1 =
    leavingArray.dataset.dimension["Lähtöalue"].category.index[kuntaID];
  //console.log(value1);
  if (leavingArray.dataset.value[value1]) {
    var color = getColor(
      leavingArray.dataset.value[value1],
      comingArray.dataset.value[value1]
    );
    return [
      leavingArray.dataset.value[value1],
      comingArray.dataset.value[value1],
      color
    ];
  }
  return returnArray;
};

/*data[0].dataset.value,
        data[1].dataset.value,
        data[0].dataset.dimension.Lähtöalue.category.index */

function testFileFunction() {
  let url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  fetchData(url)
    .then((res) => {
      showMapD(res);
    })
    .catch((err) => {
      return Promise.reject();
    });
}

async function startFunction() {
  let negativeUrl =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  let positiveUrl =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  Promise.all([fetch(negativeUrl), fetch(positiveUrl)])
    .then((responses) =>
      Promise.all(responses.map((response) => response.json()))
    )
    .then((data) => {
      leavingArray = data[0];
      comingArray = data[1];
    })
    .then((data) => {
      //console.log(leavingArray)
      testFileFunction();
    })
    .catch((err) => {
      return Promise.reject();
    });
}

const getFeature = (feature, layer) => {
  if (!feature.id) return;
  const nimi = feature.properties.nimi;

  let data = getKuntaValue("KU" + feature.properties.kunta);
  layer.bindPopup(
    `<ul>
            <li>Name:${nimi}</li>
            <li>losing:${data[0]} </li>
            <li>gaining:${data[1]}</li>
        </ul>`
  );
  //${lutBuildings[id - 1].name - how to data in string
  layer.bindTooltip(nimi);
};
const getStyle = (feature) => {
  let id = feature.id;
  //console.log(dataArray[index][2]);
  return {
    color: getKuntaValue("KU" + feature.properties.kunta)[2]
  };
};
/*var bb = new Blob([JSON.stringify(data)], { type: "text/json" });
  var a = document.createElement("a");
  a.download = "data.json";
  a.href = window.URL.createObjectURL(bb);
  a.click();
  A WAY TO SAVE DATA TO DEVICE */

/*{
  "type": "FeatureCollection",
  "features": [
	{"type": "Feature",
  	"geometry": {"type": "Point",
    	"coordinates": [102.0, 0.5]
  	},
  	"properties": {"prop0": "value0"
  	}
	},
	{"type": "Feature",
  	"geometry": {"type": "LineString",
    	"coordinates": [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
  	},
  		"properties": {"prop0": "value0",
    	"prop1": 0.0
  	}
	}
  ]
}
*/
