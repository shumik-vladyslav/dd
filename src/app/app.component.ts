import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export class Shape {
  public style: any;

  constructor(public x: number, y: number) {
    this.style = { 'fill': 'white', 'stroke': 'black', 'stroke-width': '2', 'fill-opacity': '0.95' };
  }
}

export class Circle extends Shape {
  constructor(public x: number, public y: number, public r: number) {
    super(x, y);
  }
}

declare var d3;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  vis;
  dragType;
  menuOptions = {
    hide: true,
    x: "0px",
    y: "0px"
  };
  removeId;
  data = [];

  constructor(private sanitizer: DomSanitizer) {
    this.data = JSON.parse(localStorage.getItem("data"));
    this.generateDownloadJsonUri()
  }

  ngOnInit() {
    this.menuInit();
    this.vis = d3.select("#graph")
      .append("svg");
    var w = 900,
      h = 400;
    this.vis.attr("width", w)
      .attr("height", h);
    this.vis
      .select("#graph")
    this.drow();
    this.drowInfo();

    this.vis.append("svg:defs").append("svg:marker")
    .attr("id", "triangle")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("markerUnits","userSpaceOnUse")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "black");
    
  }

  drowInfo() {
    document.getElementById("close").addEventListener('click', ev => {
      this.removeAll();
      this.data.splice(this.removeId, 1);
      this.menuOptions.hide = true;
      this.drow();
    }, false);

    document.getElementById("circle-info").addEventListener('click', ev => {
      this.removeAll();
      console.log(this.removeId)
      this.data.splice(+this.removeId + 1, 0, { type: 'circle', x: this.data[this.removeId].x + 100, y: this.data[this.removeId].y });
      this.menuOptions.hide = true;
      this.drow();
    }, false);
    document.getElementById("polygon-info").addEventListener('click', ev => {
      this.removeAll();
      this.data.splice(+this.removeId + 1, 0, { type: 'polygon', x: this.data[this.removeId].x + 100, y: this.data[this.removeId].y });
      this.menuOptions.hide = true;
      this.drow();
    }, false);
    document.getElementById("rect-info").addEventListener('click', ev => {
      this.removeAll();
      this.data.splice(+this.removeId + 1, 0, { type: 'rect', x: this.data[this.removeId].x + 100, y: this.data[this.removeId].y });
      this.menuOptions.hide = true;
      this.drow();
    }, false);
  }

  menuInit() {
    document.getElementById("circle").addEventListener('dragstart', ev => {
      this.dragType = "circle";
    }, false);
    document.getElementById("polygon").addEventListener('dragstart', ev => {
      this.dragType = "polygon";
    }, false);
    document.getElementById("rect").addEventListener('dragstart', ev => {
      this.dragType = "rect";
    }, false);

    document.addEventListener("dragover", function (event) {
      event.preventDefault();
    });
    document.getElementById("graph").addEventListener('drop', ev => {
      ev.preventDefault();
      this.data.push({ type: this.dragType, x: ev.offsetX, y: ev.offsetY });
      this.drow();
    }, false)
  }

  drow() {
    this.drowLines();

    this.data.forEach((element, index, arr) => {
      switch (element.type) {
        case 'circle':
          this.vis
            .append("svg:circle")
            .attr("class", "nodes circle-style")
            .attr("id", index)
            .attr("cx", element.x)
            .attr("cy", element.y)
            .attr("r", "25px")
            .attr("fill", "black")
            .on("click", (d, i, s) => {
              this.menuOptions.x = +s[0].attributes.cx.value + 35 + "px";
              this.menuOptions.y = +s[0].attributes.cy.value + -20 + "px";
              this.removeId = s[0].id;
              this.menuOptions.hide = false;
              d3.event.stopPropagation();
            })
            .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
          break;
        case 'polygon':
          this.vis
            .append("polygon")
            .attr("id", index)
            .attr("points", "25,0 50,25 25,50 0,25")
            .attr("class", "nodes polygon-style")
            .attr("transform", `matrix(1 0 0 1 ${element.x - 25} ${element.y - 25} )`)
            .on("click", (d, i, s) => {
              let arr = s[0].attributes.transform.value.split(" ");
              this.menuOptions.x = +arr[4] + 60 + "px";
              this.menuOptions.y = +arr[5] + 10 + "px";
              this.removeId = s[0].id;
              this.menuOptions.hide = false;
              d3.event.stopPropagation();
            })
            .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
          break;
        case 'rect':
          this.vis
            .append("rect")
            .attr("id", index)
            .attr("class", "nodes rect-style")
            .attr("x", element.x - 50)
            .attr("y", element.y - 40)
            .attr("width", 100)
            .attr("height", 80)
            .attr("rx", 10)
            .attr("ry", 10)
            .on("click", (d, i, s) => {
              this.menuOptions.x = +s[0].attributes.x.value + 112 + "px";
              this.menuOptions.y = +s[0].attributes.y.value + 10 + "px";
              this.removeId = s[0].id;
              this.menuOptions.hide = false;
              d3.event.stopPropagation();
            })
            .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended))

          break;
        default:
          break;
      }
    })

    function dragstarted(d) {
      d3.select(this).raise().classed("active", true);
    }
    let self = this;
    function dragged(d) {
      self.data[this.getAttribute('id')].x = d3.event.x;
      self.data[this.getAttribute('id')].y = d3.event.y;
      self.removeAll();
      self.drow();
    }

    function dragended(d) {
      d3.select(this).classed("active", false);
    }

    localStorage.setItem("data", JSON.stringify(this.data));

  }

  removeAll() {
    d3.selectAll("line").remove();
    d3.selectAll("polygon").remove();
    d3.selectAll("rect").remove();
    d3.selectAll("circle").remove();
  }

  drowLines() {
    this.data.forEach((e, i, a) => {
      if (a[i + 1]) {
        let x = +e.x;
        let y = +e.y;
        let x2 = +a[i + 1].x;
        let y2 = +a[i + 1].y;
        let minX = Math.abs(x - x2); 
        let minY = Math.abs(y - y2); 
        if (minX > minY)
          if (+x < +x2) {
            x += 28;
            x2 -= 28;
          } else {
            x -= 28;
            x2 += 28;
          }
        else
          if (+y < +y2) {
            y += 28;
            y2 -= 28;
          } else {
            y -= 28;
            y2 += 28;
          }
        this.vis
          .append("line")
          .attr("x1", x)
          .attr("y1", y)
          .attr("x2", x2)
          .attr("y2", y2)
          .style("stroke", "rgb(6,120,155)")

          .attr("marker-end", "url(#triangle)")
        //    .append("marker")
        // .attr({
        // 	"id":"arrow",
        // 	"viewBox":"0 -5 10 10",
        // 	"refX":5,
        // 	"refY":0,
        // 	"markerWidth":4,
        // 	"markerHeight":4,
        // 	"orient":"auto"
        // })
        // .append("path")
        // 	.attr("d", "M0,-5L10,0L0,5")
        // 	.attr("class","arrowHead");
      }
    })

  }
  downloadJsonHref
  generateDownloadJsonUri() {
    var theJSON = JSON.stringify(this.data);
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadJsonHref = uri;
  }
  public fileChangeEvent(event) {
    var file = event.srcElement.files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        this.data = JSON.parse(evt.target['result']);
        this.removeAll();
        this.drow();
      }
      reader.onerror = function (evt) {
        console.log('error reading file');
      }
    }
  }

  edit;
  editText = "";
  editIndex;

  doubleClick(item, i) {
    this.edit = item;
    this.editIndex = i;
  }

  enterEdit() {
    this.data[this.editIndex].text = this.editText;
    this.editText = "";
    this.edit = null;
    this.removeAll();
    this.drow();
  }
}