var getChartData = function() {
	var chartDataBlocks = $('.chart-data');
	if (chartDataBlocks.length < 1) {
		return null;
	}

	return $.map(chartDataBlocks, function(block, i) {
		return JSON.parse($(block).html());
	});
}

var drawChart = function() {
	var charts = getChartData();
	if (!charts) {
		return;
	}

	charts.forEach(function(chartData) {
		var dataTable = new google.visualization.DataTable();

		for (i in chartData.tableColumns) {
			var column = chartData.tableColumns[i];
			var dataType = column[0];

			dataTable.addColumn(dataType, column[1], column[2]);

			if (dataType == 'date') {
				for (var rowIdx in chartData.tableData) {
					var row = chartData.tableData[rowIdx];
					row[i] = new Date(row[i]);
				}
			}
		}

		dataTable.addRows(chartData.tableData);

		new google.visualization.AreaChart($(chartData.chartContainerSelector)[0]).draw(dataTable, {
			title: chartData.title,
			height: chartData.height,
		});
	});
}

$(document).ready(function() {
	var filterAreaAttrName = 'data-filter-area-for';
	var filterLinkAttrName = 'data-filter-value';
	var visibleWhenJsIsEnabledAttrName = 'data-visible-with-js-enabled';
	var hiddenWhenJsIsEnabledAttrName = 'data-hidden-with-js-enabled';

	var romTable = $('#rom-table');
	var romDataTable = romTable.DataTable({
		'bLengthChange': false,
		'bPaginate': false,
		'bAutoWidth': false,
		'bFilter': true,
		'aaSorting': [ /* The values are pre-sorted on server side. */ ],
		'aoColumnDefs': [
			{
				'bSortable': false,
				'aTargets': [ 'col-filename' ],
			}
		],
		'sDom': 'lrtip', /* Disable the search box */
	});

	$('[' + filterAreaAttrName + ']').each(function(featureAreaIdx, filterAreaElement) {
		var filterArea = $(filterAreaElement);
		var filterColumn = romDataTable.column(filterArea.attr(filterAreaAttrName));
		var filterValueList = filterArea.find('ul');

		var filterData = filterColumn.data().unique().sort();
		filterData.each(function(filterValue, filterValueIdx) {
			var filterLink = '<li><a href="#" #FilterAttrName#="#FilterValue#" title="Show only the files for update-type #FilterValue#">#FilterValue#</a></li>';
			filterValueList.append(filterLink.replace(/#FilterAttrName#/g, filterLinkAttrName).replace(/#FilterValue#/g, filterValue));
		});

		filterValueList.find('a[' + filterLinkAttrName + ']').click(function() {
			var clickedLink = $(this);
			filterColumn.search(clickedLink.attr(filterLinkAttrName)).draw();
			filterValueList.find('.active').removeClass('active');
			clickedLink.parent().addClass('active');
			return false;
		});

		if (filterData.length <= 1) {
			/* Nothing to filter -> keep the extra sidebar hidden. */
			filterArea.removeAttr(visibleWhenJsIsEnabledAttrName);
		}
	});

	/* Elements with this value set should have 'hidden' set by default! */
	$('[' + visibleWhenJsIsEnabledAttrName + ']').removeClass('hidden').addClass('shown');
	$('[' + hiddenWhenJsIsEnabledAttrName + ']').removeClass('shown').addClass('hidden');
});

$(window).resize(function() {
	drawChart();
});

if (typeof google !== 'undefined') {
	google.load('visualization', '1', { packages: [ 'corechart' ] });
	google.setOnLoadCallback(drawChart);
}
