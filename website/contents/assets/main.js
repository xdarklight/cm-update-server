$(document).ready(function() {
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

	var updateTypeColumn = romDataTable.column('.col-updatechannel');
	var updateTypeList = $('#updateTypeFilters').find('ul');
	
	updateTypeColumn.data().unique().sort().each(function(value, idx) {
		updateTypeList.append('<li class="updatetype-filter"><a href="#" data-filter-value="' + value + '">' + value + '</a></li>');
	});

	$('#updateTypeFilters').removeClass('hidden').addClass('show');

	$(updateTypeList).find('a[data-filter-value]').click(function() {
		var clickedLink = $(this);
		updateTypeColumn.search(clickedLink.attr('data-filter-value')).draw();
		updateTypeList.find('.active').removeClass('active');
		clickedLink.parent().addClass('active');
		return false;
	});
});
