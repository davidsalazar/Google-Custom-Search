
(function($) {
	
	$.fn.google_custom_search = function(options) {  

		var settings = {
			google_custom_search_api_key: '',
			google_custom_search_cx: '',
			input_selector: '#google_search_q',
			search_results_selector: '#google_search_results',
			search_results_template_selector: '#google_search_template'
		};

		if (options)
		{ 
			$.extend(settings, options);
		}
		
		var google_search_template = Handlebars.compile($(settings.search_results_template_selector).html());
		var google_search_args = {
			'key': settings.google_custom_search_api_key,
			'cx': settings.google_custom_search_cx,
			'alt': 'json',
			'num': 10
		};

		var error_handler = function(error) {
			$(settings.search_results_selector).html(google_search_template({'error': error}));
			
			return true;
		};
		
		var googlesearch = function(start) {
			var new_search_args = google_search_args;
			var start = Math.abs(parseInt(start));
			new_search_args['start'] = start;
			$.getJSON('https://www.googleapis.com/customsearch/v1?callback=?', new_search_args, function(results) {
				if ('error' in results)
				{
					return error_handler("We're sorry there was an error performing your search. " + results.error.message);
				}
				else
				{
					var pager = {
						'prev': results.queries.previousPage ? results.queries.previousPage[0].startIndex : null,
						'next': results.queries.nextPage ? results.queries.nextPage[0].startIndex : null,
					};
								
					if (!pager.prev && !pager.next)
					{
						pager = false;
					}
					
					var item_count = parseInt(results.queries.request && results.queries.request[0].totalResults ? results.queries.request[0].totalResults : 0);
					var items = [];
					if (results.items)
					{
						$.each(results.items, function(k, v) {
							items.push({'title': v.htmlTitle, 'description': v.htmlSnippet, 'link': v.link});
						});							
					}
					
					$(settings.search_results_selector).html(google_search_template({'pager': pager, 'items': items.length ? items : false, 'item_count': item_count, 'item_offset': start, 'item_offset_end': start + Math.min(item_count - start, 9)}));
								
				}
		
				// console.log(results);
			});
		}


		this.submit(function(e) {
			e.preventDefault();
			google_search_args.q = $(settings.input_selector).val();
			googlesearch(1);
			
			return false;
		});
		
		$('.google_search_pager a', settings.search_results_selector).live('click', function() {
			var $this = $(this);
			if (start = $this.attr('data-start'))
			{
				googlesearch(start);	
			}
		});

	};
	

	
})(jQuery);

