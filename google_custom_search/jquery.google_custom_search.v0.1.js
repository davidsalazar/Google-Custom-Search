
(function($) {
	
	$.fn.google_custom_search = function(options) {  

		var settings = {
			google_custom_search_api_key: '',
			google_custom_search_cx: '',
			input_selector: '#google_search_q',
			search_results_selector: '#google_search_results',
			search_results_template_selector: '#google_search_template',
			no_br: true
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
		
		var toggle_loader = function($search_results, $search_results_loading) {
			if ($search_results_loading.length)
			{
				$search_results_loading.toggle();
				$search_results.toggle();	
			}
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
					var $search_results = $(settings.search_results_selector);
					var $search_results_loading = $(settings.search_results_selector + '_loading');
					
					toggle_loader($search_results, $search_results_loading);
					
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
							if (settings.no_br)
							{
								items.push({'title_html': v.htmlTitle.replace(/<br( ?\/)?>/i, ''), 'description_html': v.htmlSnippet.replace(/<br( ?\/)?>/i, ''), 'title': v.title, 'description': v.snippet, 'link': v.link});
							}
							else
							{
								items.push({'title_html': v.htmlTitle, 'description_html': v.htmlSnippet, 'title': v.title, 'description': v.snippet, 'link': v.link});	
							}
						});							
					}
					
					$search_results.html(google_search_template({'search_q': new_search_args.q, 'pager': pager, 'items': items.length ? items : false, 'item_count': item_count, 'item_offset': start, 'item_offset_end': start + Math.min(item_count - start, 9)}));
					toggle_loader($search_results, $search_results_loading);
				}
		
				console.log(results);
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

