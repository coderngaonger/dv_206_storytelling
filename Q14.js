function loadQ14Chart() {
    d3.select("#chart").html("");
    d3.select("#legend").html("");
  
    d3.csv("data.csv").then(function(data) {
      const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
  
      data.forEach(d => {
        const date = parseTime(d["Thời gian tạo đơn"]);
        d.hour = date.getHours();
        d.weekday = date.getDay();
        d.weekdayLabel = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][d.weekday];
      });
  
      const nested = d3.rollup(
        data,
        v => new Set(v.map(d => d["Mã đơn hàng"])).size,
        d => d.weekdayLabel,
        d => d.hour
      );
  
      const hours = d3.range(8, 24);  // ✅ chỉ từ 8h đến 23h
      const weekdayOrder = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
      let dataset = [];
  
      weekdayOrder.forEach(weekday => {
        hours.forEach(hour => {
          const count = nested.get(weekday)?.get(hour) || 0;
          dataset.push({ weekday, hour, count });
        });
      });
  
      const margin = { top: 60, right: 20, bottom: 50, left: 100 },
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
  
      const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const x = d3.scaleBand().domain(hours).range([0, width]).padding(0.05);
      const y = d3.scaleBand().domain(weekdayOrder).range([0, height]).padding(0.05);
      const color = d3.scaleSequential(d3.interpolateYlGnBu)
                      .domain([0, d3.max(dataset, d => d.count)]);
  
      const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "#fff")
        .style("padding", "6px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("visibility", "hidden");
  
      svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => x(d.hour))
        .attr("y", d => y(d.weekday))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => color(d.count))
        .attr("stroke", "#eee")
        .on("mouseover", function(event, d) {
          tooltip.html(`<strong>${d.weekday}, ${d.hour}h</strong><br>${d.count} đơn hàng`)
                 .style("visibility", "visible");
        })
        .on("mousemove", event => {
          tooltip.style("top", `${event.pageY - 10}px`)
                 .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
  
      svg.selectAll("text.cell-label")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "cell-label")
        .attr("x", d => x(d.hour) + x.bandwidth() / 2)
        .attr("y", d => y(d.weekday) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", d => d.count > 0.5 * color.domain()[1] ? "#fff" : "#333")
        .text(d => d.count);
  
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `${d}h`));
  
      svg.append("g")
        .call(d3.axisLeft(y));
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text("Heatmap – Số đơn hàng theo Giờ (8h–23h) và Thứ trong tuần");
  
    }).catch(error => console.error("Lỗi khi load dữ liệu:", error));
  }
  