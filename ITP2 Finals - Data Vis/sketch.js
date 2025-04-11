// Global variable to store the gallery object. The gallery object is a container for all the visualisations.
var gallery;
var currentApp;

function setup() {
  // Create a canvas to fill the content div from index.html.
  canvasContainer = select('#app');
  var c = createCanvas(1536, 864);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  // (1) nutrients extension:
  currentApp = new NutrientsTimeSeries();
  gallery.addVisual(currentApp); 
  // (2) bubbles extention:
  gallery.addVisual(new Food());
  // (3) risk of diabetes heatmap extension:
  gallery.addVisual(new DiabetesHeatmap());
}

function draw() {
  background(255);
  if (gallery.selectedVisual == null) {
    if(currentApp.loaded){
      gallery.selectThis("nutrients-timeseries");
    }
  }

  if(gallery.selectedVisual != null){
    gallery.selectedVisual.draw();
  }
}

