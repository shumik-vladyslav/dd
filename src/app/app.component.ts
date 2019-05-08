import { Component, OnInit } from '@angular/core';

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
  vis
  constructor() {

  }

  data = [
    { type: 'circle', x: 30, y: 50 },
    { type: 'polygon', x: 250, y: 80 },
    { type: 'rect', x: 130, y: 150 },
    { type: 'circle', x: 230, y: 250 },
  ];

  dragType;

  menuOptions = {
    hide: true,
    x: "0px",
    y: "0px"
  };

  removeId;

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

  }

  drowInfo() {
    document.getElementById("close").addEventListener('click', ev => {
      console.log("close")
      this.removeAll();
      this.data.splice(this.removeId, 1);
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
            .attr("transform", `matrix(1 0 0 1 ${element.x - 25} ${element.y - 25})`)
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
              this.menuOptions.x = +s[0].attributes.x.value + 110 + "px";
              this.menuOptions.y = +s[0].attributes.y.value + 90 + "px";
              this.removeId = s[0].id;
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
  }

  removeAll(){
    d3.selectAll("line").remove();
    d3.selectAll("polygon").remove();
    d3.selectAll("rect").remove();
    d3.selectAll("circle").remove();
  }

  drowLines() {
    this.data.forEach((e, i, a) => {
      if (a[i + 1])
        this.vis
          .append("line")
          .attr("x1", e.x)
          .attr("y1", e.y)
          .attr("x2", a[i + 1].x)
          .attr("y2", a[i + 1].y)
          .style("stroke", "rgb(6,120,155)");
    })

  }
}