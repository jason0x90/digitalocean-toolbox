KangoAPI.onReady(function() {

	var estimated_total_cost_per_month = 0;

	kango.console.log('Loading popup.');

	if (kango.storage.getItem('do_manager_client_id') == null || kango.storage.getItem('do_manager_api_key') == null)
	{
		kango.ui.optionsPage.open();

		$("#loading_bar").hide();
		$("#api_failed").hide();
		$("#api_failed_options_opened").show();
		$("#edit_options").click(function(){
			kango.ui.optionsPage.open();
		});
	}
	else
	{
		kango.dispatchMessage('refresh_api_cache', true);

		var details = {
	        method: 'GET',
	        url: 'https://api.digitalocean.com/droplets/?client_id='+kango.storage.getItem('do_manager_client_id')+'&api_key='+kango.storage.getItem('do_manager_api_key'),
	        async: true,
	        contentType: 'json'
		};

		kango.xhr.send(details, function(request) {
			if(request.status == 200 && request.response != null) 
			{
				var info = request.response;
				if (info.status == "OK") 
				{
					kango.console.log('Popup Get Droplets: API returned OK!');

					$.each(info.droplets, function(row, object) 
					{
						var droplet_id = object.id;
						object.region_name = kango.storage.getItem('regions_id_'+object.region_id+'_name');
						object.region_slug = kango.storage.getItem('regions_id_'+object.region_id+'_slug');

						object.size_name = kango.storage.getItem('sizes_id_'+object.size_id+'_name');	
						object.size_slug = kango.storage.getItem('sizes_id_'+object.size_id+'_slug');	
						object.size_mem = kango.storage.getItem('sizes_id_'+object.size_id+'_memory');	
						object.size_cpu = kango.storage.getItem('sizes_id_'+object.size_id+'_cpu');	
						object.size_disk = kango.storage.getItem('sizes_id_'+object.size_id+'_disk');	
						object.size_cost_per_hour = kango.storage.getItem('sizes_id_'+object.size_id+'_cost_per_hour');	
						object.size_cost_per_month = kango.storage.getItem('sizes_id_'+object.size_id+'_cost_per_month');	

						estimated_total_cost_per_month = (estimated_total_cost_per_month + parseInt(object.size_cost_per_month));

						if (kango.storage.getItem('images_id_'+object.image_id+'_name'))
						{
							object.show_image_info = true;
							object.image_name = kango.storage.getItem('images_id_'+object.image_id+'_name');
							object.image_dist = kango.storage.getItem('images_id_'+object.image_id+'_distribution');
							object.image_slug = kango.storage.getItem('images_id_'+object.image_id+'_slug');
						}
						else
						{
							object.show_image_info = false;
						}

						kango.console.log(object);

						$('#do_droplets_ul').html($('#do_droplets_ul').html()+'<li id="do_ul_'+droplet_id+'"></li>');
						$('#do_droplets_info').html($('#do_droplets_info').html()+'<div class="tab-pane" id="do_id_'+droplet_id+'"></div>');

						var template = $.templates("#panel_template");
						var template2 = $.templates("#do_droplets_ul_template");

						template.link("#do_id_"+object.id, object);
						template2.link("#do_ul_"+object.id, object);
					});

					if (estimated_total_cost_per_month > 0)
					{
						$("#estimated_total_cost").html("$"+estimated_total_cost_per_month+" / mo");
						$("#estimated_alert").show();
					}

					$("#api_failed").hide();
					$("#api_failed_options_opened").hide();

					$('#do_droplets_ul a:first').tab('show');

					$.each(info.droplets, function(row, object) 
					{
						$("#do_open_panel_"+object.id).click(function(){
							kango.browser.tabs.create({url:'https://cloud.digitalocean.com/droplets/'+object.id});
						});
						$("#do_restart_"+object.id).click(function(){
							if (confirm("Are you sure you wish to Restart this droplet?"))
							{
								var details = {
							        method: 'GET',
							        url: 'https://api.digitalocean.com/droplets/'+object.id+'/reboot/?client_id='+kango.storage.getItem('do_manager_client_id')+'&api_key='+kango.storage.getItem('do_manager_api_key'),
							        async: true,
							        contentType: 'json'
								};

								kango.xhr.send(details, function(request) {
									if(request.status == 200 && request.response != null) 
									{
										var info = request.response;
										if (info.status == "OK") 
										{
											alert('Successfully sent Restart signal.  This panel may take a few minutes to reflect status.');
										}
									}
								});
							}
						});
						$("#do_power_off_"+object.id).click(function(){
							if (confirm("Are you sure you wish to Power OFF this droplet?"))
							{
								var details = {
							        method: 'GET',
							        url: 'https://api.digitalocean.com/droplets/'+object.id+'/power_off/?client_id='+kango.storage.getItem('do_manager_client_id')+'&api_key='+kango.storage.getItem('do_manager_api_key'),
							        async: true,
							        contentType: 'json'
								};

								kango.xhr.send(details, function(request) {
									if(request.status == 200 && request.response != null) 
									{
										var info = request.response;
										if (info.status == "OK") 
										{
											alert('Successfully sent Power OFF signal.  This panel may take a few minutes to reflect status.');
										}
									}
								});	
							}
						});
						$("#do_power_on_"+object.id).click(function(){
							if (confirm("Are you sure you wish to Power ON this droplet?"))
							{
								var details = {
							        method: 'GET',
							        url: 'https://api.digitalocean.com/droplets/'+object.id+'/power_on/?client_id='+kango.storage.getItem('do_manager_client_id')+'&api_key='+kango.storage.getItem('do_manager_api_key'),
							        async: true,
							        contentType: 'json'
								};

								kango.xhr.send(details, function(request) {
									if(request.status == 200 && request.response != null) 
									{
										var info = request.response;
										if (info.status == "OK") 
										{
											alert('Successfully sent Power ON signal.  This panel may take a few minutes to reflect status.');
										}
									}
								});	
							}
						});
					});
				}
				else
				{
					$("#loading_bar").hide();
					$("#api_failed").show();
					$("#api_failed_options_opened").hide();
					kango.console.log('Popup Get Droplets: API return non-OK status.');
				}
			}
			else
			{
				$("#loading_bar").hide();
				$("#api_failed").show();
				$("#api_failed_options_opened").hide();
				kango.console.log('Popup Get Droplets: API key invalid.');
			}	
		});

		$("#loading_bar").hide();
		$("#edit_options").click(function(){
			kango.ui.optionsPage.open();
		});
	  $('body').tooltip({
	    selector: "a[data-toggle=tooltip]"
	  });
	}
});
