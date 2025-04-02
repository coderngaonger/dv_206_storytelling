function loadQ1Chart() {
    d3.select("#chart").html("");
    d3.select("#legend").html("");
    d3.select("#title").html("<h2 style='text-align: center; margin-bottom: 20px;'>Doanh số bán hàng theo Mặt hàng</h2>"); // 🟢 Thêm tiêu đề biểu đồ

    d3.csv("data.csv").then(function(data) {
        const revenueByItem = d3.rollup(data, 
            v => ({
                revenue: d3.sum(v, d => +d["Thành tiền"]),
                quantity: d3.sum(v, d => +d["SL"])
            }), 
            d => `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`,
            d => `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`
        );

        const dataset = Array.from(revenueByItem, ([item, groupMap]) => {
            let group = Array.from(groupMap.keys())[0];
            let data = groupMap.get(group);
            return { item, group, revenue: data.revenue, quantity: data.quantity };
        }).sort((a, b) => d3.descending(a.revenue, b.revenue));

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain([...new Set(dataset.map(d => d.group))]);

        const margin = { top: 70, right: 250, bottom: 50, left: 300 }; // 🟢 Tăng margin top để chừa chỗ cho tiêu đề
        const width = 1300 - margin.left - margin.right;
        const height = dataset.length * 30 + 50;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // 🟢 Thêm tiêu đề biểu đồ vào SVG
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -30) // Dịch lên trên để không bị trùng nội dung
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "#333")
            .text("Doanh số bán hàng theo Mặt hàng");

        const y = d3.scaleBand()
            .domain(dataset.map(d => d.item))
            .range([0, height - 50])
            .padding(0.2);

        const x = d3.scaleLinear()
            .domain([0, Math.ceil(d3.max(dataset, d => d.revenue) / 100000000) * 100000000])
            .range([0, width]);

        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
            .attr("class", "axis-label");

        svg.append("g")
            .attr("transform", `translate(0, ${height - 50})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.format(".2s")(d).replace(/G/, 'B').replace(/M/, 'M')));

        const tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("color", "#fff")
            .style("padding", "6px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("visibility", "hidden");

        svg.selectAll(".bar")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", d => y(d.item))
            .attr("width", d => x(d.revenue))
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.group))
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`
                        <strong>Mặt hàng:</strong> ${d.item}<br>
                        <strong>Nhóm hàng:</strong> ${d.group}<br>
                        <strong>Doanh số bán:</strong> ${d3.format(",")(d.revenue)} VND<br>
                        <strong>Số lượng bán:</strong> ${d3.format(",")(d.quantity)} SKUs<br>
                    `);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        svg.selectAll(".label")
            .data(dataset)
            .enter()
            .append("text")
            .attr("x", d => x(d.revenue) + 5)
            .attr("y", d => y(d.item) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .text(d => d3.format(",.0f")(d.revenue / 1000000) + " triệu VND")
            .style("font-size", "12px")
            .style("fill", "black");

        // 🟢 Thêm chú thích nhóm hàng (Legend)
        const legendContainer = d3.select("#legend")
            .style("display", "block")
            .style("padding", "10px")
            .style("border", "1px solid #ccc")
            .style("background", "#f9f9f9")
            .style("width", "200px");
        
        legendContainer.append("div")
            .style("font-weight", "bold")
            .style("margin-bottom", "5px")
            .text("Nhóm hàng");
        
        const legend = legendContainer.selectAll(".legend-item")
            .data(colorScale.domain())
            .enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin", "5px 0");
        
        legend.append("div")
            .style("width", "18px")
            .style("height", "18px")
            .style("background-color", d => colorScale(d))
            .style("margin-right", "8px");
        
        legend.append("span")
            .text(d => d);
    });
}
