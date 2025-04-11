function Food(){ 
    // Name for the visualisation to appear in the menu bar
    this.name = 'Food';

    // Each visualisation must have a unique ID with no special characters
    this.id = 'food';

    // Property to represent whether data has been loaded
    this.loaded = false;

    var bubbles = [];
    var maxAmt;
    var years = [];
    var yearDropdown; 
    var foodDropdown; 
    var allFoodTypes = [];
    var legendItems = [];

    // Preload the data. This function is called automatically by the gallery when a visualisation is added
    this.preload = function(){
        var self = this;
        this.data = loadTable(
        './data/food/foodData.csv', 'csv', 'header',
        // Callback function to set the value this.loaded to true
        function(table){
            self.loaded = true;
        });
        console.log(this.data.getRows())
    };

    // This is called automatically when the user clicks on the menu
    this.setup = function(){
        this.data_setup();
    };

    // This is called automatically when the user clicks on another menu button
    this.destroy = function(){
        // Clear away the dropdowns
        if (yearDropdown) yearDropdown.remove();
        if (foodDropdown) foodDropdown.remove();
    };
    
    this.draw = function(){
        if(!this.loaded){
            console.log('Data not yet loaded')
            return;
        }
        translate(width / 2, height / 4);
        for(var i = 0; i < bubbles.length; i++){
            bubbles[i].update(bubbles);
            bubbles[i].draw();
        }

        // Draw the legend
        this.drawLegend();
    }; // end of "this.draw" function

    this.data_setup = function(){
        bubbles = [];
        maxAmt = 0;
        years = [];
        allFoodTypes = [];
        legendItems = [];
        
        var rows = this.data.getRows();
        var numColumns = this.data.getColumnCount();

        // Populate years array and create dropdown for year selection
        yearDropdown = createSelect();
        yearDropdown.position(400, 600);
        yearDropdown.option('Select Year');
        for(var i = 5; i < numColumns; i++){
            var y = this.data.columns[i];
            years.push(y);
            yearDropdown.option(y);
        }
        yearDropdown.changed(() => changeYear(yearDropdown.value(), years, bubbles));

        // Populate all food types array and create dropdown for food type selection
        foodDropdown = createSelect();
        foodDropdown.position(800, 600);
        foodDropdown.option('All Foods');
        for(var i = 0; i < rows.length; i++){
            if(rows[i].get(0) != ""){
                allFoodTypes.push(rows[i].get(0));
                foodDropdown.option(rows[i].get(0));
            }
        }
        foodDropdown.changed(() => filterFoodType(foodDropdown.value()));

        // Create bubbles for each food type and populate their data
        for(var i = 0; i < rows.length; i++){
            if(rows[i].get(0) != ""){
                var b = new Bubble(rows[i].get(0));
                for(var j = 5; j < numColumns; j++){
                    if(rows[i].get(j) != ""){
                        var n = rows[i].getNum(j);
                        if(n > maxAmt) maxAmt = n;
                        b.data.push(n);
                    } else {
                        b.data.push(0);
                    }
                }
                bubbles.push(b);
                legendItems.push({name: rows[i].get(0), color: b.color}); // Add food type to legend
            }
        }
        for(var i = 0; i < bubbles.length; i++){
            bubbles[i].setMaxAmt(maxAmt);
            bubbles[i].setData(0); // Set to the first year data
        }
    }; // end of "this.data_setup" function

    // Function to change the year being displayed; filter function
    function changeYear(year, _years, _bubbles){
        var y = _years.indexOf(year);
        // Set the selected year for all the bubbles
        for(var i = 0; i < _bubbles.length; i++){
            _bubbles[i].setData(y);
        }
    }

    // Function to filter bubbles based on food type: filter function
    function filterFoodType(foodType) {
        if (foodType === 'All Foods') {
            bubbles.forEach(b => b.show = true);
        } else {
            bubbles.forEach(b => b.show = (b.name === foodType));
        }
    }

    // Function to draw the legend
    this.drawLegend = function(){
        let legendX = -width / 2 + 50; 
        let legendY = -height / 4 + 50; 
        let spacing = 20;

        textSize(12);
        fill(0);
        textAlign(LEFT, CENTER);

        for(let i = 0; i < legendItems.length; i++){
            let item = legendItems[i];
            fill(item.color);
            ellipse(legendX, legendY + i * spacing, 10, 10); 
            fill(0);
            text(item.name, legendX + 15, legendY + i * spacing); 
        }
    };
} // end of function
