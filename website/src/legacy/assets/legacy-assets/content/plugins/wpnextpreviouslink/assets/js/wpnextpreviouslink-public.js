(function ($) {
	'use strict';

	$(document).ready(function () {

		var retryCounter = 0;
		function wpnextpreviouslink_check_ga_loaded() {
			if ((typeof ga === 'function' && ga.loaded) || retryCounter++ > 5) {
				var $ga_exists              = (typeof ga === 'function' && ga.loaded) ? true: false;
				var $ga_enable 			   = parseInt(wpnextpreviouslink_public.ga_enable);

				$ga_enable = ($ga_enable && $ga_exists); //if ga enabled and site has ga code added

				var $ga_view_track		   = parseInt(wpnextpreviouslink_public.track_view);
				var $ga_click_track		   = parseInt(wpnextpreviouslink_public.track_click);
				var $ga_track_pbr		   = parseInt(wpnextpreviouslink_public.track_pbr);
				var $view_click_title	   = wpnextpreviouslink_public.title;

				if($ga_enable && ($ga_view_track || $ga_click_track)){
					if($ga_view_track){
						ga(
							'send',
							'event',
							'wpnextpreviouslink', // eventCategory
							'show',// eventAction
							$view_click_title, // eventValue
							{
								nonInteraction: ($ga_track_pbr)? true : false
							}
						);
					}

					if($ga_click_track){
						$('.wpnp_anchor_js').on('click', function (event) {
							ga(
								'send',
								'event',
								'upPrev',
								'click',
								$view_click_title,
								{
									transport: 'beacon',
									nonInteraction: ($ga_track_pbr)? true : false
								}
							);

						});


					}
				}

			}
			else {
				// Retry.				
				setTimeout(wpnextpreviouslink_check_ga_loaded, 500);
			}
		}

		wpnextpreviouslink_check_ga_loaded();

	});//end dom ready

})(jQuery);