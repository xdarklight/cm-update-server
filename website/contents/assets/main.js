var createChartDataTable = function() {
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('date', 'Date');

	return dataTable;
}

var getChartData = function() {
	var chartDataBlock = $('#chart-data');
	if (chartDataBlock.length < 1) {
		return null;
	}

	return JSON.parse(chartDataBlock.html());
}

var drawChart = function() {
	var downloadsByDate = {};

	var fullDownloadData = createChartDataTable();
	var incrementalDownloadData = createChartDataTable();

	getChartData().forEach(function(deviceStatistics) {
		fullDownloadData.addColumn('number', deviceStatistics.device);
		incrementalDownloadData.addColumn('number', deviceStatistics.device);

		if (deviceStatistics.downloads) {
			for (date in deviceStatistics.downloads) {
				if (!downloadsByDate[date]) {
					downloadsByDate[date] = [];
				}

				downloadsByDate[date].push(deviceStatistics.downloads[date]);
			};
		}
	});

	for (date in downloadsByDate) {
		var formattedDate = new Date(parseInt(date));

		var fullDownloadRow = [ formattedDate ];
		var incrementalDownloadRow = [ formattedDate ];

		downloadsByDate[date].forEach(function(deviceStatRow) {
			fullDownloadRow.push(deviceStatRow.full);
			incrementalDownloadRow.push(deviceStatRow.incremental);
		});

		fullDownloadData.addRow(fullDownloadRow);
		incrementalDownloadData.addRow(incrementalDownloadRow);
	};

	new google.visualization.AreaChart($('#full-downloads-chart')[0]).draw(fullDownloadData, {
		title: 'Full ZIP downloads',
		height: 350,
	});
	new google.visualization.AreaChart($('#incremental-downloads-chart')[0]).draw(incrementalDownloadData, {
		title: 'Incremental update downloads',
		height: 350,
	});
}

$(document).ready(function() {
	var filterAreaAttrName = 'data-filter-area-for';
	var filterLinkAttrName = 'data-filter-value';
	var visibleWhenJsIsEnabledAttrName = 'data-visible-with-js-enabled';

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

	/* Elements with this value set should have 'hidden' set by default! */
	$('[' + visibleWhenJsIsEnabledAttrName + ']').removeClass('hidden').addClass('shown');

	$('[' + filterAreaAttrName + ']').each(function(featureAreaIdx, filterAreaElement) {
		var filterArea = $(filterAreaElement);
		var filterColumn = romDataTable.column(filterArea.attr(filterAreaAttrName));
		var filterValueList = filterArea.find('ul');

		filterColumn.data().unique().sort().each(function(filterValue, filterValueIdx) {
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
	});
});

$(window).resize(function() {
	drawChart();
});

if (typeof google !== 'undefined') {
	google.load('visualization', '1', { packages: [ 'corechart' ] });
	google.setOnLoadCallback(drawChart);
}
