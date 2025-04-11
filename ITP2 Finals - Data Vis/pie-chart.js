function PieChart(x, y, diameter) {
  this.x = x;
  this.y = y;
  this.diameter = diameter;
  this.labelSpace = 30;
  this.currentHoverIndex = -1; 

  this.draw = function(data, labels, colours, title) {
    
    if (data.length == 0 || ![labels, colours].every(array => array.length == data.length)) {
      alert(`Data (length: ${data.length}), Labels (length: ${labels.length}), Colours (length: ${colours.length}) - Arrays must be the same length!`);
      return;
    }

    var total = data.reduce((acc, val) => acc + val, 0); 
    var angleStart = -HALF_PI; 

    var outerDiameter = this.diameter;
    var innerDiameter = this.diameter * 0.6;

    let d = dist(mouseX, mouseY, this.x, this.y);
    let mouseAngle = atan2(mouseY - this.y, mouseX - this.x);
    if (mouseAngle < -HALF_PI) {
      mouseAngle += TWO_PI;
    }

    for (let i = 0; i < data.length; i++) {
      let sliceAngle = (data[i] / total) * TWO_PI;
      let angleStop = angleStart + sliceAngle;

      if (d < outerDiameter / 2 && d > innerDiameter / 2 && mouseAngle >= angleStart && mouseAngle < angleStop) {
        this.currentHoverIndex = i;
      }

      let isHovered = (this.currentHoverIndex === i);
      let popOutDist = 20; 
      let popOutX = isHovered ? cos(angleStart + sliceAngle / 2) * popOutDist : 0;
      let popOutY = isHovered ? sin(angleStart + sliceAngle / 2) * popOutDist : 0;

      if (isHovered) {
        fill(lerpColor(color(colours[i % colours.length]), color(100), 0.5));
      } else {
        fill(colours[i % colours.length]);
      }

      arc(this.x + popOutX, this.y + popOutY, outerDiameter, outerDiameter, angleStart, angleStop, PIE);
      angleStart += sliceAngle;
    }

    fill(255);
    ellipse(this.x, this.y, innerDiameter, innerDiameter);

    fill(0);
    textAlign(CENTER);
    textSize(30);
    text(title, this.x, this.y - 30 - outerDiameter / 2 - 20);

    if (this.currentHoverIndex !== -1) {
      let label = labels[this.currentHoverIndex];
      let value = data[this.currentHoverIndex];
      textSize(20);
      fill(0);
      text(`${label}: ${value}`, mouseX, mouseY - 10);
    }

    this.drawLegend(labels, colours);
  };

  this.drawLegend = function(labels, colours) {
    fill(0);
     textSize(16);
     textAlign(LEFT, CENTER);
     for (let i = 0; i < labels.length; i++) {
       fill(colours[i % colours.length]);
       rect(this.x + this.diameter / 2 + 10, this.y + this.labelSpace * i - this.diameter / 3, 10, 10);
       text(labels[i], this.x + this.diameter / 2 + 25, this.y + this.labelSpace * i - this.diameter / 3 + 5);
     }
  };
}
