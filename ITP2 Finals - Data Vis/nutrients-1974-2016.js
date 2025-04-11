function NutrientsTimeSeries() {
    // Name for the visualization to appear in the menu bar
    this.name = 'Nutrients: 1974-2016';

    // Unique ID for the visualization
    this.id = 'nutrients-timeseries';

    // Title of the visualization
    this.title = 'Nutrients: 1974-2016';

    // Names for each axis
    this.xAxisLabel = 'year';
    this.yAxisLabel = '%';

    this.colors = [];
    this.clickedPoints = []; 

    var marginSize = 35;

    // Layout object to store all common plot layout parameters and methods
    this.layout = {
        marginSize: marginSize,
        // Locations of margin positions. Left and bottom have double margin size due to axis and tick labels
        leftMargin: marginSize * 2,
        rightMargin: (width - 200) - marginSize,
        topMargin: marginSize,
        bottomMargin: (height - 200) - marginSize * 2,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid
        grid: true,
        // Number of axis tick labels to draw so that they are not drawn on top of one another
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    // Property to represent whether data has been loaded
    this.loaded = false;

    // Preload the data: this function is called automatically by the gallery when a visualization is added
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/food/nutrients74-16.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            }
        );
    };

    this.setup = function() {
        textSize(16);

        // Set min and max years: assumes data is sorted by date
        this.startYear = Number(this.data.columns[1]);
        this.endYear = Number(this.data.columns[this.data.columns.length - 1]);

        for (var i = 0; i < this.data.getRowCount(); i++) {
            this.colors.push(color(random(0, 255), random(0, 255), random(0, 255)));
        }

        // Set the min and max percentage, do a dynamic find min and max in the data source
        this.minPercentage = 80;
        this.maxPercentage = 400;

        // Create sliders to control start and end years, default to visualize full range
        this.startSlider = createSlider(this.startYear, this.endYear - 1, this.startYear, 1);
        this.startSlider.position(400, 700);
        this.endSlider = createSlider(this.startYear + 1, this.endYear, this.endYear, 1);
        this.endSlider.position(600, 700);

        // Dropdown menu to select the type of nutrient
        this.nutrientSelector = createSelect();
        this.nutrientSelector.position(450, 780);
        this.nutrientSelector.option('All Nutrients');
        for (var i = 0; i < this.data.getRowCount(); i++) {
            this.nutrientSelector.option(this.data.getString(i, 0));
        }

        // Create a clear button to clear the data table
        this.clearButton = createButton('Clear Table');
        this.clearButton.position(1110, 870);
        this.clearButton.mousePressed(this.clearTable.bind(this));
    }; // end of this.setup function

    // clearing of the data inside table which is stored inside the declared array "clickedPoints"
    this.clearTable = function() {
        this.clickedPoints = []; 
    };

    this.destroy = function() {
        this.startSlider.remove();
        this.endSlider.remove();
        this.nutrientSelector.remove();
        this.clearButton.remove(); 
    };

    this.draw = function() {
        if (!this.loaded) {
            return;
        }

        // Prevent the slider ranges from overlapping
        if (this.startSlider.value() >= this.endSlider.value()) {
            this.startSlider.value(this.endSlider.value() - 1);
        }

        this.startYear = this.startSlider.value();
        this.endYear = this.endSlider.value();

        this.drawTitle();
        this.drawYaxisTickLabels(this.minPercentage, this.maxPercentage, this.layout, this.mapNutrientsToHeight.bind(this), 0);
        drawAxis(this.layout);
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

        var numYears = this.endYear - this.startYear;

        // declaring the hover feature
        this.hoverIndicator = null;

        for (var i = 0; i < this.data.getRowCount(); i++) {
            var row = this.data.getRow(i);
            var previous = null;
            var title = row.getString(0);

            if (this.nutrientSelector.value() !== 'All Nutrients' && this.nutrientSelector.value() !== title) {
                continue;
            }

            for (var j = 1; j <= numYears; j++) {
                var current = {
                    'year': this.startYear + j - 1,
                    'percentage': row.getNum(j)
                };

                if (previous != null) {
                    stroke(this.colors[i]);
                    line(this.mapYearToWidth(previous.year),
                        this.mapNutrientsToHeight(previous.percentage),
                        this.mapYearToWidth(current.year),
                        this.mapNutrientsToHeight(current.percentage));

                    var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
                    if (j % xLabelSkip == 0) {
                        drawXAxisTickLabel(previous.year, this.layout, this.mapYearToWidth.bind(this));
                    }
                }

                var x = this.mapYearToWidth(current.year);
                var y = this.mapNutrientsToHeight(current.percentage);
                fill(this.colors[i]);
                noStroke();
                ellipse(x, y, 5, 5);

                if (dist(mouseX, mouseY, x, y) < 5) {
                    this.hoverIndicator = {
                        year: current.year,
                        percentage: current.percentage,
                        nutrient: title,
                        x: x,
                        y: y
                    };
                }

                if (this.hoverIndicator && mouseIsPressed) {
                    var pointExists = this.clickedPoints.some(function(point) {
                        return point.year === this.hoverIndicator.year &&
                               point.nutrient === this.hoverIndicator.nutrient;
                    }, this);

                    if (!pointExists) {
                        this.clickedPoints.push(this.hoverIndicator);
                    }
                }

                if (j == numYears) {
                    this.makeLegendItem(title, i, this.colors[i]);
                }
                previous = current;
            }
        }

        if (this.hoverIndicator) {
            this.drawTooltip(this.hoverIndicator);
        }

        // calling of the functions in the 'draw' function
        this.drawYearBesidesMouse();
        this.drawDataTable();
    }; // end of this.draw function

    // Helper functions
    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
    };

    this.mapYearToWidth = function(value) {
        return map(value, this.startYear, this.endYear, this.layout.leftMargin, this.layout.rightMargin);
    };

    this.mapNutrientsToHeight = function(value) {
        return map(value, this.minPercentage, this.maxPercentage, this.layout.bottomMargin, this.layout.topMargin);
    };

    this.mapMouseXToYear = function(value) {
        return int(map(value, this.layout.leftMargin, this.layout.rightMargin, this.startYear, this.endYear));
    };

    // creating the function to display the year at any point in the graph
    this.drawYearBesidesMouse = function() {
        if (this.hoverIndicator) return;
        var year = this.mapMouseXToYear(mouseX);
        fill(0);
        noStroke();
        text(year, mouseX, mouseY);
    };

    // creating of the legend 
    this.makeLegendItem = function(label, i, color) {
        var boxWidth = 50;
        var boxHeight = 30;
        var x = 1300;
        var y = 200 + (boxHeight + 2) * i;

        noStroke();
        fill(color);
        rect(x, y, boxWidth, boxHeight);

        fill('black');
        noStroke();
        textAlign('left', 'center');
        textSize(12);
        text(label, x + boxWidth + 10, y + boxHeight / 2);
    };

    this.drawYaxisTickLabels = function(minValue, maxValue, layout, mapFunction) {
        var step = (maxValue - minValue) / layout.numYTickLabels;
        for (var i = 0; i <= layout.numYTickLabels; i++) {
            var value = minValue + (i * step);
            var y = mapFunction(value);
            fill(0);
            noStroke();
            textAlign('right', 'center');
            text(value.toFixed(0) + '%', layout.leftMargin - layout.pad, y);
        }
    };

    // drawing of the hover feature display box
    this.drawTooltip = function(point) {
        fill(255);
        stroke(0);
        rect(point.x + 10, point.y - 25, 350, 60);
        fill(0);
        noStroke();
        textAlign(LEFT, TOP);
        text('Year: ' + point.year + '\n' + 'Percentage: ' + point.percentage.toFixed(2) + '%' + '\n' + 'Nutrient: ' + point.nutrient, point.x + 15, point.y - 20);
    };

    // drawing of the table to display the clicked and stored data at keypoints
    this.drawDataTable = function() {
        var tableX = 800;
        var tableY = 650;

        fill(255);
        stroke(0);
        rect(tableX, tableY, 500, 200);

        fill(0);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(12);

        var yOffset = 0;
        for (var i = 0; i < this.clickedPoints.length; i++) {
            var point = this.clickedPoints[i];
            text('Year: ' + point.year + ' | Percentage: ' + point.percentage.toFixed(2) + '%' + ' | Nutrient: ' + point.nutrient, tableX + 10, tableY + 10 + yOffset);
            yOffset += 20;
        }
    };
}
