KangoAPI.onReady(function() {

		if (kango.storage.getItem("do_manager_client_id"))
		{
			$("#do_client_id").val(kango.storage.getItem("do_manager_client_id"));
		}

		if (kango.storage.getItem("do_manager_client_id"))
		{
			$("#do_api_key").val(kango.storage.getItem("do_manager_api_key"));
		}

		$('#save_options').click(function(event)
		{
			var api_success = false;

			var details = {
		        method: 'GET',
		        url: 'https://api.digitalocean.com/droplets/?client_id='+$("#do_client_id").val()+'&api_key='+$("#do_api_key").val(),
		        async: false,
		        contentType: 'json'
			};

			kango.xhr.send(details, function(request) {
				if(request.status == 200 && request.response != null) 
				{
					var info = request.response;
					if (info.status == "OK") 
					{
						api_success = true;									
					}
					else
					{
						api_success = false;
					}
				}
				else
				{
					api_success = false;
				}
			});

			if (api_success)
			{
				kango.storage.setItem("do_manager_client_id", $("#do_client_id").val());
				kango.storage.setItem("do_manager_api_key", $("#do_api_key").val());
				kango.dispatchMessage('refresh_api_cache', true);
				$("#options_success").modal({
					backdrop: 'static',
				  keyboard: false
				});
			}
			else
			{
				$("#options_fail_api").modal({
					backdrop: 'static',
				  keyboard: false
				});
			}
		});		
});
