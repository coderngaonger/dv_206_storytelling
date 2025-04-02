function loadQ13Chart() {
    d3.select("#chart").html("");
    d3.select("#legend").html("");
  
    d3.csv("data.csv").then(function(data) {
      // 🟢 B1: Tính combo sản phẩm từ đơn hàng
      const orders = d3.group(data, d => d["Mã đơn hàng"]);
      const co_occur = new Map();
  
      orders.forEach((rows) => {
        const items = [...new Set(rows.map(d => d["Tên mặt hàng"]))];
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const combo = [items[i], items[j]].sort().join(" + ");
            co_occur.set(combo, (co_occur.get(combo) || 0) + 1);
          }
        }
      });
  
      // 🟢 B2: Top 10 combo phổ biến nhất
      const topCombos = Array.from(co_occur.entries())
        .map(([combo, value]) => ({ combo, value }))
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0, 10);
  
      const margin = { top: 50, right: 50, bottom: 50, left: 300 },
            width = 1200 - margin.left - margin.right,
            height = topCombos.length * 40;
  
      const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // 🟢 B3: Thêm tiêu đề
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text("Top 10 Cặp Sản Phẩm Thường Được Mua Chung");
  
      // 🟢 B4: Scale
      const x = d3.scaleLinear()
        .domain([0, d3.max(topCombos, d => d.value)])
        .range([0, width]);
  
      const y = d3.scaleBand()
        .domain(topCombos.map(d => d.combo))
        .range([0, height])
        .padding(0.2);
  
      // 🟢 B5: Trục
      svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(5));
  
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5));
  
      // 🟢 B6: Tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "#fff")
        .style("padding", "6px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("visibility", "hidden");
  
      // 🟢 B7: Vẽ bar chart
      svg.selectAll(".bar")
        .data(topCombos)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.combo))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.value))
        .attr("fill", "#69b3a2")
        .on("mouseover", (event, d) => {
          tooltip.html(`<strong>${d.combo}</strong><br>Số đơn hàng đi kèm: ${d.value}`)
            .style("visibility", "visible");
        })
        .on("mousemove", event => {
          tooltip.style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
  
      // 🟢 B8: Ghi số lượng phía sau mỗi bar
      svg.selectAll(".label")
        .data(topCombos)
        .enter()
        .append("text")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.combo) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "#333")
        .text(d => d.value);
  
      // 🟢 B9: Legend giả lập
      const legendContainer = d3.select("#legend")
        .style("display", "block")
        .style("margin-top", "20px")
        .style("font-size", "13px")
        .style("color", "#333")
        .html(`<strong>📦 Mỗi thanh biểu thị số đơn hàng chứa cặp sản phẩm đi kèm.</strong><br>
               Dữ liệu lấy từ file <code>data.csv</code>, xử lý trực tiếp bằng D3.js`);
  
    }).catch(error => {
      console.error("Lỗi khi load dữ liệu:", error);
    });
  }
  