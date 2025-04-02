function loadQ15Chart() {
    d3.select("#chart").html("");
    d3.select("#legend").html("");
  
    d3.csv("data.csv").then(function(data) {
      // Tính tổng đơn hàng
      const orderTotalMap = d3.rollup(
        data,
        v => d3.sum(v, d => +d["Thành tiền"]),
        d => d["Mã đơn hàng"]
      );
  
      // Gán Tổng đơn hàng cho từng dòng
      data.forEach(d => {
        d.TổngĐơn = orderTotalMap.get(d["Mã đơn hàng"]) || 0;
      });
  
      // Tính trung bình đơn hàng chứa mỗi sản phẩm
      const baitMap = d3.rollup(
        data,
        v => d3.mean(v, d => d.TổngĐơn),
        d => d["Tên mặt hàng"]
      );
  
      const baitArray = Array.from(baitMap, ([name, value]) => ({
        name: name,
        value: value
      })).sort((a, b) => d3.descending(a.value, b.value)).slice(0, 10);
  
      // Vẽ biểu đồ
      const margin = { top: 50, right: 30, bottom: 100, left: 150 },
            width = 1000 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
  
      const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
      const x = d3.scaleLinear()
        .domain([0, d3.max(baitArray, d => d.value)])
        .range([0, width]);
  
      const y = d3.scaleBand()
        .domain(baitArray.map(d => d.name))
        .range([0, height])
        .padding(0.2);
  
      const color = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(baitArray, d => d.value)]);
  
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "#fff")
        .style("padding", "6px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("visibility", "hidden");
  
      // Bar chart
      svg.selectAll(".bar")
        .data(baitArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.name))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.value))
        .attr("fill", d => color(d.value))
        .on("mouseover", (event, d) => {
          tooltip.html(`<strong>${d.name}</strong><br>Trung bình đơn hàng: ${d3.format(",")(d.value.toFixed(0))} VNĐ`)
            .style("visibility", "visible");
        })
        .on("mousemove", event => {
          tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
  
      // Hiển thị số
      svg.selectAll(".label")
        .data(baitArray)
        .enter()
        .append("text")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.name) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "#333")
        .text(d => d3.format(",.0f")(d.value));
  
      // Trục
      svg.append("g")
        .call(d3.axisLeft(y));
  
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.format(",")(d)));
  
      // Tiêu đề
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Top sản phẩm thường xuất hiện trong đơn hàng giá trị cao");
  
      // Legend
      d3.select("#legend").html(`<strong>Giải thích:</strong> Biểu đồ thể hiện <em>giá trị trung bình</em> của các đơn hàng chứa mỗi sản phẩm.`);
  
    }).catch(error => console.error("Lỗi khi xử lý dữ liệu:", error));
}
  