function DiabetesHeatmap() {
  this.name = "Diabetes Correlation Heatmap";
  this.id = "diabetes-correlation-heatmap";
  this.loaded = false;

  var featureList = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin",
    "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"
  ];

  var featureColors = [];
  var maxValue = 1;  // Correlation values range between -1 and 1
  var minValue = -1;

  var legendX = 50;
  var legendY = height - 150;
  var legendWidth = 200;
  var legendHeight = 20;
  var legendSteps = 100;

  var axisMargin = 170;
  var boxWidth;
  var boxHeight;
  var correlations = [];

  this.preload = function () {
    var self = this;
    this.data = loadTable("./data/health/diabetes.csv", "csv", "header",
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    // Generate unique colors for correlation (blue for negative, red for positive)
    featureColors = [color(0, 0, 255), color(255, 255, 255), color(255, 0, 0)];

    // Compute correlation matrix
    var data = [];
    for (var i = 0; i < featureList.length; i++) {
      var values = this.data.getColumn(featureList[i]);
      values = values.map(Number);
      data.push(values);
    }

    // Calculate pairwise correlations
    for (var i = 0; i < featureList.length - 1; i++) {
      correlations[i] = [];
      for (var j = 0; j < featureList.length - 1; j++) {
        if (i === j) {
          correlations[i][j] = 1;  // Correlation with itself is 1
        } 
        else {
          correlations[i][j] = this.calculateCorrelation(data[i], data[j]);
        }
      }
    }
  };

  this.calculateCorrelation = function (x, y) {
    var meanX = x.reduce((a, b) => a + b) / x.length;
    var meanY = y.reduce((a, b) => a + b) / y.length;
    var num = 0;
    var denomX = 0;
    var denomY = 0;
    for (var i = 0; i < x.length; i++) {
      num += (x[i] - meanX) * (y[i] - meanY);
      denomX += Math.pow(x[i] - meanX, 2);
      denomY += Math.pow(y[i] - meanY, 2);
    }
    return num / Math.sqrt(denomX * denomY);
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    clear();

    boxWidth = (width - 2 * axisMargin) / featureList.length;
    boxHeight = (height - 2 * axisMargin) / featureList.length;

    let hoveredCell = null;

    for (var i = 0; i < correlations.length; i++) {
      for (var j = 0; j < correlations[i].length; j++) {
        // Determine the color based on correlation value
        var colorValue = map(correlations[i][j], minValue, maxValue, 0, 1);
        var c = lerpColor(featureColors[0], featureColors[2], colorValue);
        fill(c);

        // Draw the cell
        var x = axisMargin + i * boxWidth;
        var y = axisMargin + j * boxHeight;
        rect(x, y, boxWidth, boxHeight);

        // Display the correlation value inside the cell
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(16);
        text(correlations[i][j].toFixed(2), x + boxWidth / 2, y + boxHeight / 2);

        // Check if mouse is over this cell
        if (mouseX >= x && mouseX <= x + boxWidth && mouseY >= y && mouseY <= y + boxHeight) {
          hoveredCell = { x, y, correlation: correlations[i][j], featureX: featureList[i], featureY: featureList[j] };
        }
      }
    }

    // Draw x and y axes
    stroke(0);
    line(axisMargin, axisMargin, axisMargin, height - axisMargin);  // y-axis
    line(axisMargin, height - axisMargin, width - axisMargin, height - axisMargin);  // x-axis

    // Draw x-axis labels
    textAlign(CENTER, CENTER);
    textSize(12);
    fill(0);
    for (var i = 0; i < featureList.length; i++) {
      text(featureList[i], axisMargin + i * boxWidth + boxWidth / 2, height - axisMargin + 20);
    }

    // Draw y-axis labels
    textAlign(RIGHT, CENTER);
    for (var j = 0; j < featureList.length; j++) {
      text(featureList[j], axisMargin - 20, axisMargin + j * boxHeight + boxHeight / 2);
    }

    // Draw title
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(0);
    text("Diabetes Correlation Heatmap", width / 2, 30);

    this.drawLegend();

    // Draw the tooltip if hovering over a cell
    if (hoveredCell) {
      this.drawTooltip(hoveredCell);
    }
  };

  this.drawTooltip = function (hoveredCell) {
    // Determine the risk level based on correlation value
    var risk = "Low Risk";
    if (hoveredCell.correlation > 0.6) {
      risk = "High Risk";
    } 
    else if (hoveredCell.correlation > 0.3) {
      risk = "Moderate Risk";
    }

    // Tooltip background
    fill(255);
    stroke(0);
    rect(mouseX + 10, mouseY + 10, 200, 80);

    // Tooltip text
    fill(0);
    noStroke();
    textSize(12);
    textAlign(LEFT, TOP);
    text("Feature X: " + hoveredCell.featureX, mouseX + 15, mouseY + 15);
    text("Feature Y: " + hoveredCell.featureY, mouseX + 15, mouseY + 30);
    text("Correlation: " + hoveredCell.correlation.toFixed(2), mouseX + 15, mouseY + 45);
    text("Risk: " + risk, mouseX + 15, mouseY + 60);
  };

  this.drawLegend = function () {
    var legendStepWidth = legendWidth / legendSteps;

    for (var i = 0; i < legendSteps; i++) {
      var colorValue = map(i, 0, legendSteps, 0, 1);
      var c = lerpColor(featureColors[0], featureColors[2], colorValue);
      fill(c);
      noStroke();
      rect(legendX + i * legendStepWidth, legendY+50, legendStepWidth, legendHeight);
    }

    stroke(0);
    noFill();
    rect(legendX, legendY+50, legendWidth, legendHeight);

    fill(0);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(minValue.toFixed(2), legendX - 30, (legendY+50) + legendHeight / 2);
    text(maxValue.toFixed(2), legendX + legendWidth + 10, (legendY+50) + legendHeight / 2);
  };
}
